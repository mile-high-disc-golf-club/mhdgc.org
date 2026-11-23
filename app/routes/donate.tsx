import { readPage } from '~/.server'
import { DonatePage } from '~/pages/donate'
import { pageMeta } from '~/seo'

import type { Route } from './+types/donate'

export function loader() {
  return { donate: readPage('donate'), club: readPage('donate-club') }
}

export function meta({ loaderData }: Route.MetaArgs): Route.MetaDescriptors {
  return pageMeta('/donate', loaderData.donate)
}

export default function DonateRoute({ loaderData }: Route.ComponentProps) {
  return <DonatePage {...loaderData} />
}
