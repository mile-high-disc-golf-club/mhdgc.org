/**
 * Encodes the photos in content/images and uploads them to the R2 bucket the
 * site links to, skipping every file that's already there. CI runs it before
 * building a preview or deploying; the build itself never encodes images.
 *
 *   bun run images:upload            Upload whatever is missing.
 *   bun run images:upload --dry-run  Only list what's missing.
 *
 * Needs CLOUDFLARE_ACCOUNT_ID, R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY: an R2
 * API token with Object Read & Write on the bucket. See the README.
 */
import { AwsClient } from 'aws4fetch'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  encodeVariant,
  type ImageVariant,
  listContentImages,
  planImage,
} from '../content.config.ts'
import { contentAssetsBucket } from '../shared/content-assets.ts'

const contentTypes = {
  avif: 'image/avif',
  webp: 'image/webp',
  jpeg: 'image/jpeg',
  png: 'image/png',
}

/** The R2 bucket through its S3-compatible API. */
export function bucket(env: NodeJS.ProcessEnv, fetcher: typeof fetch = fetch) {
  const accountId = env.CLOUDFLARE_ACCOUNT_ID
  const accessKeyId = env.R2_ACCESS_KEY_ID
  const secretAccessKey = env.R2_SECRET_ACCESS_KEY
  if (!accountId || !accessKeyId || !secretAccessKey)
    throw new Error(
      'Set CLOUDFLARE_ACCOUNT_ID, R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY. See "Content images in R2" in the README.',
    )
  const client = new AwsClient({ accessKeyId, secretAccessKey, service: 's3', region: 'auto' })
  const base = `https://${accountId}.r2.cloudflarestorage.com/${contentAssetsBucket}`
  async function send(url: string, init?: RequestInit) {
    const response = await fetcher(await client.sign(url, init))
    if (!response.ok)
      throw new Error(
        `R2 ${init?.method ?? 'GET'} ${url}: ${response.status} ${await response.text()}`,
      )
    return response
  }
  return {
    /** The keys under a prefix. Each image has a dozen at most, so one page is enough. */
    async list(prefix: string) {
      const query = new URLSearchParams({ 'list-type': '2', prefix, 'max-keys': '1000' })
      const xml = await (await send(`${base}?${query.toString()}`)).text()
      if (xml.includes('<IsTruncated>true</IsTruncated>'))
        throw new Error(`More than 1,000 objects under ${prefix}`)
      // Our keys are only hex digits, digits, letters, `.` and `/`, so they need no
      // XML unescaping. Parse the XML properly if keys could ever contain `&`.
      return new Set([...xml.matchAll(/<Key>([^<]*)<\/Key>/g)].map(([, key]) => key))
    },
    async put(variant: ImageVariant, body: Buffer) {
      await send(`${base}/${variant.key}`, {
        method: 'PUT',
        body,
        headers: {
          'Content-Type': contentTypes[variant.format],
          // Keys change whenever the bytes could, so browsers can keep them forever.
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      })
    },
  }
}

export async function uploadContentImages(
  root: string,
  target: Pick<ReturnType<typeof bucket>, 'list' | 'put'>,
  { dryRun = false, log = console.log } = {},
) {
  let uploaded = 0
  for (const file of await listContentImages(root)) {
    const original = await readFile(join(root, 'images', file))
    const plan = await planImage(original)
    const existing = await target.list(plan.prefix)
    const variants = [...plan.sources.flatMap(({ variants }) => variants), plan.fallback]
    const missing = variants.filter((variant) => !existing.has(variant.key))
    if (missing.length === 0) continue
    log(`${file}: ${dryRun ? 'missing' : 'uploading'} ${missing.length} of ${variants.length}`)
    if (dryRun) continue
    // Encodes this photo's files in parallel. Sharp spreads each one over the CPUs too.
    await Promise.all(
      missing.map(async (variant) => {
        await target.put(variant, await encodeVariant(original, plan, variant))
        uploaded++
      }),
    )
  }
  log(dryRun ? 'Dry run: nothing uploaded.' : `Uploaded ${uploaded} files.`)
  return uploaded
}

// Run directly, not imported by a test.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await uploadContentImages(join(import.meta.dirname, '..', 'content'), bucket(process.env), {
    dryRun: process.argv.includes('--dry-run'),
  })
}
