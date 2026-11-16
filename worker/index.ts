import { createRequestHandler } from 'react-router'

import { noContentPolicy, securityHeaders } from '../shared/security-headers'
import { handleApi } from './api'
import { calendars } from './calendars'
import { refreshEvents } from './events/store'

const handleDocument = createRequestHandler(
  () => import('virtual:react-router/server-build'),
  import.meta.env.MODE,
)

// Runs only for /api/* and for paths that match no static file. Prerendered
// pages and built assets are served before the Worker (see wrangler.jsonc).
export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const response =
      url.pathname === '/api' || url.pathname.startsWith('/api/')
        ? await handleApi(request, env)
        : await handleDocument(request)

    const headers = new Headers(response.headers)
    for (const [name, value] of Object.entries(securityHeaders)) headers.set(name, value)
    if (import.meta.env.PROD && !headers.has('Content-Security-Policy')) {
      headers.set('Content-Security-Policy', noContentPolicy)
    }
    // The production workers.dev route is disabled, so Workers hostnames are version URLs.
    if (url.hostname.endsWith('.workers.dev')) {
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
