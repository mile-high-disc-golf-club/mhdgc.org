import { createRequestHandler } from 'react-router'

import { isPreviewHost, robotsTxt } from '../shared/robots'
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
    if (url.pathname === '/robots.txt') {
      return new Response(robotsTxt(url.hostname), {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          ...(isPreviewHost(url.hostname) ? { 'X-Robots-Tag': 'noindex' } : {}),
        },
      })
    }
    const response =
      url.pathname === '/api' || url.pathname.startsWith('/api/')
        ? handleApi(request, env)
        : await handleDocument(request)

    // Static previews receive this header through public/_headers; cover Worker responses too.
    if (isPreviewHost(url.hostname)) {
      const previewResponse = new Response(response.body, response)
      previewResponse.headers.set('X-Robots-Tag', 'noindex')
      return previewResponse
    }
    return response
  },
} satisfies ExportedHandler<Env>
