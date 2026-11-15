export function isPreviewHost(hostname: string) {
  return hostname.endsWith('.workers.dev') || hostname === 'new.mhdgc.org'
}

export function robotsTxt(hostname: string) {
  return isPreviewHost(hostname)
    ? 'User-agent: *\nDisallow: /\n'
    : `User-agent: *\nAllow: /\n\nSitemap: https://www.mhdgc.org/sitemap.xml\n`
}
