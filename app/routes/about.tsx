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
    ...(loaderData.ogImage ? [{ property: 'og:image', content: loaderData.ogImage.src }] : []),
  ]
}

export default function AboutRoute({ loaderData }: Route.ComponentProps) {
  return <AboutPage {...loaderData} />
}
