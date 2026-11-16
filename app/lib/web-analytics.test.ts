import { expect, test } from 'vitest'

import { webAnalyticsBeacon } from './web-analytics'

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
