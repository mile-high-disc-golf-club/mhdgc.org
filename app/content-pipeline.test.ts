import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import sharp from 'sharp'
import { expect, test } from 'vitest'

import { compileContent } from '../content.config'

test('compiles local images, metadata, Markdown and board references; rejects bad edits', async () => {
  const root = await mkdtemp(join(tmpdir(), 'mhdgc-content-'))
  try {
    await mkdir(join(root, 'images'))
    await mkdir(join(root, 'pages'))
    await writeFile(
      join(root, 'images', 'photo.png'),
      await sharp({ create: { width: 400, height: 200, channels: 3, background: '#123456' } })
        .png()
        .toBuffer(),
    )
    const page =
      '---\ntitle: Test\ndescription: Test description\nogImage: photo.png\n---\n## Section\n\n**Copy** with [link](/about).'
    const pagePath = join(root, 'pages', 'test.md')
    const boardPath = join(root, 'board.json')
    await writeFile(pagePath, page)
    await writeFile(boardPath, '[{"name":"Test name","role":"Test role","photo":"photo.png"}]')
    const { data, assets } = await compileContent(root)
    expect(data.pages.test.html).toContain('<h2>Section</h2>')
    expect(data.pages.test.html).toContain('<strong>Copy</strong>')
    expect(data.pages.test.html).toContain('href="/about"')
    expect(data.pages.test.ogImage).toEqual(data.images['photo.png'])
    expect(data.images['photo.png']).toMatchObject({ width: 400, height: 200 })
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
    await writeFile(boardPath, '[{"name":"Test","role":"Role","typo":true}]')
    await expect(compileContent(root)).rejects.toThrow()
    await writeFile(boardPath, '[{"name":"Test","role":"Role","photo":"missing.png"}]')
    await expect(compileContent(root)).rejects.toThrow('Unknown content image')
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
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})
