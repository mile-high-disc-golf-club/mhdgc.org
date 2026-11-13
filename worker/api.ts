import type { HealthResponse } from '../shared/api'

type Handler = (request: Request, env: Env) => Response

// GET handlers also answer HEAD: the runtime drops the body, and uptime
// monitors often send HEAD.
const routes: Record<string, { GET: Handler }> = {
  '/api/health': {
    GET: (_request, env) => {
      const body: HealthResponse = {
        ok: true,
        env: env.APP_ENV,
        time: new Date().toISOString(),
      }
      return json(body)
    },
  },
}

// Every /api/* request. Unknown paths get a JSON 404 and known paths called
// with the wrong method get a 405, so API misses never fall through to the
// HTML 404 page.
export function handleApi(request: Request, env: Env): Response {
  const route = routes[new URL(request.url).pathname]
  if (!route) {
    return json({ ok: false, error: 'Not found' }, { status: 404 })
  }
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return json(
      { ok: false, error: 'Method not allowed' },
      { status: 405, headers: { Allow: 'GET, HEAD' } },
    )
  }
  return route.GET(request, env)
}

// API responses are never cached by browsers or intermediaries. A route that
// should be cached, such as events, sets its own Cache-Control.
function json(body: unknown, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers)
  if (!headers.has('Cache-Control')) headers.set('Cache-Control', 'no-store')
  return Response.json(body, { ...init, headers })
}
