import type { ComponentProps } from 'react'
import { Link } from 'react-router'

import { buttonClasses, type ButtonVariant, Icon, Text } from '~/design-system'

/**
 * A link that is an action, such as "Join the club", so it looks like a Button. Its
 * label can hold an Icon beside the text. `newTab` is for an action on another site,
 * such as the club's fundraiser: it opens in a new tab and says so with an icon that
 * screen readers read as "opens in a new tab".
 */
export function ButtonLink({
  variant = 'primary',
  newTab = false,
  children,
  ...props
}: Omit<ComponentProps<typeof Link>, 'className' | 'target' | 'rel'> & {
  variant?: ButtonVariant
  newTab?: boolean
}) {
  return (
    <Link
      {...props}
      className={buttonClasses({ variant })}
      {...(newTab && { target: '_blank', rel: 'noopener noreferrer' })}
    >
      <Text.Button>
        {children}
        {/* The space keeps the label and the icon's name apart when read as the link's
            name. Text.Button is a flex row, so its gap sets the visible spacing. */}
        {newTab && ' '}
        {newTab && <Icon name="external-link" label="opens in a new tab" />}
      </Text.Button>
    </Link>
  )
}
