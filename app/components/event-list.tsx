import { useId, useState } from 'react'

import type { CalendarEvent } from '~/../shared/api'
import { Badge, Button, IconButton, Text } from '~/design-system'
import { type Calendar, type DayGroup, dayHeading, eventTime } from '~/lib'

import { CalendarLabel } from './calendar-label'
import { EventDetails, hasEventDetails } from './event-details'

/**
 * Upcoming events grouped by date, each date a heading over its events. `more` shows
 * a Show more button below the last date, which calls `onShowMore`.
 */
export function EventList({
  groups,
  calendars,
  now,
  more,
  onShowMore,
}: {
  groups: DayGroup[]
  calendars: Calendar[]
  // Today, in Denver, gets its own label.
  now: Date
  more: boolean
  onShowMore: () => void
}) {
  const bySlug = new Map(calendars.map((calendar) => [calendar.slug, calendar]))
  return (
    <div className="flex flex-col gap-8">
      {groups.map(({ day, events }) => {
        const { label, relative } = dayHeading(day, now)
        return (
          <div key={day} className="flex flex-col gap-3">
            {/* An h2 under the page's h1, set smaller and lighter than the event
                titles, so the events stay the focus. */}
            <Text as="h2" weight="semibold" color="muted">
              {relative ? `${relative}, ${label}` : label}
            </Text>
            <ul className="flex flex-col gap-3">
              {events.map((event) => {
                const calendar = bySlug.get(event.calendar)
                return calendar ? (
                  <li key={event.id}>
                    <EventItem event={event} calendar={calendar} />
                  </li>
                ) : null
              })}
            </ul>
          </div>
        )
      })}
      {more && (
        <div className="flex justify-center">
          <Button variant="secondary" onClick={onShowMore}>
            Show more
          </Button>
        </div>
      )}
    </div>
  )
}

function EventItem({ event, calendar }: { event: CalendarEvent; calendar: Calendar }) {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const time = eventTime(event)
  const hasMore = hasEventDetails(event)
  return (
    <article
      data-cancelled={event.cancelled || undefined}
      className="flex items-start gap-2 rounded-lg border border-line bg-surface p-3 sm:p-4"
    >
      <div className="grid min-w-0 flex-1 gap-x-6 gap-y-1 sm:grid-cols-[10rem_1fr]">
        <Text weight="semibold" numeric color={event.cancelled ? 'muted' : 'ink'}>
          {event.cancelled ? <s>{time}</s> : time}
        </Text>
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <Text as="h3" size="xl" weight="semibold" color={event.cancelled ? 'muted' : 'ink'}>
              {event.cancelled ? <s>{event.title}</s> : event.title}
            </Text>
            {event.cancelled && <Badge tone="danger">Cancelled</Badge>}
          </div>
          <CalendarLabel calendar={calendar} />
          {hasMore && (
            // Grows from no height to its content's, so it animates without
            // measuring. Closed, it's inert: hidden from screen readers and
            // skipped by Tab.
            <div
              id={panelId}
              data-open={open || undefined}
              inert={!open || undefined}
              className="grid grid-rows-[0fr] opacity-0 data-open:grid-rows-[1fr] data-open:opacity-100 motion-safe:transition-[grid-template-rows,opacity] motion-safe:duration-200"
            >
              {/* Reaches past the column, so focus outlines aren't clipped. */}
              <div className="-mx-1 min-h-0 overflow-hidden px-1">
                <div className="pt-1 pb-1">
                  <EventDetails event={event} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {hasMore && (
        // Points down while closed and up while open.
        <span
          data-open={open || undefined}
          className="flex data-open:rotate-180 motion-safe:transition-transform motion-safe:duration-200"
        >
          <IconButton
            icon="chevron"
            label={`More about ${event.title}`}
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => {
              setOpen(!open)
            }}
          />
        </span>
      )}
    </article>
  )
}
