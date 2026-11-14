import type { ReactNode } from 'react'

import { Icon } from './icon'
import type { IconName } from './icons'
import { Text } from './text'

// Each tone is text in a family's `-ink` on its `-soft` tint, a pairing
// colors.test.ts checks. `neutral` is for a badge that shouldn't stand out.
const tones = {
  neutral: 'bg-surface-hover text-ink-muted',
  primary: 'bg-primary-soft text-primary-ink',
  accent: 'bg-accent-soft text-accent-ink',
  success: 'bg-success-soft text-success-ink',
  info: 'bg-info-soft text-info-ink',
  warning: 'bg-warning-soft text-warning-ink',
  danger: 'bg-danger-soft text-danger-ink',
}

export type BadgeTone = keyof typeof tones

/**
 * A short label beside something, such as the calendar an event comes from. It isn't
 * interactive. Each calendar gets one tone, so events from the same one match. Color
 * is never the only cue: the label says which it is.
 */
export function Badge({
  tone = 'neutral',
  icon,
  children,
}: {
  tone?: BadgeTone
  icon?: IconName
  children: ReactNode
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 self-start rounded-full px-2.5 py-0.5 ${tones[tone]}`}
    >
      {icon && <Icon name={icon} size="sm" />}
      <Text.Label>{children}</Text.Label>
    </span>
  )
}
