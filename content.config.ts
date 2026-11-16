import matter from 'gray-matter'
import { Marked } from 'marked'
import { createHash } from 'node:crypto'
import { readdir, readFile } from 'node:fs/promises'
import { join, relative, sep } from 'node:path'
import sharp from 'sharp'
import type { Plugin } from 'vite'
import { z } from 'zod'

import type { ContentData, ContentImage } from './app/content'
import { icons } from './app/design-system/components/icons.ts'
import { eventColors } from './app/design-system/theme/colors.ts'
import { contentAssetsOrigin } from './shared/content-assets.ts'

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

// The club's public Google Calendars, in display order, for /api/events (#18)
// and the Events page (#19).
const slug = z
  .string()
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Use lowercase letters, digits and hyphens')
const calendarsSchema = z
  .array(
    z.strictObject({
      // The full calendar ID, from Google Calendar's settings: Integrate calendar.
      id: z
        .string()
        .regex(/^[\w.-]+@group\.calendar\.google\.com$/, 'Use the full Google Calendar ID'),
      name: text,
      // In the Events page's ?cal= filter, so changing one breaks shared links.
      slug,
      // An icon and an event-* color token that exist in the design system.
      icon: z.enum(Object.keys(icons) as (keyof typeof icons)[], {
        error: 'Use an icon name from app/design-system/components/icons.ts',
      }),
      color: z.enum(eventColors, {
        error: 'Use an event-* color token from app/design-system/theme/colors.ts',
      }),
    }),
  )
  .min(1)
  .superRefine((calendars, context) => {
    for (const key of ['id', 'slug'] as const) {
      const seen = new Set<string>()
      calendars.forEach((calendar, index) => {
        if (seen.has(calendar[key]))
          context.addIssue({
            code: 'custom',
            path: [index, key],
            message: `Duplicate calendar ${key}: ${calendar[key]}`,
          })
        seen.add(calendar[key])
      })
    }
  })

/**
 * `remote`: image URLs point at the R2 bucket, which `bun run images:upload`
 * fills (scripts/upload-content-images.ts). `local`: each original is served as
 * is from /content-assets/, with no AVIF or WebP versions, for `bun run dev` and
 * builds without R2. Neither mode encodes anything, so both take milliseconds.
 */
export type ImageMode = 'remote' | 'local'

export type ImageFormat = 'avif' | 'webp' | 'jpeg' | 'png'
export interface ImageVariant {
  /** The R2 object key, such as `v1/0123456789abcdef/640.avif`. */
  key: string
  format: ImageFormat
  width: number
}
export interface ImagePlan {
  /** The first 16 hex digits of the original's SHA-256. */
  hash: string
  /** The folder in the bucket that holds every variant, such as `v1/0123456789abcdef/`. */
  prefix: string
  width: number
  height: number
  /** Full size, as JPEG, or PNG for images with transparency. */
  fallback: ImageVariant
  sources: { format: 'avif' | 'webp'; variants: ImageVariant[] }[]
}

// Part of every key. Bump it when the encoding below changes (formats, widths,
// quality), so the new files get new URLs instead of replacing cached ones.
// Nothing else changes a key: after a Sharp or libavif upgrade, existing files
// stay as they were encoded and only new photos use the new encoder. Bump it
// too if the upgrade's output should replace them.
const encodingVersion = 'v1'
const sourceWidths = [320, 640, 960, 1440]
const extensions: Record<ImageFormat, string> = {
  avif: 'avif',
  webp: 'webp',
  jpeg: 'jpg',
  png: 'png',
}

/**
 * Which files an original becomes, from its header alone. Only an image with an
 * alpha channel is decoded, to check whether it really has transparency.
 */
export async function planImage(original: Buffer): Promise<ImagePlan> {
  const hash = createHash('sha256').update(original).digest('hex').slice(0, 16)
  const meta = await sharp(original).metadata()
  // The size after EXIF rotation, which is how the image is encoded and shown.
  const { width, height } = meta.autoOrient
  const opaque = !meta.hasAlpha || (await sharp(original).stats()).isOpaque
  const prefix = `${encodingVersion}/${hash}/`
  function variant(format: ImageFormat, variantWidth: number): ImageVariant {
    return {
      key: `${prefix}${variantWidth}.${extensions[format]}`,
      format,
      width: variantWidth,
    }
  }
  // Never enlarged: only widths up to the original's, plus the original's own.
  const widths = [...new Set([...sourceWidths, width].filter((w) => w <= width))].sort(
    (a, b) => a - b,
  )
  return {
    hash,
    prefix,
    width,
    height,
    fallback: variant(opaque ? 'jpeg' : 'png', width),
    sources: (['avif', 'webp'] as const).map((format) => ({
      format,
      variants: widths.map((w) => variant(format, w)),
    })),
  }
}

