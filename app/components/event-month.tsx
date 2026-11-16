import { useId, useState } from 'react'

import type { CalendarEvent } from '~/../shared/api'
import { Icon, IconButton, Text } from '~/design-system'
import {
  type Calendar,
  dayHeading,
  denverDay,
  eventTime,
  gridMonthList,
  monthEvents,
  monthLabel,
  monthWeeks,
  startTime,
} from '~/lib'

import { calendarColors, CalendarLabel } from './calendar-label'

const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

// A day shows this many events. A day with more shows one fewer and a
// "+N more" button that opens all of them.
const perDay = 3

/**
 * A month of events as a calendar grid, from the current month through the 12 months
 * `/api/events` returns, with previous and next buttons. Days earlier this month
 * show their events muted. Wide screens only: seven columns are too narrow on a phone.
 */
export function EventMonth({
  events,
  calendars,
  now,
}: {
  events: CalendarEvent[]
  calendars: Calendar[]
  now: Date
}) {
  const months = gridMonthList(now)
  const [index, setIndex] = useState(0)
  const month = months[index]
  const today = denverDay(now)
  const days = monthEvents(events, month)
  const bySlug = new Map(calendars.map((calendar) => [calendar.slug, calendar]))
  const headingId = useId()
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        {/* Announced when the buttons change the month. */}
        <div aria-live="polite">
          <Text.H3 as="h2" id={headingId}>
            {monthLabel(month)}
          </Text.H3>
        </div>
        <div className="flex gap-2">
          <IconButton
            icon="previous"
            label="Previous month"
            variant="secondary"
            disabled={index === 0}
            onClick={() => {
              setIndex(index - 1)
            }}
          />
          <IconButton
            icon="next"
            label="Next month"
            variant="secondary"
            disabled={index === months.length - 1}
            onClick={() => {
              setIndex(index + 1)
            }}
          />
        </div>
      </div>
      <table aria-labelledby={headingId} className="w-full table-fixed border-collapse">
        <thead>
          <tr>
            {weekdays.map((weekday) => (
              <th key={weekday} scope="col" className="pb-2 text-left">
                <abbr title={weekday} className="no-underline">
                  <Text.Label color="muted">{weekday.slice(0, 3)}</Text.Label>
                </abbr>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {monthWeeks(month).map((week) => (
            <tr key={week.find(Boolean)}>
              {week.map((day, column) =>
                day ? (
                  <Day
                    key={day}
                    day={day}
                    today={today}
                    now={now}
                    events={(days.get(day) ?? []).flatMap((event) => {
                      const calendar = bySlug.get(event.calendar)
                      return calendar ? [{ event, calendar }] : []
                    })}
                  />
                ) : (
                  // Days from the months on either side are left blank.
                  <td key={`blank-${String(column)}`} className="border border-line bg-canvas" />
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

type DayEvent = { event: CalendarEvent; calendar: Calendar }

function Day({
  day,
  today,
  now,
  events,
}: {
  day: string
  today: string
  now: Date
  events: DayEvent[]
}) {
  const past = day < today
  const shown = events.length > perDay ? events.slice(0, perDay - 1) : events
  const { label } = dayHeading(day, now)
  const popoverId = `day-${day}`
  return (
    <td
      data-past={past || undefined}
      data-today={day === today || undefined}
      className="h-32 border border-line bg-surface p-1.5 align-top data-past:bg-canvas"
    >
      <div className="flex flex-col gap-1">
        <time dateTime={day} className="flex">
          <span
            aria-hidden="true"
            data-today={day === today || undefined}
            className="flex size-7 items-center justify-center rounded-full data-today:bg-primary data-today:text-on-primary"
          >
            <Text.Label numeric color={past ? 'muted' : 'current'}>
              {Number(day.slice(8))}
            </Text.Label>
          </span>
          <span className="sr-only">{day === today ? `Today, ${label}` : label}</span>
        </time>
        {shown.length > 0 && (
          <ul className="flex flex-col gap-1">
            {shown.map(({ event, calendar }) => (
              <li key={`${event.calendar}-${event.id}`}>
                <GridEvent event={event} calendar={calendar} past={past} />
              </li>
            ))}
          </ul>
        )}
        {shown.length < events.length && (
          <>
            {/* A 44px tap target around a smaller visible button, as IconButton does. */}
            <button
              type="button"
              popoverTarget={popoverId}
              className="relative self-start rounded px-1 text-link after:absolute after:inset-x-0 after:top-1/2 after:h-11 after:-translate-y-1/2 hover:underline"
            >
              <Text.Caption color="current">
                +{events.length - shown.length} more <span className="sr-only">on {label}</span>
              </Text.Caption>
            </button>
            <div
              id={popoverId}
              popover="auto"
              role="dialog"
              aria-label={label}
              className="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-lg border border-line bg-surface p-4 text-ink shadow-lg backdrop:bg-scrim"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-4">
                  <Text.H3 as="p">{label}</Text.H3>
                  <IconButton
                    icon="close"
                    label="Close"
                    popoverTarget={popoverId}
                    popoverTargetAction="hide"
                  />
                </div>
                <ul className="flex flex-col gap-3">
                  {events.map(({ event, calendar }) => (
                    <li key={`${event.calendar}-${event.id}`} className="flex flex-col gap-1">
                      <Text.Small numeric color="muted">
                        {event.cancelled ? <s>{eventTime(event)}</s> : eventTime(event)}
                      </Text.Small>
                      <Text weight="semibold" color="ink">
                        {event.cancelled ? <s>{event.title}</s> : event.title}
                        {event.cancelled && ' (Cancelled)'}
                      </Text>
                      <CalendarLabel calendar={calendar} />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        )}
      </div>
    </td>
  )
}

// One event in a day: the calendar's icon and the start time and title on one
// line, tinted in the calendar's color. Earlier days are gray instead. The icon
// is named, since the calendar's name doesn't fit.
function GridEvent({
  event,
  calendar,
  past,
}: {
  event: CalendarEvent
  calendar: Calendar
  past: boolean
}) {
  const colors = calendarColors[calendar.color]
  const time = startTime(event)
  return (
    <div
      className={`flex min-w-0 items-center gap-1 rounded border-l-4 px-1.5 py-0.5 ${past ? 'border-line-strong bg-surface-hover text-ink-muted' : `${colors.soft} text-ink`}`}
      title={`${eventTime(event)}: ${event.title} (${calendar.name}${event.cancelled ? ', cancelled' : ''})`}
    >
      <span className={`flex ${past ? '' : colors.ink}`}>
        <Icon name={calendar.icon} size="sm" label={calendar.name} />
      </span>
      <div className="min-w-0">
        <Text.Caption as="p" color="current" lines={1}>
          {event.cancelled && <span className="sr-only">Cancelled:</span>}
          {event.cancelled && ' '}
          {time && <span className="tabular-nums">{time} </span>}
          {event.cancelled ? <s>{event.title}</s> : event.title}
        </Text.Caption>
      </div>
    </div>
  )
}
