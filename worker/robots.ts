// The board reviews the new site on this host before www cuts over (#23).
// public/_headers names it too, for the static files the Worker never sees.
export const reviewHost = 'beta.mhdgc.org'

// Hosts that stay out of search results: the review host, and Workers
// hostnames, which are only version and PR preview URLs while the
// production workers.dev route is off.
export function isUnindexedHost(hostname: string): boolean {
  return hostname === reviewHost || hostname.endsWith('.workers.dev')
}

// /robots.txt runs the Worker first (see wrangler.jsonc). Unindexed hosts
// disallow crawling. Every other host gets the static public/robots.txt.
export function serveRobots(
  request: Request,
  hostname: string,
  assets: Pick<Fetcher, 'fetch'>,
): Promise<Response> | Response {
  if (!isUnindexedHost(hostname)) return assets.fetch(request)
  return new Response('User-agent: *\nDisallow: /\n', {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
