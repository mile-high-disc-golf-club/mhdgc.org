import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import boardJson from './fixtures/board.json?raw'
import tagsJson from './fixtures/tags.json?raw'
import tournamentsJson from './fixtures/tournaments.json?raw'
import { type ApiEvent, eventsUrl, fetchCalendarEvents, toFeedEvent } from './google'
import { eventWindow } from './time'

const [board, tags, tournaments] = [boardJson, tagsJson, tournamentsJson].map(
  (raw) => JSON.parse(raw) as { items: ApiEvent[] },
)

// The fixtures are real Calendar API responses for the club's calendars,
// recorded on 2026-11-15 with the Worker's `fields`, for November 2026 to
// October 2027.
const november = eventWindow(new Date('2026-11-15T12:00:00Z'))

function mapped(items: ApiEvent[]) {
  return items.flatMap((item) => toFeedEvent(item) ?? [])
}
function titled(items: ApiEvent[], title: string) {
  return mapped(items)
    .filter((event) => event.title.startsWith(title))
    .sort((a, b) => a.start.localeCompare(b.start))
}

describe('toFeedEvent', () => {
  test('maps each Winter Warriors occurrence, edits applied (RECURRENCE-ID, EXDATE)', () => {
    const events = titled(tournaments.items, 'Winter Warriors')
    // COUNT=15 from 2026-11-07, less the deleted 2027-02-13.
    expect(events.map((event) => event.title)).toEqual([
      'Winter Warriors - Glen Isle',
      'Winter Warriors - Sakuna Pines',
      'Winter Warriors - Fehringer',
      "Winter Warriors - Owl's Den",
      'Winter Warriors - Clark Centennial',
      'Winter Warriors - Coal Creek',
      'Winter Warriors - Creekside Church',
      'Winter Warriors - Centre Hills',
      'Winter Warriors - Birds Nest',
      'Winter Warriors - Lower Badlands',
      'Winter Warriors - TBD',
      'Winter Warriors - Westcreek',
      'Winter Warriors - Adams Hollow',
      'Winter Warriors - Exposition Park',
    ])
    // 8am to 1pm Denver time (MST, UTC-7), with Google's stable instance ID.
    expect(events[0]).toEqual({
      id: '6ot93pmu0j64t4c56g11ifeate_20261107T150000Z',
      title: 'Winter Warriors - Glen Isle',
      start: '2026-11-07T15:00:00.000Z',
      end: '2026-11-07T20:00:00.000Z',
      allDay: false,
      cancelled: false,
      location: null,
      description: [],
      url: expect.stringMatching(/^https:\/\/www\.google\.com\/calendar\/event\?eid=/) as string,
    })
    expect(events[2].description).toEqual([
      [
        {
          href: 'https://www.discgolfscene.com/tournament/Winter_Warriors_XXII_Week_3_Ferhinger_Ranch_2026',
          text: 'https://www.discgolfscene.com/tournament/Winter_Warriors_XXII_Week_3_Ferhinger_Ranch_2026',
        },
      ],
    ])
    expect(events.some((event) => event.start.startsWith('2027-02-13'))).toBe(false)
  })

  test('converts a time with an offset to UTC ("WW Glow @Owls")', () => {
    expect(titled(tournaments.items, 'WW Glow')).toEqual([
      expect.objectContaining({
        id: '78upeckfiearqd9l9k9dcjikkm',
        start: '2026-11-28T23:00:00.000Z',
        end: '2026-11-29T00:00:00.000Z',
        allDay: false,
      }),
    ])
  })

  test('keeps a multi-day all-day event as dates (High Plains Challenge)', () => {
    expect(titled(tournaments.items, 'High Plains')).toEqual([
      expect.objectContaining({ start: '2027-06-25', end: '2027-06-28', allDay: true }),
    ])
  })

  test("maps a weekly series with no end across DST (Johnny Robert's Tags)", () => {
    const events = titled(tags.items, "Johnny Robert's")
    expect(events).toHaveLength(52)
    expect(events[0]).toMatchObject({
      start: '2026-11-07T02:30:00.000Z', // 7:30pm MST, UTC-7
      location:
        'Memorial Park and Johnny Roberts Disc Golf Course, 8001 W 59th Ave, Arvada, CO 80004, USA',
    })
    expect(events.find((event) => event.start.startsWith('2027-06-05'))?.start).toBe(
      '2027-06-05T01:30:00.000Z', // 7:30pm MDT, UTC-6
    )
    // Series that ended with the 2026 season aren't in the window.
    expect(titled(tags.items, 'Fehringer')).toEqual([])
  })

  test('maps locations, and an event without one', () => {
    expect(mapped(board.items).map((event) => event.location)).toEqual([
      'G1 Climbing + Fitness, 8845 W 116th Cir, Broomfield, CO 80021, USA',
      'Lake Arbor Police Station, 8110 Vance Dr, Arvada, CO 80003, USA',
    ])
    expect(titled(tournaments.items, 'High Plains')[0].location).toBeNull()
  })

  test('keeps cancelled events, and defaults a missing end', () => {
    expect(
      toFeedEvent({
        id: 'x',
        status: 'cancelled',
        summary: ' Cancelled ',
        location: ' ',
        start: { dateTime: '2026-12-03T18:00:00-07:00' },
      }),
    ).toEqual({
      id: 'x',
      title: 'Cancelled',
      start: '2026-12-04T01:00:00.000Z',
      end: '2026-12-04T01:00:00.000Z',
      allDay: false,
      cancelled: true,
      location: null,
      description: [],
      url: null,
    })
    expect(toFeedEvent({ id: 'y', start: { date: '2026-12-31' } })).toMatchObject({
      start: '2026-12-31',
      end: '2027-01-01',
      allDay: true,
      title: '',
    })
  })

  test('skips items without an ID or a usable start', () => {
    expect(toFeedEvent({ start: { date: '2026-12-31' } })).toBeNull()
    expect(toFeedEvent({ id: 'z' })).toBeNull()
    expect(toFeedEvent({ id: 'z', start: { dateTime: 'not a date' } })).toBeNull()
  })
})

