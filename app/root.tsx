import type { ReactNode } from 'react'
import {
  isRouteErrorResponse,
  Links,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'react-router'

import type { Route } from './+types/root'
import { navLinks, pageTitle, siteName } from './site'

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {/* Placeholder shell. The real header, nav and footer come in #8. */}
        <header>
          <a href="#main">Skip to content</a>
          <p>{siteName}</p>
          <nav aria-label="Main">
            <ul>
              {navLinks.map((link) => (
                <li key={link.to}>
                  <NavLink to={link.to} end>
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </header>
        <main id="main">{children}</main>
        <footer>
          <p>Mile High Disc Golf Club is a registered 501(c)(3)</p>
        </footer>
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
