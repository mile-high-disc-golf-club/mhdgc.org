import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import sharp from 'sharp'
import { expect, test } from 'vitest'

import { compileContent } from '../content.config'

test('compiles local images, metadata, Markdown and board references; rejects bad edits', async () => {
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
      '[{"name":"Test name","roles":[],"tenure":["Test tenure"],"photo":"board/logo.png"}]',
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
    const { data, assets } = await compileContent(root)
    expect(data.pages.test.html).toContain('<h2>Section</h2>')
    expect(data.pages.test.html).toContain('<strong>Copy</strong>')
    expect(data.pages.test.html).toContain('href="/about"')
    expect(data.pages.test.html).toContain('href="https://example.com/?a=1&amp;b=2"')
    expect(data.pages.test.ogImage).toEqual(data.images['photo.png'])
    expect(data.images['photo.png']).toMatchObject({ width: 400, height: 200 })
    // Opaque images fall back to JPEG; transparent ones keep PNG.
    expect(data.images['photo.png'].src).toMatch(/\.jpg$/)
    expect(data.images['board/logo.png'].src).toMatch(/\.png$/)
    expect(Object.keys(data.images)).toEqual(['board/logo.png', 'photo.png'])
    expect(data.board[0].photo).toBe('board/logo.png')
    expect(data.calendars).toEqual([calendar])
    expect(data.images['photo.png'].sources.map((source) => source.type)).toEqual([
      'image/avif',
      'image/webp',
    ])
    expect(data.images['photo.png'].sources[0].srcSet).toContain('320w')
    expect(data.images['photo.png'].sources[0].srcSet).not.toContain('640w')
    for (const [path, bytes] of assets) {
      const meta = await sharp(bytes).metadata()
      expect(meta.width).toBeLessThanOrEqual(400)
      expect(path).toMatch(/^\/content-assets\/[a-f0-9]{16}\./)
    }
    await writeFile(boardPath, '[{"name":"Test","roles":[],"tenure":["T"],"typo":true}]')
    await expect(compileContent(root)).rejects.toThrow()
    await writeFile(boardPath, '[{"name":"Test","roles":[],"tenure":["T"],"photo":"missing.png"}]')
    await expect(compileContent(root)).rejects.toThrow('Unknown content image')
    await writeFile(boardPath, '[{"name":"Test","roles":[],"tenure":[]}]')
    await expect(compileContent(root)).rejects.toThrow()
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
      await expect(compileContent(root)).rejects.toThrow()
    }
    await writeFile(boardPath, '{invalid json')
    await expect(compileContent(root)).rejects.toThrow()
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
      await expect(compileContent(root)).rejects.toThrow()
    }
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})
