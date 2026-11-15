import type { ReactNode } from 'react'

import { Text } from '~/design-system'

import { SiteFooter } from './site-footer'
import { SiteHeader } from './site-header'

/**
 * The shell around every page: a skip link, the header and nav, the page in `main`,
 * and the footer. root.tsx renders it once, so pages render only their content.
 */
export function SiteLayout({ year, children }: { year?: number; children: ReactNode }) {
  return (
    // The target of the footer's "Back to top" link.
    <div id="top" className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-20 focus:inline-flex focus:min-h-11 focus:items-center focus:rounded-lg focus:bg-surface focus:px-4"
      >
        <Text.Link>Skip to content</Text.Link>
      </a>
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        {children}
      </main>
      <SiteFooter year={year} />
    </div>
  )
}
