import { readBoard, readPage } from '~/.server'
import { AboutPage } from '~/pages/about'
import { pageMeta } from '~/seo'

import type { Route } from './+types/about'

export function loader() {
  return { ...readPage('about'), board: readBoard() }
}

export function meta({ loaderData }: Route.MetaArgs): Route.MetaDescriptors {
  return pageMeta('/about', loaderData)
}

export default function AboutRoute({ loaderData }: Route.ComponentProps) {
  return <AboutPage {...loaderData} />
}
