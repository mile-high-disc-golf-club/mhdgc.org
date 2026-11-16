// `/api/events` responses for stories and tests, not shipped with the site.
//
// events.fixture.json is what `/api/events` returned on 2026-11-15 for the
// Calendar API responses in worker/events/fixtures, run through the Worker's
// own mapping: two weekly tag rounds, Winter Warriors with a different course
// each week, a glow round, two board meetings and High Plains Challenge, a
// three-day all-day event. Ladies Tags, Clinic and Volunteer Day were empty.
import type { CalendarEvent, EventsResponse } from '~/../shared/api'

import fixture from './events.fixture.json'

// Sunday, November 15, 2026, at noon in Denver: when the fixture was taken.
export const fixtureNow = new Date('2026-11-15T19:00:00Z')

export const eventsResponse = fixture as EventsResponse

function example(
  event: Partial<CalendarEvent> & Pick<CalendarEvent, 'id' | 'calendar' | 'title'>,
): CalendarEvent {
  return {
    start: '',
    end: '',
    allDay: false,
    cancelled: false,
    location: null,
    description: [],
    url: null,
    ...event,
  }
}

const longDescription: CalendarEvent['description'] = [
  ['Example agenda, to show a long description. Not a real meeting.'],
  [
    'Each paragraph shows on its own line, and links such as ',
    { href: 'https://example.com/agenda', text: 'the agenda' },
    ' stay links.',
  ],
  [
    'A description with more than two paragraphs, or more than a few lines of text, starts collapsed so the list stays easy to scan on a phone.',
  ],
]

function edit(event: CalendarEvent): CalendarEvent {
  if (event.title === 'Village Greens Tags' && event.start === '2026-11-29T21:00:00.000Z')
    return { ...event, cancelled: true }
  if (event.title === 'Board Meeting' && event.start === '2026-12-11T01:30:00.000Z')
    return { ...event, description: longDescription }
  return event
}

/**
 * The real events, plus made-up ones that aren't in the feeds: an event on each of
 * the three empty calendars, so every chip and color shows, a cancelled round and
 * a description long enough to collapse.
 */
export const exampleResponse: EventsResponse = {
  ...eventsResponse,
  events: [
    ...eventsResponse.events.map(edit),
    example({
      id: 'example-ladies',
      calendar: 'ladies-tags',
      title: 'Example Ladies Tags Round',
      start: '2026-11-18T23:30:00.000Z',
      end: '2026-11-19T01:30:00.000Z',
      location: 'Example Disc Golf Course',
    }),
    example({
      id: 'example-clinic',
      calendar: 'clinics',
      title: 'Example Putting Clinic',
      start: '2026-11-21T20:00:00.000Z',
      end: '2026-11-21T22:00:00.000Z',
    }),
    example({
      id: 'example-volunteer',
      calendar: 'volunteer',
      title: 'Example Volunteer Day',
      start: '2026-11-22',
      end: '2026-11-23',
      allDay: true,
    }),
  ].sort((a, b) => a.start.localeCompare(b.start)),
}

export const emptyResponse: EventsResponse = { ...eventsResponse, events: [] }

export const partialResponse: EventsResponse = { ...eventsResponse, partial: true }
