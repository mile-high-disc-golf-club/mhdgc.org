import { describe, expect, it } from 'vitest'

import { robotsTxt } from './robots'

describe('robots.txt', () => {
  it.each(['pr-15-mhdgc.account.workers.dev', 'new.mhdgc.org'])(
    'blocks preview host %s',
    (hostname) => {
      expect(robotsTxt(hostname)).toBe('User-agent: *\nDisallow: /\n')
    },
  )

  it('allows production and lists its sitemap', () => {
    expect(robotsTxt('www.mhdgc.org')).toBe(
      'User-agent: *\nAllow: /\n\nSitemap: https://www.mhdgc.org/sitemap.xml\n',
    )
  })
})
