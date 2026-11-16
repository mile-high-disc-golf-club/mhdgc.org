import { afterEach, expect, test } from 'vitest'

import { loadBeacon, webAnalyticsBeacon } from './web-analytics'

afterEach(() => {
  document.body.replaceChildren()
})

const config = { token: 'site-token', productionHost: 'www.mhdgc.org' }

test('loads the beacon with its token on the production host', () => {
  expect(webAnalyticsBeacon('www.mhdgc.org', config)).toEqual({
    src: 'https://static.cloudflareinsights.com/beacon.min.js',
    cfBeacon: '{"token":"site-token"}',
  })
})

test.each([
  'mile-high-disc-golf-club.workers.dev',
  'pr-21-mhdgc-org.example.workers.dev',
  'new.mhdgc.org',
  'mhdgc.org',
  'localhost',
])('leaves %s out of the stats', (hostname) => {
  expect(webAnalyticsBeacon(hostname, config)).toBeUndefined()
})

test('stays off until the site has a token', () => {
  expect(webAnalyticsBeacon('www.mhdgc.org', { ...config, token: '' })).toBeUndefined()
})

test('appends one module beacon script, however often it runs', () => {
  const beacon = {
    src: 'https://static.cloudflareinsights.com/beacon.min.js',
    cfBeacon: '{"token":"site-token"}',
  }
  loadBeacon(beacon)
  loadBeacon(beacon)

  const scripts = document.querySelectorAll('script')
  expect(scripts).toHaveLength(1)
  expect(scripts[0]).toHaveAttribute('type', 'module')
  expect(scripts[0]).toHaveAttribute('src', beacon.src)
  expect(scripts[0]).toHaveAttribute('data-cf-beacon', '{"token":"site-token"}')
})
