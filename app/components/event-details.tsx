import type { CalendarEvent, DescriptionParagraph } from '~/../shared/api'
import { Icon, Text } from '~/design-system'
import { mapsUrl } from '~/lib'

import { TextLink } from './text-link'

/**
 * An event's details beyond its time, title and calendar: its location, linked to
 * Google Maps, its description's text and links, and its page on Google Calendar. Each
 * is left out when the event has none. The list shows these in an event's panel, and
 * the month grid in a dialog.
 */
export function EventDetails({ event }: { event: CalendarEvent }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
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
  )
}

// True when there's anything for EventDetails to show.
export function hasEventDetails(event: CalendarEvent): boolean {
  return Boolean(event.location) || event.description.length > 0 || Boolean(event.url)
}

function Description({ paragraphs }: { paragraphs: DescriptionParagraph[] }) {
  return (
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
}
