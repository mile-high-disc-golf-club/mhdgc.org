import { expect, test, vi } from 'vitest'

import { isUnindexedHost, serveRobots } from './robots'

test('keeps Workers preview hosts out of search results', () => {
  expect(isUnindexedHost('pr-23-mhdgc-org.club.workers.dev')).toBe(true)
})

test('lets search engines index the production hosts', () => {
  expect(isUnindexedHost('www.mhdgc.org')).toBe(false)
  expect(isUnindexedHost('mhdgc.org')).toBe(false)
})

test('serves a robots.txt that disallows crawling on unindexed hosts', async () => {
  const assets = { fetch: vi.fn() }
  const response = await serveRobots(
    new Request('https://pr-23-mhdgc-org.club.workers.dev/robots.txt'),
    'pr-23-mhdgc-org.club.workers.dev',
    assets,
  )

  expect(assets.fetch).not.toHaveBeenCalled()
  expect(response.headers.get('Content-Type')).toBe('text/plain; charset=utf-8')
  expect(await response.text()).toBe('User-agent: *\nDisallow: /\n')
})

test('serves the static robots.txt on production hosts', async () => {
  const request = new Request('https://www.mhdgc.org/robots.txt')
  const staticFile = new Response('User-agent: *\nAllow: /\n')
  const assets = { fetch: vi.fn().mockResolvedValue(staticFile) }

  expect(await serveRobots(request, 'www.mhdgc.org', assets)).toBe(staticFile)
  expect(assets.fetch).toHaveBeenCalledWith(request)
})
