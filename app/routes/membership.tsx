import { readImage, readPage } from '~/.server'
import { MembershipPage } from '~/pages/membership'
import { pageTitle } from '~/site'

import type { Route } from './+types/membership'

export function loader() {
  return {
    membership: readPage('membership'),
    join: readPage('membership-join'),
    matches: readPage('membership-matches'),
    tags: readImage('membership/bag-tags.jpg'),
  }
}

export function meta({ loaderData }: Route.MetaArgs): Route.MetaDescriptors {
  return [
    { title: pageTitle(loaderData.membership.title) },
    { name: 'description', content: loaderData.membership.description },
  ]
}

export default function MembershipRoute({ loaderData }: Route.ComponentProps) {
  return <MembershipPage {...loaderData} />
}
