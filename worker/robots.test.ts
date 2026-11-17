import { expect, test } from 'vitest'

import { disallowAllRobots, isUnindexedHost } from './robots'

test('keeps the review host and Workers preview hosts out of search results', () => {
  expect(isUnindexedHost('beta.mhdgc.org')).toBe(true)
  expect(isUnindexedHost('pr-23-mhdgc-org.club.workers.dev')).toBe(true)
})

test('lets search engines index the production hosts', () => {
  expect(isUnindexedHost('www.mhdgc.org')).toBe(false)
  expect(isUnindexedHost('mhdgc.org')).toBe(false)
})

test('serves a robots.txt that disallows crawling the whole site', async () => {
  const response = disallowAllRobots()

  expect(response.headers.get('Content-Type')).toBe('text/plain; charset=utf-8')
  expect(await response.text()).toBe('User-agent: *\nDisallow: /\n')
})
