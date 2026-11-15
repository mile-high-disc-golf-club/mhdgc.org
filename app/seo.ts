import type { MetaDescriptor } from 'react-router'

import type { ContentPage } from './content'
import { pageTitle, siteName, siteUrl, socialLinks } from './site'

// Leave out the title for the home page, which is titled with the site name alone.
export function pageMeta(
  path: string,
  page: Pick<ContentPage, 'description' | 'ogImage'> & { title?: string },
): MetaDescriptor[] {
  const title = pageTitle(page.title)
  const url = new URL(path, siteUrl).href
  const image = new URL(page.ogImage?.src ?? '/og-image.png', siteUrl).href
  return [
    { title },
    { name: 'description', content: page.description },
    { tagName: 'link', rel: 'canonical', href: url },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: siteName },
    { property: 'og:title', content: title },
    { property: 'og:description', content: page.description },
    { property: 'og:url', content: url },
    { property: 'og:image', content: image },
    { property: 'og:image:width', content: String(page.ogImage?.width ?? 1200) },
    { property: 'og:image:height', content: String(page.ogImage?.height ?? 630) },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: page.description },
    { name: 'twitter:image', content: image },
    {
      'script:ld+json': {
        '@context': 'https://schema.org',
        '@type': ['SportsOrganization', 'NGO'],
        name: siteName,
        url: siteUrl + '/',
        logo: siteUrl + '/icon-512.png',
        sameAs: socialLinks.map(({ href }) => href),
        areaServed: 'Denver metro area',
      },
    },
  ]
}