/** Encodes one variant. Only the upload script calls this, never the build. */
export function encodeVariant(original: Buffer, plan: ImagePlan, variant: ImageVariant) {
  const image = sharp(original).rotate()
  // The fallback is full size, so it isn't resampled.
  if (variant.width !== plan.width) image.resize({ width: variant.width })
  return image.toFormat(variant.format).toBuffer()
}

/** The paths of the originals inside `content/images`, such as `board/jane-doe.jpg`. */
export async function listContentImages(root: string) {
  const imagesRoot = join(root, 'images')
  const files = (await readdir(imagesRoot, { recursive: true, withFileTypes: true }))
    .filter((entry) => entry.isFile())
    .map((entry) => relative(imagesRoot, join(entry.parentPath, entry.name)).replaceAll(sep, '/'))
    // Skips hidden files and folders, such as .gitkeep.
    .filter((path) => !path.split('/').some((segment) => segment.startsWith('.')))
    .sort()
  for (const file of files)
    if (!/\.(jpe?g|png|webp|avif)$/i.test(file))
      throw new Error(`content/images/${file}: use JPEG, PNG, WebP or AVIF`)
  return files
}

function remoteImage(plan: ImagePlan): ContentImage {
  const url = (variant: ImageVariant) => `${contentAssetsOrigin}/${variant.key}`
  return {
    src: url(plan.fallback),
    width: plan.width,
    height: plan.height,
    sources: plan.sources.map(({ format, variants }) => ({
      type: `image/${format}`,
      srcSet: variants.map((variant) => `${url(variant)} ${variant.width}w`).join(', '),
    })),
  }
}

export async function compileContent(root: string, { images }: { images: ImageMode }) {
  const data: ContentData = { pages: {}, board: [], calendars: [], images: {} }
  // Only `local` mode serves files from the site itself: path to bytes.
  const assets = new Map<string, Buffer>()
  for (const file of await listContentImages(root)) {
    const original = await readFile(join(root, 'images', file))
    const plan = await planImage(original)
    if (images === 'remote') {
      data.images[file] = remoteImage(plan)
    } else {
      const extension = file
        .slice(file.lastIndexOf('.') + 1)
        .toLowerCase()
        .replace('jpeg', 'jpg')
      const path = `/content-assets/${plan.hash}.${extension}`
      assets.set(path, original)
      data.images[file] = { src: path, width: plan.width, height: plan.height, sources: [] }
    }
  }
  function image(name: string) {
    const result = data.images[name]
    if (!Object.hasOwn(data.images, name)) throw new Error(`Unknown content image: ${name}`)
    return result
  }
  data.board = boardSchema.parse(JSON.parse(await readFile(join(root, 'board.json'), 'utf8')))
  for (const member of data.board) if (member.photo) image(member.photo)
  data.calendars = calendarsSchema.parse(
    JSON.parse(await readFile(join(root, 'calendars.json'), 'utf8')),
  )
  // Raw HTML is rejected: prose stays in the design system, and photos must use
  // ResponsiveImage instead of bypassing the image pipeline through Markdown.
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
  let images: ImageMode = 'local'
  function compile() {
    return (compiled ??= compileContent(root, { images }))
  }
  return {
    name: 'repo-content',
    configResolved(config) {
      root = join(config.root, 'content')
      building = config.command === 'build'
      // A build links to the encoded images in R2. CONTENT_IMAGES=local builds
      // with the originals instead, for when R2 isn't set up. Everything else,
      // such as `bun run dev`, serves the originals.
      if (building) {
        const mode = process.env.CONTENT_IMAGES ?? 'remote'
        if (mode !== 'remote' && mode !== 'local')
          throw new Error(`CONTENT_IMAGES must be remote or local, not ${mode}`)
        images = mode
      }
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
