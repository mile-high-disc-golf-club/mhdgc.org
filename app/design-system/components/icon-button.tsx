import type { ComponentProps } from 'react'

import { type ButtonVariant, buttonVariants } from './button'
import { Icon, type IconSize } from './icon'
import type { IconName } from './icons'

// The visible box stays snug around the icon, and an invisible 44px square
// centered on it is the tap target. It's a fixed size rather than an inset
// because insets start inside the border, which would cost a bordered button
// 2px. The target reaches past the smaller boxes, so keep at least `gap-2`
// between icon buttons or their targets overlap. Corners scale with the size.
const tapTarget =
  'after:absolute after:top-1/2 after:left-1/2 after:size-11 after:-translate-x-1/2 after:-translate-y-1/2'

const sizes = {
  sm: { button: 'size-8', icon: 'md', square: 'rounded-md' },
  md: { button: 'size-9', icon: 'lg', square: 'rounded-lg' },
  lg: { button: 'size-11', icon: 'xl', square: 'rounded-lg' },
} satisfies Record<string, { button: string; icon: IconSize; square: string }>

export type IconButtonSize = keyof typeof sizes

export function iconButtonClasses({
  variant = 'ghost',
  size = 'md',
  shape = 'square',
}: { variant?: ButtonVariant; size?: IconButtonSize; shape?: 'square' | 'circle' } = {}) {
  return `relative inline-flex shrink-0 items-center justify-center disabled:opacity-60 ${tapTarget} motion-safe:transition-transform motion-safe:not-disabled:active:scale-95 ${buttonVariants[variant]} ${sizes[size].button} ${shape === 'circle' ? 'rounded-full' : sizes[size].square}`
}

export function IconButton({
  icon,
  label,
  variant = 'ghost',
  size = 'md',
  shape = 'square',
  type = 'button',
  ...props
}: Omit<ComponentProps<'button'>, 'className' | 'children' | 'aria-label' | 'aria-labelledby'> & {
  icon: IconName
  // The button's accessible name, since there's no text to read.
  label: string
  variant?: ButtonVariant
  size?: IconButtonSize
  shape?: 'square' | 'circle'
}) {
  return (
    <button
      {...props}
      type={type}
      aria-label={label}
      className={iconButtonClasses({ variant, size, shape })}
    >
      <Icon name={icon} size={sizes[size].icon} />
    </button>
  )
}
