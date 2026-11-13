import { pageTitle } from '~/site'

import type { Route } from './+types/membership'

export function meta(): Route.MetaDescriptors {
  return [{ title: pageTitle('Membership') }]
}

// Placeholder. The real page comes in #12.
export default function MembershipPage() {
  return <h1>Membership</h1>
}
