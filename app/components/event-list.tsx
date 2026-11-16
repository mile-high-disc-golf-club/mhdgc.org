import type { CalendarEvent, DescriptionParagraph } from '~/../shared/api'
import { Badge, Button, Icon, Text } from '~/design-system'
import {
  type Calendar,
  type DayGroup,
  dayHeading,
  eventTime,
  isLongDescription,
  mapsUrl,
} from '~/lib'

import { CalendarLabel } from './calendar-label'
import { TextLink } from './text-link'

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
            {/* An h2 under the page's h1, sized down so the events stay the focus. */}
            <Text.H3 as="h2">{relative ? `${relative}, ${label}` : label}</Text.H3>
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
  const time = eventTime(event)
  return (
    <article
      data-cancelled={event.cancelled || undefined}
      className="grid gap-x-6 gap-y-2 rounded-lg border border-line bg-surface p-4 sm:grid-cols-[10rem_1fr] sm:p-5"
    >
      <Text weight="semibold" numeric color={event.cancelled ? 'muted' : 'ink'}>
        {event.cancelled ? <s>{time}</s> : time}
      </Text>
      <div className="flex min-w-0 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <Text as="h3" size="lg" weight="semibold" color={event.cancelled ? 'muted' : 'ink'}>
            {event.cancelled ? <s>{event.title}</s> : event.title}
          </Text>
          {event.cancelled && <Badge tone="danger">Cancelled</Badge>}
        </div>
        <CalendarLabel calendar={calendar} />
        {event.location && (
          <div className="flex items-start gap-1.5 text-ink-muted">
            {/* Lines the icon up with the first line of the link. */}
            <span className="flex min-h-6 items-center">
              <Icon name="location" size="sm" />
            </span>
            <div className="min-w-0 wrap-anywhere">
              <TextLink to={mapsUrl(event.location)} newTab>
                {event.location}
              </TextLink>
            </div>
          </div>
        )}
        {event.description.length > 0 && <Description paragraphs={event.description} />}
        {event.url && (
          <TextLink to={event.url} standalone newTab>
            Open in Google Calendar
          </TextLink>
        )}
      </div>
    </article>
  )
}

// Paragraphs of text and links. A long one starts collapsed behind a summary,
// so the list stays easy to scan.
function Description({ paragraphs }: { paragraphs: DescriptionParagraph[] }) {
  const content = (
    <div className="flex min-w-0 flex-col gap-2 wrap-anywhere">
      {paragraphs.map((segments, index) => (
        // Paragraphs have no identity of their own and never reorder.
        <Text.Body key={index} color="muted">
          {segments.map((segment, part) =>
            typeof segment === 'string' ? (
              segment
            ) : (
              <TextLink key={part} to={segment.href} newTab>
                {segment.text}
              </TextLink>
            ),
          )}
        </Text.Body>
      ))}
    </div>
  )
  if (!isLongDescription(paragraphs)) return content
  return (
    <details className="group flex flex-col">
      <summary className="inline-flex min-h-11 list-none items-center gap-1 self-start rounded-lg text-link [&::-webkit-details-marker]:hidden">
        <Text.Label>Details</Text.Label>
        <span className="flex group-open:rotate-180 motion-safe:transition-transform">
          <Icon name="chevron" size="sm" />
        </span>
      </summary>
      {content}
    </details>
  )
}
