import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import sharp from 'sharp'
import { expect, test } from 'vitest'

import { compileContent } from '../content.config'

import { contentAssetsOrigin } from '~shared/content-assets'

test('compiles images, metadata, Markdown and board references; rejects bad edits', async () => {
  const root = await mkdtemp(join(tmpdir(), 'mhdgc-content-'))
  try {
    await mkdir(join(root, 'images', 'board'), { recursive: true })
    await mkdir(join(root, 'pages'))
    await writeFile(join(root, 'images', '.gitkeep'), '')
    await mkdir(join(root, 'images', '.thumbs'))
    await writeFile(join(root, 'images', '.thumbs', 'notes.txt'), '')
    await writeFile(
      join(root, 'images', 'photo.png'),
      await sharp({ create: { width: 400, height: 200, channels: 3, background: '#123456' } })
        .png()
        .toBuffer(),
    )
    await writeFile(
      join(root, 'images', 'board', 'logo.png'),
      await sharp({
        create: {
          width: 100,
          height: 100,
          channels: 4,
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        },
      })
        .png()
        .toBuffer(),
    )
    const page =
      '---\ntitle: Test\ndescription: Test description\nogImage: photo.png\n---\n## Section\n\n**Copy** with [link](/about) and [query](https://example.com/?a=1&b=2).'
    const pagePath = join(root, 'pages', 'test.md')
    const boardPath = join(root, 'board.json')
    await writeFile(pagePath, page)
    await writeFile(
      boardPath,
      '[{"name":"Test name","roles":[],"tenure":["Test tenure"],"photo":"/content/images/board/logo.png"}]',
    )
    const calendarsPath = join(root, 'calendars.json')
    const calendar = {
      id: 'c_abc123@group.calendar.google.com',
      name: 'Test calendar',
      slug: 'test',
      icon: 'tag',
      color: 'event-tags',
    }
    await writeFile(calendarsPath, JSON.stringify([calendar]))
    const { data, assets } = await compileContent(root, { images: 'remote' })
    expect(data.pages.test.html).toContain('<h2>Section</h2>')
    expect(data.pages.test.html).toContain('<strong>Copy</strong>')
    expect(data.pages.test.html).toContain('href="/about"')
    expect(data.pages.test.html).toContain('href="https://example.com/?a=1&amp;b=2"')
    expect(data.pages.test.ogImage).toEqual(data.images['photo.png'])
    expect(data.images['photo.png']).toMatchObject({ width: 400, height: 200 })
    // Remote images link to R2 and add nothing to the build.
    expect(assets.size).toBe(0)
    const remote = new RegExp(`^${contentAssetsOrigin}/v1/[a-f0-9]{16}/`)
    expect(data.images['photo.png'].src).toMatch(remote)
    // Opaque images fall back to JPEG; transparent ones keep PNG.
    expect(data.images['photo.png'].src).toMatch(/\/400\.jpg$/)
    expect(data.images['board/logo.png'].src).toMatch(/\/100\.png$/)
    expect(Object.keys(data.images)).toEqual(['board/logo.png', 'photo.png'])
    expect(data.board[0].photo).toBe('board/logo.png')
    expect(data.calendars).toEqual([calendar])
    expect(data.images['photo.png'].sources.map((source) => source.type)).toEqual([
      'image/avif',
      'image/webp',
    ])
    // Never enlarged: 320 and the original's 400, but not 640.
    const avif = data.images['photo.png'].sources[0].srcSet.split(', ')
    expect(avif).toHaveLength(2)
    expect(avif[0]).toMatch(remote)
    expect(avif.map((candidate) => candidate.replace(/^\S+\//, ''))).toEqual([
      '320.avif 320w',
      '400.avif 400w',
    ])

    // Local images serve the originals, unencoded, from the site.
    const local = await compileContent(root, { images: 'local' })
    const localPhoto = local.data.images['photo.png']
    expect(localPhoto).toMatchObject({ width: 400, height: 200, sources: [] })
    expect(localPhoto.src).toMatch(/^\/content-assets\/[a-f0-9]{16}\.png$/)
    expect(local.assets.get(localPhoto.src)).toEqual(
      await readFile(join(root, 'images', 'photo.png')),
    )
    expect(local.data.pages.test.ogImage).toEqual(localPhoto)
    await writeFile(boardPath, '[{"name":"Test","roles":[],"tenure":["T"],"typo":true}]')
    await expect(compileContent(root, { images: 'remote' })).rejects.toThrow()
    await writeFile(
      boardPath,
      '[{"name":"Test","roles":[],"tenure":["T"],"photo":"/content/images/missing.png"}]',
    )
    await expect(compileContent(root, { images: 'remote' })).rejects.toThrow(
      'Unknown content image',
    )
    // A board photo is a repository path, as the CMS writes it.
    await writeFile(
      boardPath,
      '[{"name":"Test","roles":[],"tenure":["T"],"photo":"board/logo.png"}]',
    )
    await expect(compileContent(root, { images: 'remote' })).rejects.toThrow('/content/images/')
    await writeFile(boardPath, '[{"name":"Test","roles":[],"tenure":[]}]')
    await expect(compileContent(root, { images: 'remote' })).rejects.toThrow()
    await writeFile(boardPath, '[]')
    for (const invalid of [
      page.replace('title: Test\n', ''),
      page.replace('ogImage: photo.png', 'ogImage: missing.png'),
      `${page}\n<script>alert(1)</script>`,
      `${page}\n![photo](https://example.com/photo.jpg)`,
      `${page}\n[bad](javascript:alert(1))`,
      `${page}\n# Wrong heading`,
    ]) {
      await writeFile(pagePath, invalid)
      await expect(compileContent(root, { images: 'remote' })).rejects.toThrow()
    }
    await writeFile(boardPath, '{invalid json')
    await expect(compileContent(root, { images: 'remote' })).rejects.toThrow()
    await writeFile(boardPath, '[]')
    for (const invalid of [
      [],
      [{ ...calendar, id: 'c_abc123' }],
      [{ ...calendar, slug: 'Test Slug' }],
      [{ ...calendar, icon: 'Tag' }],
      [{ ...calendar, icon: 'flag' }],
      [{ ...calendar, color: 'blue-500' }],
      [{ ...calendar, color: 'event-test' }],
      [{ ...calendar, color: 'event-tags-soft' }],
      [{ ...calendar, enabled: true }],
      [calendar, { ...calendar, slug: 'other' }],
      [calendar, { ...calendar, id: 'c_other@group.calendar.google.com' }],
    ]) {
      await writeFile(calendarsPath, JSON.stringify(invalid))
      await expect(compileContent(root, { images: 'remote' })).rejects.toThrow()
    }
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})
