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
    // form-action doesn't fall back to default-src. Embedded forms, such as the
    // Google Form in an iframe, follow their own document's policy.
    "form-action 'self'",
    "frame-ancestors 'none'",
    "base-uri 'none'",
    "object-src 'none'",
  ].join('; ')
}

// /admin runs Sveltia CMS (public/admin, cms.config.ts), served from this site.
// It calls GitHub's API, shows the photos being edited as blob: URLs and GitHub
// avatars, and loads its fonts from jsDelivr. Sveltia's own guidance:
// https://sveltiacms.app/en/docs/security#setting-up-content-security-policy
export const adminPolicy = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' https://cdn.jsdelivr.net",
  "img-src 'self' blob: data: https://avatars.githubusercontent.com",
  "media-src 'self' blob:",
  'frame-src blob:',
  'manifest-src blob:',
  // unpkg.com is only fetched, never run: Sveltia's version check and its
  // translations for languages other than English.
  "connect-src 'self' blob: data: https://api.github.com https://www.githubstatus.com https://unpkg.com",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "base-uri 'none'",
  "object-src 'none'",
].join('; ')
