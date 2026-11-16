import { type EventColor, Icon, Text } from '~/design-system'
import type { Calendar } from '~/lib'

// Each calendar's color as classes, written out in full so Tailwind finds them.
// `ink` is text and icons in the color, `soft` a tinted block with a stripe in
// the fill, such as an event in the month grid. colors.test.ts covers both.
export const calendarColors = {
  'event-tags': { ink: 'text-event-tags-ink', soft: 'border-event-tags bg-event-tags-soft' },
  'event-ladies-tags': {
    ink: 'text-event-ladies-tags-ink',
    soft: 'border-event-ladies-tags bg-event-ladies-tags-soft',
  },
  'event-tournaments': {
    ink: 'text-event-tournaments-ink',
    soft: 'border-event-tournaments bg-event-tournaments-soft',
  },
  'event-board': { ink: 'text-event-board-ink', soft: 'border-event-board bg-event-board-soft' },
  'event-clinics': {
    ink: 'text-event-clinics-ink',
    soft: 'border-event-clinics bg-event-clinics-soft',
  },
  'event-volunteer': {
    ink: 'text-event-volunteer-ink',
    soft: 'border-event-volunteer bg-event-volunteer-soft',
  },
} satisfies Record<EventColor, { ink: string; soft: string }>

/**
 * Which calendar an event comes from: its icon and name in its color. The name always
 * shows, so color is never the only cue.
 */
export function CalendarLabel({ calendar }: { calendar: Calendar }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 self-start ${calendarColors[calendar.color].ink}`}
    >
      <Icon name={calendar.icon} size="sm" />
      <Text.Label>{calendar.name}</Text.Label>
    </span>
  )
}
