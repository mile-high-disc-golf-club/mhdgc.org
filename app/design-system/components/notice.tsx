import type { ReactNode } from 'react'

import { Text } from './text'

// Tinted, with a solid stripe in the same family. Text inside stays `ink`,
// which colors.test.ts checks on every `-soft` tint. `accent` isn't a tone,
// because its gold tint reads too close to `warning`.
const tones = {
  info: 'border-info bg-info-soft',
  success: 'border-success bg-success-soft',
  warning: 'border-warning bg-warning-soft',
  danger: 'border-danger bg-danger-soft',
}

export type NoticeTone = keyof typeof tones

/**
 * A message set apart from the page, such as a course closure or a failed load. Put
 * Text presets inside. Pass `role="alert"` only for something that appears after the
 * page loads and needs attention now, such as an error; `role="status"` for a quieter
 * update. A notice that's part of the page from the start needs no role.
 */
export function Notice({
  tone = 'info',
  title,
  role,
  children,
}: {
  tone?: NoticeTone
  title?: string
  role?: 'alert' | 'status'
  children: ReactNode
}) {
  return (
    <div
      role={role}
      className={`flex flex-col gap-1 rounded-lg border-l-4 px-4 py-3 text-ink ${tones[tone]}`}
    >
      {title && (
        <Text weight="semibold" color={tone}>
          {title}
        </Text>
      )}
      {children}
    </div>
  )
}
