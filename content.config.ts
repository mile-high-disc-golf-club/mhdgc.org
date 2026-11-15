import matter from 'gray-matter'
import { Marked } from 'marked'
import { createHash } from 'node:crypto'
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import sharp from 'sharp'
import type { Plugin } from 'vite'
import { z } from 'zod'

import type { ContentData, ContentImage } from './app/content'

const text = z.string().trim().min(1)
const pageSchema = z.strictObject({
  title: text,
  description: text,
  ogImage: text.optional(),
})
const boardSchema = z.array(z.strictObject({ name: text, role: text, photo: text.optional() }))

export async function compileContent(root: string) {
  const data: ContentData = { pages: {}, board: [], images: {} }
  const assets = new Map<string, Buffer>()
  function asset(bytes: Buffer, extension: string) {
    const hash = createHash('sha256').update(bytes).digest('hex').slice(0, 16)
    const path = `/content-assets/${hash}.${extension}`
    assets.set(path, bytes)
    return path
  }
  for (const file of (await readdir(join(root, 'images'))).sort()) {
    if (!/\.(jpe?g|png|webp|avif)$/i.test(file))
      throw new Error(`content/images/${file}: use JPEG, PNG, WebP or AVIF`)
    const original = await readFile(join(root, 'images', file))
    const { data: fallback, info } = await sharp(original)
      .rotate()
      .png()
      .toBuffer({ resolveWithObject: true })
    const image: ContentImage = {
      src: asset(fallback, 'png'),
      width: info.width,
      height: info.height,
      sources: [],
    }
    const widths = [
      ...new Set([320, 640, 960, 1440, info.width].filter((width) => width <= info.width)),
    ].sort((a, b) => a - b)
    for (const format of ['avif', 'webp'] as const) {
      const candidates = []
      for (const width of widths) {
        const bytes = await sharp(fallback).resize({ width }).toFormat(format).toBuffer()
        candidates.push(`${asset(bytes, format)} ${width}w`)
      }
      image.sources.push({ type: `image/${format}`, srcSet: candidates.join(', ') })
    }
    data.images[file] = image
  }
  function image(name: string) {
    const result = data.images[name]
    if (!Object.hasOwn(data.images, name)) throw new Error(`Unknown content image: ${name}`)
    return result
  }
  data.board = boardSchema.parse(JSON.parse(await readFile(join(root, 'board.json'), 'utf8')))
  for (const member of data.board) if (member.photo) image(member.photo)
  // Raw HTML is rejected: prose stays in the design system, and photos must use
  // ResponsiveImage instead of bypassing local image processing through Markdown.
  const markdown = new Marked({
    renderer: {
      html() {
        throw new Error('Raw HTML is not supported in content Markdown')
      },
      image() {
        throw new Error('Use ResponsiveImage for photos, not Markdown image syntax')
      },
      heading({ depth, tokens }) {
        if (depth !== 2 && depth !== 3) throw new Error('Markdown headings must be ## or ###')
        return `<h${depth}>${this.parser.parseInline(tokens)}</h${depth}>\n`
      },
      link({ href, tokens }) {
        if (!/^(https?:\/\/|mailto:|\/(?!\/)|#)/i.test(href))
          throw new Error(`Unsupported link: ${href}`)
        const escaped = href
          .replaceAll('&', '&amp;')
          .replaceAll('"', '&quot;')
          .replaceAll('<', '&lt;')
        return `<a href="${escaped}">${this.parser.parseInline(tokens)}</a>`
      },
    },
  })
  for (const file of (await readdir(join(root, 'pages'))).sort()) {
    if (!file.endsWith('.md')) continue
    const { data: frontmatter, content } = matter(await readFile(join(root, 'pages', file), 'utf8'))
    const meta = pageSchema.parse(frontmatter)
    data.pages[file.slice(0, -3)] = {
      title: meta.title,
      description: meta.description,
      ...(meta.ogImage ? { ogImage: image(meta.ogImage) } : {}),
      html: await markdown.parse(content),
    }
  }
  return { data, assets }
}

/** Node-only Vite plugin: the Worker receives JSON and the client receives HTML. */
export function contentPlugin(): Plugin {
  let root: string
  let compiled: ReturnType<typeof compileContent> | undefined
  let building = false
  function compile() {
    return (compiled ??= compileContent(root))
  }
  return {
    name: 'repo-content',
    configResolved(config) {
      root = join(config.root, 'content')
      building = config.command === 'build'
    },
    async buildStart() {
      const result = await compile()
      if (building && this.environment.name === 'client')
        for (const [path, source] of result.assets)
          this.emitFile({ type: 'asset', fileName: path.slice(1), source })
    },
    resolveId(id) {
      if (id === 'virtual:repo-content') return '\0repo-content'
    },
    async load(id) {
      if (id === '\0repo-content')
        return `export const content = ${JSON.stringify((await compile()).data)}`
    },
    configureServer(server) {
      server.watcher.add(root)
      server.watcher.on('all', (_event, path) => {
        if (path.startsWith(root)) {
          compiled = undefined
          const module = server.environments.ssr.moduleGraph.getModuleById('\0repo-content')
          if (module) server.environments.ssr.moduleGraph.invalidateModule(module)
          server.ws.send({ type: 'full-reload' })
        }
      })
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith('/content-assets/')) {
          next()
          return
        }
        void compile()
          .then(({ assets }) => {
            const bytes = assets.get(req.url ?? '')
            if (!bytes) {
              next()
              return
            }
            const extension = req.url?.split('.').pop()
            res.setHeader('Content-Type', `image/${extension}`)
            res.end(bytes)
          })
          .catch(next)
      })
    },
  }
}
