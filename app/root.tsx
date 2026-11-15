import './app.css'

import type { ReactNode } from 'react'
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
} from 'react-router'

import { SiteLayout } from '~/components'

import type { Route } from './+types/root'
import { pageTitle } from './site'

// The favicon, touch icons and manifest live in public/, where browsers expect them.
export const links: Route.LinksFunction = () => [
  { rel: 'icon', href: '/favicon.ico', sizes: '32x32' },
  { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
  { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
  { rel: 'manifest', href: '/manifest.webmanifest' },
]

// Runs at build time for prerendered pages, so the footer's copyright year is the
// build's year, and the HTML and the hydrated page agree.
export function loader() {
  return { year: new Date().getFullYear() }
}

// The year doesn't change between pages, so moving between pages fetches nothing.
export function shouldRevalidate() {
  return false
}

export function Layout({ children }: { children: ReactNode }) {
  // Undefined if the root loader failed and the error boundary is showing.
  const data = useRouteLoaderData<typeof loader>('root')
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* The header's surface color, as in manifest.webmanifest. */}
        <meta name="theme-color" content="#ffffff" />
        <Meta />
        <Links />
      </head>
      <body className="bg-canvas text-ink">
        <SiteLayout year={data?.year}>{children}</SiteLayout>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  return <Outlet />
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const heading = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : 'Something went wrong'
  return (
    <>
      <title>{pageTitle('Error')}</title>
      <h1>{heading}</h1>
      {/* A plain <a>, not <Link>: the router may be what broke, so a full page load is the safe way home. */}
      <p>
        Try again, or go back to the <a href="/">home page</a>.
      </p>
    </>
  )
}
