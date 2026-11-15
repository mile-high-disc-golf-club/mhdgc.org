import { readImage, readPage } from '~/.server'
import { HomePage } from '~/pages/home'
import { pageMeta } from '~/seo'

import type { Route } from './+types/home'

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
  return pageMeta('/', loaderData.welcome)
}

export default function HomeRoute({ loaderData }: Route.ComponentProps) {
  return <HomePage {...loaderData} />
}
