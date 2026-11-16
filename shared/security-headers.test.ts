import { expect, test } from 'vitest'

import { documentPolicy } from './security-headers'

test('authorizes a document nonce in script-src without allowing arbitrary inline scripts', () => {
  const directives = documentPolicy(["'nonce-cmFuZG9t'"]).split('; ')

  expect(directives).toContain(
    "script-src 'self' https://static.cloudflareinsights.com 'nonce-cmFuZG9t'",
  )
  expect(directives).toContain("frame-ancestors 'none'")
  expect(directives.join(' ')).not.toContain("'unsafe-inline'")
})
