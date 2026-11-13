import { createRequestHandler } from 'react-router'

import { handleApi } from './api'

const handleDocument = createRequestHandler(
  () => import('virtual:react-router/server-build'),
  import.meta.env.MODE,
)

// Runs only for /api/* and for paths that match no static file. Prerendered
// pages and built assets are served before the Worker (see wrangler.jsonc).
export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    if (url.pathname === '/api' || url.pathname.startsWith('/api/')) {
      return handleApi(request, env)
    }
    return handleDocument(request)
  },
} satisfies ExportedHandler<Env>
