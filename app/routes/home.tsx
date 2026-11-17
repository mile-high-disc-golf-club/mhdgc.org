import { contentAssetsOrigin } from '~/../shared/content-assets'
import { readImage, readPage } from '~/.server'
import { HomePage } from '~/pages/home'
import { pageMeta } from '~/seo'

import type { Route } from './+types/home'

// The page's photos come from the image host, so connect to it before the HTML
// reaches them.
export const links: Route.LinksFunction = () => [{ rel: 'preconnect', href: contentAssetsOrigin }]

export function loader() {
  return {
    welcome: readPage('home'),
    activities: readPage('home-activities'),
    involved: readPage('home-involved'),
    course: readImage('home/course.jpg'),
    classic: readImage('videos/bypfs7tfhni.jpg'),
    challenge: readImage('videos/f2dkiwxatsy.jpg'),
  }
}

export function meta({ loaderData }: Route.MetaArgs): Route.MetaDescriptors {
  const { description, ogImage } = loaderData.welcome
  return pageMeta('/', { description, ogImage })
}

export default function HomeRoute({ loaderData }: Route.ComponentProps) {
  return <HomePage {...loaderData} />
}
