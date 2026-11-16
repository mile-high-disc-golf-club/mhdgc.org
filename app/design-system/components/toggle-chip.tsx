import type { ComponentProps } from 'react'

import type { EventColor } from '../theme'
import { Icon } from './icon'
import type { IconName } from './icons'
import { Text } from './text'

// Pressed, the chip is filled in its color. Not pressed, it's outlined in gray
// on the surface, with its icon outlined too, so the state never rests on color
// alone. Classes are written out in full so Tailwind finds them.
const pressedColors = {
  'event-tags': 'aria-pressed:border-event-tags aria-pressed:bg-event-tags',
  'event-ladies-tags': 'aria-pressed:border-event-ladies-tags aria-pressed:bg-event-ladies-tags',
  'event-tournaments': 'aria-pressed:border-event-tournaments aria-pressed:bg-event-tournaments',
  'event-board': 'aria-pressed:border-event-board aria-pressed:bg-event-board',
  'event-clinics': 'aria-pressed:border-event-clinics aria-pressed:bg-event-clinics',
  'event-volunteer': 'aria-pressed:border-event-volunteer aria-pressed:bg-event-volunteer',
} satisfies Record<EventColor, string>

/**
 * A pill that turns something on or off, such as showing one calendar's events. It's
 * a toggle button: `pressed` sets `aria-pressed`, and the label stays the same in
 * both states. Lay chips out in a labeled group with `gap`.
 */
export function ToggleChip({
  pressed,
  color,
  icon,
  type = 'button',
  children,
  ...props
}: Omit<ComponentProps<'button'>, 'className' | 'aria-pressed'> & {
  pressed: boolean
  color: EventColor
  icon: IconName
}) {
  return (
    <button
      {...props}
      type={type}
      aria-pressed={pressed}
      className={`inline-flex min-h-11 items-center gap-2 rounded-full border border-line-strong bg-surface px-4 py-2 text-ink not-aria-pressed:hover:bg-surface-hover aria-pressed:text-on-event motion-safe:transition-transform motion-safe:active:scale-95 ${pressedColors[color]}`}
    >
      <Icon name={icon} filled={pressed} size="sm" />
      <Text.Label>{children}</Text.Label>
    </button>
  )
}
