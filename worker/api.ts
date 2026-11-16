import type { HealthResponse } from '../shared/api'
import { calendars } from './calendars'
import { readEvents } from './events/store'

type Handler = (request: Request, env: Env) => Response | Promise<Response>

// GET handlers also answer HEAD: the runtime drops the body, and uptime
// monitors often send HEAD.
const routes: Partial<Record<string, { GET: Handler }>> = {
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
  '/api/events': {
    GET: async (_request, env) => {
      let body
      try {
        body = await readEvents(env.EVENTS, calendars)
      } catch (error) {
        console.error('Events: reading KV failed.', error)
        return json({ ok: false, error: 'Events are unavailable' }, { status: 503 })
      }
      return json(body, {
        headers: {
          // The cron refresh runs every 15 minutes. Browsers reuse a response
          // for 5 minutes, then show it while fetching a new one for 10 more.
          // Incomplete data isn't cached, so the next visit tries again.
          'Cache-Control': body.partial
            ? 'no-store'
            : 'public, max-age=300, stale-while-revalidate=600',
        },
      })
    },
  },
}

// Every /api/* request. Unknown paths get a JSON 404 and known paths called
// with the wrong method get a 405, so API misses never fall through to the
// HTML 404 page.
export async function handleApi(request: Request, env: Env): Promise<Response> {
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
