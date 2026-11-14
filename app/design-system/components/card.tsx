import type { ReactNode } from 'react'

/**
 * A raised panel on the page's canvas, for one self-contained item such as an event,
 * a course or a board member. Pick the element with `as`: `article` for an item that
 * stands on its own, `li` inside a list. Like Text it takes no `className`; its
 * children stack with a gap.
 */
export function Card({
  as: Element = 'div',
  children,
}: {
  as?: 'div' | 'article' | 'section' | 'li'
  children: ReactNode
}) {
  return (
    <Element className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-4 sm:p-6">
      {children}
    </Element>
  )
}
