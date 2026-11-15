import { readPage } from '~/.server'
import { pageMeta } from '~/seo'

import type { Route } from './+types/events'

export function loader() {
  return readPage('events')
}

export function meta({ loaderData }: Route.MetaArgs): Route.MetaDescriptors {
  return pageMeta('/events', loaderData)
}

// Placeholder. The real page comes in #19.
export default function EventsPage() {
  return <h1>Upcoming Events</h1>
}
