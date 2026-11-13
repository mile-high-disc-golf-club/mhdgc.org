import { pageTitle } from '~/site'

import type { Route } from './+types/home'

export function meta(): Route.MetaDescriptors {
  return [{ title: pageTitle() }]
}

// Placeholder. The real page comes in #11.
export default function HomePage() {
  return <h1>Welcome to the Mile High Disc Golf Club</h1>
}
