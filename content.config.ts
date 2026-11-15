import matter from 'gray-matter'
import { Marked } from 'marked'
import { createHash } from 'node:crypto'
import { readdir, readFile } from 'node:fs/promises'
import { join, relative, sep } from 'node:path'
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
// The fields #13 needs: roles may be empty; tenure is one or more lines.
const boardSchema = z.array(
  z.strictObject({
    name: text,
    roles: z.array(text),
    tenure: z.array(text).min(1),
    photo: text.optional(),
  }),
)

type EncodedImage = { image: ContentImage; assets: [string, Buffer][] }

// Encoding is the slow part of a build: AVIF and WebP at several widths for each
// image. One `react-router build` loads the Vite config, and so this plugin,
// several times in the same process, so encoded images are shared through
// globalThis, keyed by the file's bytes. A changed file gets a new key.
const encodedImages = ((
  globalThis as { repoContentImages?: Map<string, Promise<EncodedImage>> }
).repoContentImages ??= new Map<string, Promise<EncodedImage>>())

async function encodeImage(original: Buffer): Promise<EncodedImage> {
  const assets: [string, Buffer][] = []
  function asset(bytes: Buffer, extension: string) {
    const hash = createHash('sha256').update(bytes).digest('hex').slice(0, 16)
    const path = `/content-assets/${hash}.${extension}`
    assets.push([path, bytes])
    return path
  }
  const rotated = sharp(original).rotate()
  // Photos fall back to JPEG; only images with transparency need PNG.
  const fallbackFormat = (await rotated.clone().stats()).isOpaque ? 'jpeg' : 'png'
  const { data: fallback, info } = await rotated
    .toFormat(fallbackFormat)
    .toBuffer({ resolveWithObject: true })
  const image: ContentImage = {
    src: asset(fallback, fallbackFormat === 'jpeg' ? 'jpg' : 'png'),
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
      // From the original, so lossy formats aren't encoded twice.
      const bytes = await rotated.clone().resize({ width }).toFormat(format).toBuffer()
      candidates.push(`${asset(bytes, format)} ${width}w`)
    }
    image.sources.push({ type: `image/${format}`, srcSet: candidates.join(', ') })
  }
  return { image, assets }
}

export async function compileContent(root: string) {
  const data: ContentData = { pages: {}, board: [], images: {} }
  const assets = new Map<string, Buffer>()
  // Keys are paths relative to content/images, such as `board/jane-doe.jpg`.
  const imageFiles = (await readdir(join(root, 'images'), { recursive: true, withFileTypes: true }))
    .filter((entry) => entry.isFile())
    .map((entry) =>
      relative(join(root, 'images'), join(entry.parentPath, entry.name)).replaceAll(sep, '/'),
    )
    // Skips hidden files and folders, such as .gitkeep.
    .filter((path) => !path.split('/').some((segment) => segment.startsWith('.')))
    .sort()
  for (const file of imageFiles) {
    if (!/\.(jpe?g|png|webp|avif)$/i.test(file))
      throw new Error(`content/images/${file}: use JPEG, PNG, WebP or AVIF`)
    const original = await readFile(join(root, 'images', file))
    const key = createHash('sha256').update(original).digest('hex')
    let encoded = encodedImages.get(key)
    if (!encoded) {
      encoded = encodeImage(original)
      encodedImages.set(key, encoded)
      // A failed encode isn't kept, so the next compile tries again.
      encoded.catch(() => encodedImages.delete(key))
    }
    const { image, assets: imageAssets } = await encoded
    for (const [path, bytes] of imageAssets) assets.set(path, bytes)
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
    // Only a build compiles up front. Other commands, such as `react-router
    // typegen`, compile when something loads the content or an image.
    async buildStart() {
      if (!building) return
      const result = await compile()
      if (this.environment.name === 'client')
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
        // Ignores query strings, such as a cache-busting ?t=.
        const path = new URL(req.url ?? '/', 'http://localhost').pathname
        if (!path.startsWith('/content-assets/')) {
          next()
          return
        }
        void compile()
          .then(({ assets }) => {
            const bytes = assets.get(path)
            if (!bytes) {
              next()
              return
            }
            const extension = path.split('.').pop()
            res.setHeader('Content-Type', extension === 'jpg' ? 'image/jpeg' : `image/${extension}`)
            res.end(bytes)
          })
          .catch(next)
      })
    },
  }
}