describe('fetchCalendarEvents', () => {
  const calendarId = 'c_abc@group.calendar.google.com'
  beforeEach(() => vi.spyOn(console, 'warn').mockImplementation(() => undefined))
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  test('asks for expanded occurrences in the window, with only the fields it uses', () => {
    const url = new URL(eventsUrl(calendarId, 'KEY', november))
    expect(url.pathname).toBe('/calendar/v3/calendars/c_abc%40group.calendar.google.com/events')
    expect(Object.fromEntries(url.searchParams)).toEqual({
      key: 'KEY',
      singleEvents: 'true',
      timeMin: '2026-11-01T06:00:00.000Z',
      timeMax: '2027-11-01T06:00:00.000Z',
      maxResults: '2500',
      fields: 'nextPageToken,items(id,status,htmlLink,summary,description,location,start,end)',
    })
  })

  test('follows nextPageToken', async () => {
    const fetchMock = vi.fn((url: string) => {
      const page = new URL(url).searchParams.get('pageToken')
      return Promise.resolve(
        Response.json(
          page
            ? { items: [{ id: 'b', start: { date: '2026-12-02' } }] }
            : { items: [{ id: 'a', start: { date: '2026-12-01' } }], nextPageToken: 'next' },
        ),
      )
    })
    vi.stubGlobal('fetch', fetchMock)
    const events = await fetchCalendarEvents(calendarId, 'KEY', november)
    expect(events.map((event) => event.id)).toEqual(['a', 'b'])
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  test("throws Google's error message, without the key", async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve(
          Response.json({ error: { code: 403, message: 'API key not valid.' } }, { status: 403 }),
        ),
      ),
    )
    const failure = fetchCalendarEvents(calendarId, 'SECRET-KEY', november)
    await expect(failure).rejects.toThrow('Calendar API HTTP 403: API key not valid.')
    await expect(failure).rejects.not.toThrow('SECRET-KEY')
  })
})
