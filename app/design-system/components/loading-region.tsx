import type { ReactNode } from 'react'

import { Spinner } from './spinner'
import { Text } from './text'

// For a part of a page that loads in the browser, such as the events list.
// The status region stays mounted and only its contents change, because
// screen readers announce changes to an existing live region but often skip
// one that appears already filled. It sits outside the busy content, which is
// dimmed and inert while loading. While busy the region is at least tall
// enough for the spinner, so an empty first load has somewhere to show it,
// and the spinner stays on screen however far the page is scrolled. An empty
// first load reserves a screen's height, so whatever follows the region starts
// below the fold and doesn't jump when the content arrives. That jump counts
// as a layout shift. While idle, the status region shrinks to nothing, so it
// doesn't sit over the content, where axe can't tell the text's background.
export function LoadingRegion({
  busy = false,
  label = 'Loading…',
  children,
}: {
  busy?: boolean
  // What the spinner says, such as "Loading events…".
  label?: string
  children?: ReactNode
}) {
  return (
    <div data-busy={busy ? '' : undefined} className="relative flex flex-col data-busy:min-h-40">
      <div
        aria-busy={busy}
        inert={busy || undefined}
        data-busy={busy ? '' : undefined}
        className="flex flex-col gap-4 data-busy:pointer-events-none data-busy:opacity-40 data-busy:empty:min-h-dvh motion-safe:transition-opacity motion-safe:duration-150"
      >
        {children}
      </div>
      <div
        aria-live="polite"
        data-busy={busy ? '' : undefined}
        className="pointer-events-none absolute flex flex-col items-center justify-center text-ink-muted data-busy:inset-0"
      >
        {/* Centered in the content, but sticky to the middle of the screen, so on a
            long, scrolled list it never leaves the view. The offsets are half its
            height: the lg Spinner (2.5rem), gap-3 (0.75rem) and one line of
            Text.Body (1.5rem). Change them with any of those. */}
        {busy && (
          <div className="sticky top-[calc(50dvh-2.375rem)] bottom-[calc(50dvh-2.375rem)] flex flex-col items-center gap-3">
            <Spinner size="lg" />
            <Text.Body>{label}</Text.Body>
          </div>
        )}
      </div>
    </div>
  )
}
