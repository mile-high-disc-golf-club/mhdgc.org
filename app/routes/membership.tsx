import { contentAssetsOrigin } from '~/../shared/content-assets'
import { readImage, readPage } from '~/.server'
import { MembershipPage } from '~/pages/membership'
import { pageMeta } from '~/seo'

import type { Route } from './+types/membership'

// The page's photos come from the image host, so connect to it before the HTML
// reaches them.
export const links: Route.LinksFunction = () => [{ rel: 'preconnect', href: contentAssetsOrigin }]

export function loader() {
  return {
    membership: readPage('membership'),
    join: readPage('membership-join'),
    matches: readPage('membership-matches'),
    tags: readImage('membership/bag-tags.jpg'),
  }
}

export function meta({ loaderData }: Route.MetaArgs): Route.MetaDescriptors {
  return pageMeta('/membership', loaderData.membership)
}

export default function MembershipRoute({ loaderData }: Route.ComponentProps) {
  return <MembershipPage {...loaderData} />
}
