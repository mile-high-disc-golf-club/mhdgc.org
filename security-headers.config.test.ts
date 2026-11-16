import { expect, test } from 'vitest'

import { buildStaticHeaders } from './security-headers.config'

const assetRules = '/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n'

test('preserves asset rules and emits common headers and page-specific script hashes', () => {
  const readyHash = "'sha256-WMz/uUkpIfD429MH2BChUqXwHFQvIdkIACRP3tkkdQM='"
  const otherHash = "'sha256-JBhVtqxMI5bGCm+B75BrV/uAYCSqbqTWPUyX/kLgvc0='"
  const [assets, common, home, about] = buildStaticHeaders(assetRules, [
    {
      path: '/',
      html: [
        '<head><script>window.ready = true;\r\n</script></head>',
        '<main><div><script type="module">window.ready = true;\n</script></div></main>',
        '<script src="/assets/external.js">window.other = true;</script>',
      ].join(''),
    },
    { path: '/about', html: '<script>window.other = true;</script>' },
  ])
    .trimEnd()
    .split('\n\n')

  expect(assets).toBe(assetRules.trimEnd())
  expect(common).toBe(
    [
      '/*',
      '  Strict-Transport-Security: max-age=31536000',
      '  X-Content-Type-Options: nosniff',
      '  Referrer-Policy: strict-origin-when-cross-origin',
      '  Permissions-Policy: camera=(), geolocation=(), microphone=()',
    ].join('\n'),
  )
  expect(home).toMatch(/^\/\n {2}Cache-Control: public, max-age=300\n {2}Content-Security-Policy: /)
  expect(home.match(/'sha256-[^']+'/g)).toEqual([readyHash])
  expect(about).toMatch(
    /^\/about\n {2}Cache-Control: public, max-age=300\n {2}Content-Security-Policy: /,
  )
  expect(about.match(/'sha256-[^']+'/g)).toEqual([otherHash])
})

test('reserves a rule for the preview noindex header', () => {
  const pages = Array.from({ length: 98 }, (_, index) => ({ path: `/page-${index}`, html: '' }))

  expect(() => buildStaticHeaders(assetRules, pages.slice(1))).not.toThrow()
  expect(() => buildStaticHeaders(assetRules, pages)).toThrow(/100 rules.*PR previews/)
})

test('rejects a generated CSP line over the Workers limit', () => {
  const html = Array.from(
    { length: 40 },
    (_, index) => `<script>console.log(${index})</script>`,
  ).join('')

  expect(() => buildStaticHeaders(assetRules, [{ path: '/', html }])).toThrow(
    /2,000-character limit/,
  )
})
