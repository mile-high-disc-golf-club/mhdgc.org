import { describe, expect, it } from 'vitest'

import { pageMeta } from './seo'

const page = { title: 'About', description: 'About the club' }

describe('page metadata', () => {
  it('uses canonical production URLs and the default social image', () => {
    const meta = pageMeta('/about', page)
    expect(meta).toContainEqual({
      tagName: 'link',
      rel: 'canonical',
      href: 'https://www.mhdgc.org/about',
    })
    expect(meta).toContainEqual({ title: 'About · Mile High Disc Golf Club' })
    expect(meta).toContainEqual({
      property: 'og:image',
      content: 'https://www.mhdgc.org/og-image.png',
    })
    expect(meta).toContainEqual({ name: 'twitter:card', content: 'summary_large_image' })
  })

  it('titles the home page with the site name alone', () => {
    const meta = pageMeta('/', { description: page.description })
    expect(meta).toContainEqual({ title: 'Mile High Disc Golf Club' })
    expect(meta).toContainEqual({
      tagName: 'link',
      rel: 'canonical',
      href: 'https://www.mhdgc.org/',
    })
  })

  it('uses processed page image overrides for both social cards', () => {
    const meta = pageMeta('/about', {
      ...page,
      ogImage: { src: '/content-assets/photo.jpg', width: 640, height: 480, sources: [] },
    })
    for (const tag of [{ property: 'og:image' }, { name: 'twitter:image' }]) {
      expect(meta).toContainEqual({
        ...tag,
        content: 'https://www.mhdgc.org/content-assets/photo.jpg',
      })
    }
    expect(meta).toContainEqual({ property: 'og:image:width', content: '640' })
  })
})
