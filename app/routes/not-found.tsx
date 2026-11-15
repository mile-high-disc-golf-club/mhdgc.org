import { data } from 'react-router'

import { NotFoundPage } from '~/pages/not-found'
import { pageTitle } from '~/site'

import type { Route } from './+types/not-found'

// Matches every path no other route does. The Worker renders it, so the
// response gets a real 404 status rather than a 200.
export function loader() {
  return data(null, { status: 404 })
}

export function meta(): Route.MetaDescriptors {
  return [{ title: pageTitle('Page not found') }, { name: 'robots', content: 'noindex' }]
}

export default NotFoundPage
