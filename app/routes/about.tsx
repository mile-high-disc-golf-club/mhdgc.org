import { readPage } from '~/.server'
import { AboutPage } from '~/pages/about'
import { pageTitle } from '~/site'

import type { Route } from './+types/about'

export function loader() {
  return readPage('about')
}

export function meta({ loaderData }: Route.MetaArgs): Route.MetaDescriptors {
  return [
    { title: pageTitle(loaderData.title) },
    { name: 'description', content: loaderData.description },
    // Open Graph tags, with absolute URLs and the ogImage override, come in #15.
  ]
}

export default function AboutRoute({ loaderData }: Route.ComponentProps) {
  return <AboutPage {...loaderData} />
}
