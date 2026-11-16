import { createRequestHandler } from 'react-router'

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

    // The production workers.dev route is disabled, so Workers hostnames are version URLs.
    if (url.hostname.endsWith('.workers.dev')) {
      const previewResponse = new Response(response.body, response)
      previewResponse.headers.set('X-Robots-Tag', 'noindex')
      return previewResponse
    }
    return response
  },

  // The cron trigger in wrangler.jsonc. Locally, run it with
  // /cdn-cgi/handler/scheduled (see the README).
  async scheduled(_controller, env) {
    await refreshEvents(env.EVENTS, calendars)
  },
} satisfies ExportedHandler<Env>
