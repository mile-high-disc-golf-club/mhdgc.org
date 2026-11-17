import { createRequestHandler } from 'react-router'

import { noContentPolicy, securityHeaders } from '../shared/security-headers'
import { handleApi } from './api'
import { calendars } from './calendars'
import { refreshEvents } from './events/store'
import { isUnindexedHost, serveRobots } from './robots'

const handleDocument = createRequestHandler(
  () => import('virtual:react-router/server-build'),
  import.meta.env.MODE,
)

async function route(request: Request, url: URL, env: Env): Promise<Response> {
  if (url.pathname === '/api' || url.pathname.startsWith('/api/')) return handleApi(request, env)
  if (url.pathname === '/robots.txt') return serveRobots(request, url.hostname, env.ASSETS)
  return handleDocument(request)
}

// Runs only for /api/*, /robots.txt and paths that match no static file.
// Prerendered pages and built assets are served before the Worker (see wrangler.jsonc).
export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const response = await route(request, url, env)

    const headers = new Headers(response.headers)
    for (const [name, value] of Object.entries(securityHeaders)) headers.set(name, value)
    // API and data responses get the restrictive fallback. Any new dynamic
    // HTML route must set its document policy in the server entry.
    if (import.meta.env.PROD && !headers.has('Content-Security-Policy')) {
      headers.set('Content-Security-Policy', noContentPolicy)
    }
    // public/_headers sets the same header on the review host's static files.
    if (isUnindexedHost(url.hostname)) {
      headers.set('X-Robots-Tag', 'noindex')
    }
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    })
  },

  // The cron trigger in wrangler.jsonc. Locally, run it with
  // /cdn-cgi/handler/scheduled (see the README).
  async scheduled(_controller, env) {
    await refreshEvents({ kv: env.EVENTS, apiKey: env.GOOGLE_CALENDAR_API_KEY }, calendars)
  },
} satisfies ExportedHandler<Env>
