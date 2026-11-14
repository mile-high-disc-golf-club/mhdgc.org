import type { ComponentProps } from 'react'
import { Link } from 'react-router'

import { Icon, Text, textLinkClasses } from '~/design-system'

/**
 * A text link: `link` colored, medium weight and underlined, all set by the design
 * system. In a sentence, `<TextLink to="/events">see the events</TextLink>`. On its own
 * line, add `standalone` for a 44px tap target. `newTab` is for a link to another site,
 * such as the club's Facebook page: it opens in a new tab and says so with an icon that
 * screen readers read as "opens in a new tab". Links within the site leave it off.
 * Links styled as buttons, cards or rows keep their own styles.
 */
export function TextLink({
  standalone = false,
  newTab = false,
  children,
  ...props
}: Omit<ComponentProps<typeof Link>, 'className' | 'target' | 'rel'> & {
  standalone?: boolean
  newTab?: boolean
}) {
  // An icon is a block in Tailwind, so a link with one lines them up in a row. It
  // still sits in a sentence, but wraps as one piece.
  const layout = standalone
    ? textLinkClasses({ standalone })
    : newTab
      ? 'inline-flex items-center gap-1'
      : undefined
  return (
    <Link
      {...props}
      className={layout}
      {...(newTab && { target: '_blank', rel: 'noopener noreferrer' })}
    >
      <Text.Link>{children}</Text.Link>
      {/* The space keeps the label and the icon's name apart when read as the link's
          name. A flex row doesn't draw it, so `gap` sets the visible spacing. */}
      {newTab && ' '}
      {newTab && <Icon name="external-link" size="sm" color="link" label="opens in a new tab" />}
    </Link>
  )
}
