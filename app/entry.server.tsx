import { isbot } from 'isbot'
import { renderToReadableStream } from 'react-dom/server'
import { type EntryContext, ServerRouter } from 'react-router'

import { documentPolicy } from '~shared/security-headers'

export const streamTimeout = 5_000

export default async function handleRequest(
  request: Request,
  status: number,
  headers: Headers,
  context: EntryContext,
) {
  // Successful pages are prerendered and receive script hashes at build time.
  // The Worker renders error pages with a fresh nonce for each response.
  // If the Worker starts rendering successful pages, give them a nonce before
  // rendering too. A subsequent render error can change the status to 500.
  const nonce =
    import.meta.env.PROD && status >= 400
      ? btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16))))
      : undefined
  if (nonce) {
    headers.set('Content-Security-Policy', documentPolicy([`'nonce-${nonce}'`]))
    headers.set('Cache-Control', 'no-store')
  }

  headers.set('Content-Type', 'text/html')
  if (request.method === 'HEAD') return new Response(null, { status, headers })

  let shellRendered = false
  const body = await renderToReadableStream(
    <ServerRouter context={context} url={request.url} nonce={nonce} />,
    {
      nonce,
      signal: AbortSignal.timeout(streamTimeout + 1000),
      onError(error: unknown) {
        status = 500
        if (shellRendered) console.error(error)
      },
    },
  )
  shellRendered = true
  const userAgent = request.headers.get('user-agent')
  if ((userAgent && isbot(userAgent)) || context.isSpaMode) await body.allReady

  return new Response(body, { status, headers })
}
