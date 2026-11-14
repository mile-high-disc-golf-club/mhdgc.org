import type { ComponentProps } from 'react'

import { Text } from './text'

// Shared with IconButton. `not-disabled:` keeps hover and press off a disabled
// button, and Tailwind only applies `hover:` on devices that can hover, so a
// tap on a phone shows the `active:` press instead of a hover that sticks.
export const buttonVariants = {
  primary:
    'bg-primary text-on-primary not-disabled:hover:bg-primary-hover not-disabled:active:bg-primary-hover',
  secondary:
    'border border-line-strong bg-surface not-disabled:hover:bg-surface-hover not-disabled:active:bg-surface-hover',
  ghost: 'not-disabled:hover:bg-surface-hover not-disabled:active:bg-surface-hover',
}

export type ButtonVariant = keyof typeof buttonVariants

// The box every button-shaped control shares: a 44px tap target, corners and padding.
const box = 'min-h-11 rounded-lg px-4 py-2.5'

/**
 * Button's look for a link that is an action, such as "Join the club". Wrap the label in
 * `Text.Button`, which sets the type and lines up an icon beside it. A link can't be
 * disabled, so there are no styles for that.
 */
export function buttonClasses({ variant = 'primary' }: { variant?: ButtonVariant } = {}) {
  return `inline-flex items-center justify-center ${box} motion-safe:transition-transform motion-safe:active:scale-95 ${buttonVariants[variant]}`
}

// Its children can hold an Icon beside the text. Like Text it takes no
// `className`: lay it out from the parent.
export function Button({
  variant = 'primary',
  type = 'button',
  children,
  ...props
}: Omit<ComponentProps<'button'>, 'className'> & { variant?: ButtonVariant }) {
  return (
    <button
      {...props}
      type={type}
      className={`inline-flex items-center justify-center ${box} disabled:opacity-60 motion-safe:transition-transform motion-safe:not-disabled:active:scale-95 ${buttonVariants[variant]}`}
    >
      <Text.Button>{children}</Text.Button>
    </button>
  )
}
