import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import sharp from 'sharp'
import { expect, test } from 'vitest'

import { compileContent, type ImageVariant } from '../content.config.ts'
import { contentAssetsOrigin } from '../shared/content-assets.ts'
import { bucket, uploadContentImages } from './upload-content-images.ts'

function memoryBucket() {
  const objects = new Map<string, Buffer>()
  return {
    objects,
    list(prefix: string) {
      return Promise.resolve(new Set([...objects.keys()].filter((key) => key.startsWith(prefix))))
    },
    put(variant: ImageVariant, body: Buffer) {
      objects.set(variant.key, body)
      return Promise.resolve()
    },
  }
}

test('uploads every file the build links to, once', async () => {
  const root = await mkdtemp(join(tmpdir(), 'mhdgc-upload-'))
  try {
    await mkdir(join(root, 'images', 'board'), { recursive: true })
    await mkdir(join(root, 'pages'))
    await writeFile(join(root, 'board.json'), '[]')
    await writeFile(
      join(root, 'calendars.json'),
      JSON.stringify([
        {
          id: 'c_abc123@group.calendar.google.com',
          name: 'Test calendar',
          slug: 'test',
          icon: 'tag',
          color: 'event-tags',
        },
      ]),
    )
    await writeFile(
      join(root, 'images', 'board', 'photo.jpg'),
      await sharp({ create: { width: 700, height: 350, channels: 3, background: '#123456' } })
        .jpeg()
        .toBuffer(),
    )
    const target = memoryBucket()
    const log = () => {}

    expect(await uploadContentImages(root, target, { dryRun: true, log })).toBe(0)
    expect(target.objects.size).toBe(0)

    // AVIF and WebP at 320, 640 and 700, and the JPEG fallback.
    expect(await uploadContentImages(root, target, { log })).toBe(7)
    const { data } = await compileContent(root, { images: 'remote' })
    const image = data.images['board/photo.jpg']
    const linked = [
      image.src,
      ...image.sources.flatMap(({ srcSet }) => srcSet.split(', ').map((c) => c.split(' ')[0])),
    ].map((url) => url.slice(contentAssetsOrigin.length + 1))
    expect(new Set(linked)).toEqual(new Set(target.objects.keys()))
    for (const [key, bytes] of target.objects) {
      const meta = await sharp(bytes).metadata()
      const [, width, extension] = /\/(\d+)\.(\w+)$/.exec(key) ?? []
      expect(meta.width).toBe(Number(width))
      expect(meta.format).toBe({ avif: 'heif', webp: 'webp', jpg: 'jpeg' }[extension])
    }

    // A second run finds everything in place.
    expect(await uploadContentImages(root, target, { log })).toBe(0)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('signs S3 requests to the club bucket and reports failures', async () => {
  expect(() => bucket({})).toThrow('R2_ACCESS_KEY_ID')
  const requests: Request[] = []
  const r2 = bucket(
    { CLOUDFLARE_ACCOUNT_ID: 'account', R2_ACCESS_KEY_ID: 'id', R2_SECRET_ACCESS_KEY: 'secret' },
    (input) => {
      const request = input as Request
      requests.push(request)
      if (request.method === 'PUT') return Promise.resolve(new Response('denied', { status: 403 }))
      return Promise.resolve(
        new Response(
          '<ListBucketResult><IsTruncated>false</IsTruncated><Contents><Key>v1/abc/320.avif</Key></Contents></ListBucketResult>',
        ),
      )
    },
  )
  expect(await r2.list('v1/abc/')).toEqual(new Set(['v1/abc/320.avif']))
  const url = new URL(requests[0].url)
  expect(url.origin + url.pathname).toBe(
    'https://account.r2.cloudflarestorage.com/mhdgc-content-images',
  )
  expect(url.searchParams.get('prefix')).toBe('v1/abc/')
  expect(requests[0].headers.get('authorization')).toMatch(/^AWS4-HMAC-SHA256 Credential=id\//)
  await expect(
    r2.put({ key: 'v1/abc/320.avif', format: 'avif', width: 320 }, Buffer.from('x')),
  ).rejects.toThrow('403 denied')
  expect(requests[1].headers.get('content-type')).toBe('image/avif')
  expect(requests[1].headers.get('cache-control')).toBe('public, max-age=31536000, immutable')
})
