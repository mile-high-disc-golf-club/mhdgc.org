import { pageTitle } from '~/site'

import type { Route } from './+types/events'

export function meta(): Route.MetaDescriptors {
  return [{ title: pageTitle('Events') }]
}

// Placeholder. The real page comes in #19.
export default function EventsPage() {
  return <h1>Upcoming Events</h1>
}
