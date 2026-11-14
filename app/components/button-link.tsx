import type { ComponentProps } from 'react'
import { Link } from 'react-router'

import { buttonClasses, type ButtonVariant, Text } from '~/design-system'

/**
 * A link that is an action, such as "Join the club", so it looks like a Button. Its
 * label can hold an Icon beside the text.
 */
export function ButtonLink({
  variant = 'primary',
  children,
  ...props
}: Omit<ComponentProps<typeof Link>, 'className'> & { variant?: ButtonVariant }) {
  return (
    <Link {...props} className={buttonClasses({ variant })}>
      <Text.Button>{children}</Text.Button>
    </Link>
  )
}
