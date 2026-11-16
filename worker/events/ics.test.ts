import { describe, expect, test } from 'vitest'

import boardMeeting from './fixtures/board-meeting.ics?raw'
import empty from './fixtures/empty.ics?raw'
import tags from './fixtures/rotating-tags-league.ics?raw'
import synthetic from './fixtures/synthetic.ics?raw'
import tournament from './fixtures/tournament.ics?raw'
import { expandFeed } from './ics'
import { eventWindow } from './time'

// The fixtures were downloaded from the club's public feeds on 2026-11-15,
// except synthetic.ics, which covers cases they don't have.
const november = eventWindow(new Date('2026-11-15T12:00:00Z'))

function titled(events: ReturnType<typeof expandFeed>, title: string) {
  return events.filter((event) => event.title.startsWith(title))
}

describe('expandFeed', () => {
  test('an empty calendar has no events', () => {
    expect(expandFeed(empty, november)).toEqual([])
  })

  test('rejects text that is not a feed', () => {
    expect(() => expandFeed('<html>Sign in</html>', november)).toThrow()
  })

  test('expands a COUNT series, applies its EXDATE and RECURRENCE-ID edits (Winter Warriors)', () => {
    const events = titled(expandFeed(tournament, november), 'Winter Warriors')
    // COUNT=15 from 2026-11-07, less the EXDATE on 2027-02-13.
    expect(events).toHaveLength(14)
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
    // 8am to 1pm Denver time (MST, UTC-7).
    expect(events[0]).toMatchObject({
      id: '6ot93pmu0j64t4c56g11ifeate_20261107T150000Z',
      start: '2026-11-07T15:00:00.000Z',
      end: '2026-11-07T20:00:00.000Z',
      allDay: false,
      cancelled: false,
      location: null,
      url: null,
    })
    // An edited occurrence keeps the series' UID and its own date in the ID.
    expect(events[2]).toMatchObject({
      id: '6ot93pmu0j64t4c56g11ifeate_20261121T150000Z',
      description: [
        [
          {
            href: 'https://www.discgolfscene.com/tournament/Winter_Warriors_XXII_Week_3_Ferhinger_Ranch_2026',
            text: 'https://www.discgolfscene.com/tournament/Winter_Warriors_XXII_Week_3_Ferhinger_Ranch_2026',
          },
        ],
      ],
    })
    expect(events.some((event) => event.start.startsWith('2027-02-13'))).toBe(false)
    expect(new Set(events.map((event) => event.id)).size).toBe(14)
  })

  test('converts a UTC time ("WW Glow @Owls")', () => {
    expect(titled(expandFeed(tournament, november), 'WW Glow')).toEqual([
      expect.objectContaining({
        id: '78upeckfiearqd9l9k9dcjikkm_20261128T230000Z',
        start: '2026-11-28T23:00:00.000Z',
        end: '2026-11-29T00:00:00.000Z',
        allDay: false,
      }),
    ])
  })

  test('keeps a multi-day all-day event as dates (High Plains Challenge)', () => {
    expect(titled(expandFeed(tournament, november), 'High Plains')).toEqual([
      expect.objectContaining({
        id: '7e4quethk4gp0jgl9gelfkfq8l_20270625',
        start: '2027-06-25',
        end: '2027-06-28',
        allDay: true,
        location: null,
      }),
    ])
  })

  test("expands a weekly series with no end across DST (Johnny Robert's Tags)", () => {
    const events = titled(expandFeed(tags, november), "Johnny Robert's")
    // Every Friday at 7:30pm Denver time, 2026-11-06 to 2027-10-29.
    expect(events).toHaveLength(52)
    expect(events[0]).toMatchObject({
      start: '2026-11-07T02:30:00.000Z', // MST, UTC-7
      end: '2026-11-07T05:00:00.000Z',
      location:
        'Memorial Park and Johnny Roberts Disc Golf Course, 8001 W 59th Ave, Arvada, CO 80004, USA',
    })
    expect(events.find((event) => event.start.startsWith('2027-06-05'))?.start).toBe(
      '2027-06-05T01:30:00.000Z', // MDT, UTC-6
    )
    expect(events.at(-1)?.start).toBe('2027-10-30T01:30:00.000Z')
  })

  test('ends a series at its UNTIL', () => {
    // The 2026 season's series ended in early November.
    expect(titled(expandFeed(tags, november), 'Fehringer')).toEqual([])
    const october = eventWindow(new Date('2026-10-10T12:00:00Z'))
    const fehringer = titled(expandFeed(tags, october), 'Fehringer')
    // Wednesdays in October. UNTIL is the end of 2026-11-03 in Denver.
    expect(fehringer.map((event) => event.start.slice(0, 10))).toEqual([
      '2026-10-07',
      '2026-10-14',
      '2026-10-21',
      '2026-10-28',
    ])
    // Badlands has no location.
    expect(titled(expandFeed(tags, october), 'Badlands')[0].location).toBeNull()
  })

  test('only returns occurrences in the window', () => {
    const board = expandFeed(boardMeeting, november)
    // The 2025 meeting and the September special meeting are before November.
    expect(board.map((event) => event.start)).toEqual([
      '2026-11-13T01:30:00.000Z',
      '2026-12-11T01:30:00.000Z',
    ])
    expect(board[0].location).toBe(
      'G1 Climbing + Fitness, 8845 W 116th Cir, Broomfield, CO 80021, USA',
    )
    const future = eventWindow(new Date('2027-12-01T12:00:00Z'))
    expect(expandFeed(tournament, future)).toEqual([])
  })

  test('keeps cancelled events and occurrences, and drops EXDATEs', () => {
    const events = expandFeed(synthetic, november)
    expect(titled(events, 'Cancelled single event')).toEqual([
      expect.objectContaining({ cancelled: true, location: 'Somewhere, CO' }),
    ])
    const clinic = titled(events, 'Weekly clinic')
    // 4 Tuesdays, less the EXDATE on 12-08; 12-15 cancelled; 12-22 moved to Wednesday noon.
    expect(
      clinic.map(({ id, start, cancelled, title }) => ({ id, start, cancelled, title })),
    ).toEqual([
      {
        id: 'weekly-with-edits@example.com_20261202T000000Z',
        start: '2026-12-02T00:00:00.000Z',
        cancelled: false,
        title: 'Weekly clinic',
      },
      {
        id: 'weekly-with-edits@example.com_20261216T000000Z',
        start: '2026-12-16T00:00:00.000Z',
        cancelled: true,
        title: 'Weekly clinic',
      },
      {
        id: 'weekly-with-edits@example.com_20261223T000000Z',
        start: '2026-12-23T19:00:00.000Z',
        cancelled: false,
        title: 'Weekly clinic (moved)',
      },
    ])
    expect(clinic[2].location).toBe('Another park')
    expect(clinic[0].description).toEqual([
      ['Plain text description.'],
      ['See ', { href: 'https://example.org/clinic', text: 'https://example.org/clinic' }, '.'],
    ])
  })

  test('handles multi-day timed events, floating times and URL', () => {
    const events = expandFeed(synthetic, november)
    expect(titled(events, 'Weekend trip')[0]).toMatchObject({
      start: '2026-12-05T01:00:00.000Z',
      end: '2026-12-06T23:00:00.000Z',
      allDay: false,
    })
    // No TZID: read in the calendar's zone, America/Denver.
    expect(titled(events, 'Floating time')[0]).toMatchObject({
      start: '2026-12-11T01:00:00.000Z',
      url: 'https://example.com/event',
    })
  })
})
