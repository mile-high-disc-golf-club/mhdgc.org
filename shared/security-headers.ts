import { contentAssetsOrigin } from './content-assets'

export const securityHeaders = {
  'Strict-Transport-Security': 'max-age=31536000',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), geolocation=(), microphone=()',
}

export const noContentPolicy = "default-src 'none'; frame-ancestors 'none'"

export function documentPolicy(inlineScriptSources: readonly string[]) {
  return [
    "default-src 'self'",
    'frame-src https://www.youtube-nocookie.com https://docs.google.com',
    `img-src 'self' data: ${contentAssetsOrigin}`,
    ["script-src 'self' https://static.cloudflareinsights.com", ...inlineScriptSources].join(' '),
    "connect-src 'self' https://cloudflareinsights.com",
    "frame-ancestors 'none'",
    "base-uri 'none'",
    "object-src 'none'",
  ].join('; ')
}
