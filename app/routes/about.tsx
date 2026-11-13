import { pageTitle } from '~/site'

import type { Route } from './+types/about'

export function meta(): Route.MetaDescriptors {
  return [{ title: pageTitle('About') }]
}

// Placeholder. The real page comes in #13.
export default function AboutPage() {
  return <h1>Meet the Board</h1>
}
