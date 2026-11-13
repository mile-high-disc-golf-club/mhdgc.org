import { data, Link } from 'react-router'

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

// The full 404 page comes in #14.
export default function NotFoundPage() {
  return (
    <>
      <h1>Page not found</h1>
      <p>
        That page doesn&apos;t exist. Go to the <Link to="/">home page</Link>.
      </p>
    </>
  )
}
