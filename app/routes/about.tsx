import { contentAssetsOrigin } from '~/../shared/content-assets'
import { readBoard, readPage } from '~/.server'
import { AboutPage } from '~/pages/about'
import { pageMeta } from '~/seo'

import type { Route } from './+types/about'

// The page's photos come from the image host, so connect to it before the HTML
// reaches them.
export const links: Route.LinksFunction = () => [{ rel: 'preconnect', href: contentAssetsOrigin }]

export function loader() {
  return { ...readPage('about'), board: readBoard() }
}

export function meta({ loaderData }: Route.MetaArgs): Route.MetaDescriptors {
  return pageMeta('/about', loaderData)
}

export default function AboutRoute({ loaderData }: Route.ComponentProps) {
  return <AboutPage {...loaderData} />
}
