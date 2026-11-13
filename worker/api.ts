import type { HealthResponse } from '../shared/api'

// Every /api/* request. Returns a JSON 404 for unknown API paths, so they never
// fall through to the HTML 404 page.
export function handleApi(request: Request, env: Env): Response {
  const url = new URL(request.url)

  if (request.method === 'GET' && url.pathname === '/api/health') {
    const body: HealthResponse = {
      ok: true,
      env: env.APP_ENV,
      time: new Date().toISOString(),
    }
    return Response.json(body)
  }

  return Response.json({ ok: false, error: 'Not found' }, { status: 404 })
}
