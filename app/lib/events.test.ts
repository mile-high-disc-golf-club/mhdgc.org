import { describe, expect, it } from 'vitest'

import type { CalendarEvent } from '~/../shared/api'
import { eventsResponse, exampleResponse, fixtureNow } from '~/events.fixtures'

import {
  dayHeading,
  denverDay,
  eventDays,
  eventTime,
  googleCalendarUrl,
  gridMonthList,
  hasEnded,
  mapsUrl,
  monthEvents,
  monthLabel,
  monthWeeks,
  parseCalendars,
  parseView,
  startTime,
  toggleCalendar,
  upcomingEvents,
  webcalUrl,
} from './events'

// Intl puts thin and narrow no-break spaces around dashes and before AM/PM.
const plain = (text: string) => text.replace(/[\u2009\u202f]/g, ' ')

function timed(start: string, end: string, extra: Partial<CalendarEvent> = {}): CalendarEvent {
  return {
    id: start,
    calendar: 'tags',
    title: 'Round',
    start,
    end,
    allDay: false,
    cancelled: false,
    location: null,
    description: [],
    url: null,
    ...extra,
  }
}

function allDay(start: string, end: string): CalendarEvent {
  return { ...timed(start, end), allDay: true }
}

describe('Denver days', () => {
  it('puts an evening in Denver on its Denver day, not the UTC one', () => {
    // 6:30 PM on December 10 in Denver is already December 11 in UTC.
    expect(denverDay(new Date('2026-12-11T01:30:00Z'))).toBe('2026-12-10')
  })

  it('follows daylight time', () => {
    expect(denverDay(new Date('2027-07-01T05:30:00Z'))).toBe('2027-06-30')
    expect(denverDay(new Date('2027-01-01T06:30:00Z'))).toBe('2026-12-31')
  })

  it('covers each day of a multi-day all-day event, with the end exclusive', () => {
    expect(eventDays(allDay('2027-06-25', '2027-06-28'))).toEqual({
      first: '2027-06-25',
      last: '2027-06-27',
    })
    expect(eventDays(allDay('2027-06-25', '2027-06-26'))).toEqual({
      first: '2027-06-25',
      last: '2027-06-25',
    })
  })

  it("doesn't reach into the next day for an event ending at midnight", () => {
    const event = timed('2026-11-21T03:00:00Z', '2026-11-21T07:00:00Z')
    expect(eventDays(event)).toEqual({ first: '2026-11-20', last: '2026-11-20' })
  })

  it('ends an all-day event after its last day, and a timed one at its end', () => {
    expect(hasEnded(allDay('2026-11-15', '2026-11-16'), fixtureNow)).toBe(false)
    expect(hasEnded(allDay('2026-11-14', '2026-11-15'), fixtureNow)).toBe(true)
    expect(hasEnded(timed('2026-11-15T17:00:00Z', '2026-11-15T19:00:00Z'), fixtureNow)).toBe(true)
    expect(hasEnded(timed('2026-11-15T17:00:00Z', '2026-11-15T19:01:00Z'), fixtureNow)).toBe(false)
  })

  it('keeps an event with no length listed for a minute after it starts', () => {
    expect(hasEnded(timed('2026-11-15T19:00:00Z', '2026-11-15T19:00:00Z'), fixtureNow)).toBe(false)
    expect(hasEnded(timed('2026-11-15T18:59:30Z', '2026-11-15T18:59:30Z'), fixtureNow)).toBe(false)
    expect(hasEnded(timed('2026-11-15T18:59:00Z', '2026-11-15T18:59:00Z'), fixtureNow)).toBe(true)
  })
})

describe('the list', () => {
  const { groups, more } = upcomingEvents(eventsResponse.events, { now: fixtureNow, weeks: 8 })

  it('starts today and leaves out events that have ended', () => {
    expect(groups[0]?.day).toBe('2026-11-15')
    const ids = groups.flatMap((group) => group.events).map((event) => event.id)
    expect(ids).not.toContain('2ek16ernknsvai0hpqo35dedg1')
    expect(ids).toContain('02p3u13ibvir411ohuur2vh668')
    expect(groups[0]?.events.map((event) => event.title)).toEqual(['Village Greens Tags'])
  })

  it('runs through 8 weeks, then says there are more', () => {
    expect(groups.at(-1)?.day).toBe('2027-01-09')
    expect(groups.every((group) => group.day < '2027-01-10')).toBe(true)
    expect(more).toBe(true)
  })

  it('lists every occurrence of a weekly series on its own date', () => {
    const fridays = groups.filter((group) =>
      group.events.some((event) => event.title === "Johnny Robert's Tags (Glow)"),
    )
    expect(fridays.map((group) => group.day)).toEqual([
      '2026-11-20',
      '2026-11-27',
      '2026-12-04',
      '2026-12-11',
      '2026-12-18',
      '2026-12-25',
      '2027-01-01',
      '2027-01-08',
    ])
  })

  it("shows each week's course for an edited series", () => {
    const saturday = groups.find((group) => group.day === '2026-11-28')
    expect(saturday?.events.map((event) => event.title)).toEqual([
      "Winter Warriors - Owl's Den",
      'WW Glow @Owls',
    ])
  })

  it('keeps cancelled events', () => {
    const example = upcomingEvents(exampleResponse.events, { now: fixtureNow, weeks: 8 })
    const sunday = example.groups.find((group) => group.day === '2026-11-29')
    expect(sunday?.events).toEqual([
      expect.objectContaining({ title: 'Village Greens Tags', cancelled: true }),
    ])
  })

  it('reaches the whole window with more weeks, and then has no more', () => {
    const all = upcomingEvents(eventsResponse.events, { now: fixtureNow, weeks: 56 })
    expect(all.more).toBe(false)
    expect(all.groups.find((group) => group.day === '2027-06-25')?.events[0]?.title).toBe(
      'High Plains Challenge',
    )
    expect(all.groups.at(-1)?.day).toBe('2027-10-31')
  })

  it('lists an event that started before today under today, all-day events first', () => {
    const events = [
      timed('2026-11-15T20:00:00Z', '2026-11-15T21:00:00Z', { title: 'Later' }),
      allDay('2026-11-14', '2026-11-17'),
    ]
    const result = upcomingEvents(events, { now: fixtureNow, weeks: 1 })
    expect(result.groups).toHaveLength(1)
    expect(result.groups[0]?.events.map((event) => event.allDay)).toEqual([true, false])
  })
})

describe('the month grid', () => {
  it('pages through 12 months from the current one', () => {
    const months = gridMonthList(fixtureNow)
    expect(months).toHaveLength(12)
    expect(months[0]).toBe('2026-11')
    expect(months.at(-1)).toBe('2027-10')
  })

  it('lays out a month in weeks from Sunday', () => {
    const weeks = monthWeeks('2026-11')
    expect(weeks).toHaveLength(5)
    expect(weeks[0]?.[0]).toBe('2026-11-01')
    expect(weeks.at(-1)).toEqual(['2026-11-29', '2026-11-30', null, null, null, null, null])
    expect(monthWeeks('2027-01')[0]).toEqual([
      null,
      null,
      null,
      null,
      null,
      '2027-01-01',
      '2027-01-02',
    ])
  })

  it("puts each event on its Denver days, including the month's earlier days", () => {
    const days = monthEvents(eventsResponse.events, '2026-11')
    expect(days.get('2026-11-12')?.map((event) => event.title)).toEqual(['Board Meeting'])
    expect(days.has('2026-11-11')).toBe(false)
    const june = monthEvents(eventsResponse.events, '2027-06')
    for (const day of ['2027-06-25', '2027-06-26', '2027-06-27'])
      expect(june.get(day)?.[0]?.title).toBe('High Plains Challenge')
    expect(june.get('2027-06-28')?.[0]?.title).not.toBe('High Plains Challenge')
  })

  it('names the month', () => {
    expect(monthLabel('2026-11')).toBe('November 2026')
  })
})

describe('URL parameters', () => {
  const available = ['tags', 'tournaments', 'board']

  it('shows the month grid only for ?view=month', () => {
    expect(parseView(new URLSearchParams('view=month'))).toBe('month')
    expect(parseView(new URLSearchParams('view=list'))).toBe('list')
    expect(parseView(new URLSearchParams('view=grid'))).toBe('list')
    expect(parseView(new URLSearchParams())).toBe('list')
  })

  it('shows every calendar without ?cal=', () => {
    expect(parseCalendars(new URLSearchParams(), available)).toEqual(available)
  })

  it('shows the calendars in ?cal=, ignoring unknown ones', () => {
    const params = new URLSearchParams('cal=board,tags,clinics')
    expect(parseCalendars(params, available)).toEqual(['tags', 'board'])
    expect(parseCalendars(new URLSearchParams('cal='), available)).toEqual([])
  })

  it('toggles a calendar, dropping ?cal= when all are shown again', () => {
    const off = toggleCalendar(new URLSearchParams('view=month'), available, 'tournaments')
    expect(off.toString()).toBe('view=month&cal=tags%2Cboard')
    const on = toggleCalendar(off, available, 'tournaments')
    expect(on.toString()).toBe('view=month')
    const none = toggleCalendar(new URLSearchParams('cal=tags'), available, 'tags')
    expect(none.get('cal')).toBe('')
  })
})

describe('times', () => {
  it('shows a round as a time range in Denver', () => {
    expect(plain(eventTime(timed('2026-11-21T02:30:00Z', '2026-11-21T05:00:00Z')))).toBe(
      '7:30 – 10:00 PM',
    )
    expect(plain(eventTime(timed('2026-11-21T15:00:00Z', '2026-11-21T20:00:00Z')))).toBe(
      '8:00 AM – 1:00 PM',
    )
  })

  it('shows UTC-timed events in Denver time', () => {
    const glow = eventsResponse.events.find((event) => event.title === 'WW Glow @Owls')
    if (!glow) throw new Error('Missing fixture')
    expect(plain(eventTime(glow))).toBe('4:00 – 5:00 PM')
    expect(plain(startTime(glow) ?? '')).toBe('4:00 PM')
  })

  it('shows all-day and multi-day events', () => {
    expect(eventTime(allDay('2026-11-22', '2026-11-23'))).toBe('All day')
    expect(plain(eventTime(allDay('2027-06-25', '2027-06-28')))).toBe('Fri, Jun 25 – Sun, Jun 27')
    expect(startTime(allDay('2026-11-22', '2026-11-23'))).toBeNull()
  })

  it('shows dates for a timed event that runs past midnight', () => {
    expect(plain(eventTime(timed('2026-11-21T04:00:00Z', '2026-11-21T08:00:00Z')))).toBe(
      'Fri, Nov 20, 9:00 PM – Sat, Nov 21, 1:00 AM',
    )
  })

  it('heads each date, with the year only when it differs', () => {
    expect(dayHeading('2026-11-15', fixtureNow)).toEqual({
      label: 'Sunday, November 15',
      relative: 'Today',
    })
    expect(dayHeading('2026-11-16', fixtureNow).relative).toBe('Tomorrow')
    expect(dayHeading('2027-06-25', fixtureNow)).toEqual({
      label: 'Friday, June 25, 2027',
      relative: null,
    })
  })
})

describe('links', () => {
  const id =
    'c_73988d5a86f321570525d7c6a62f5136d39a3c78f54dfc99acd0823894a7c5b6@group.calendar.google.com'

  it('builds the Google add-calendar link with the base64 ID', () => {
    const url = new URL(googleCalendarUrl(id))
    expect(url.origin + url.pathname).toBe('https://calendar.google.com/calendar/u/0')
    expect(atob(url.searchParams.get('cid') ?? '')).toBe(id)
  })

  it('builds the webcal feed link', () => {
    expect(webcalUrl(id)).toBe(
      'webcal://calendar.google.com/calendar/ical/c_73988d5a86f321570525d7c6a62f5136d39a3c78f54dfc99acd0823894a7c5b6%40group.calendar.google.com/public/basic.ics',
    )
  })

  it('searches Google Maps for a location', () => {
    expect(mapsUrl('Centre Hills Park, Aurora, CO')).toBe(
      'https://www.google.com/maps/search/?api=1&query=Centre%20Hills%20Park%2C%20Aurora%2C%20CO',
    )
  })
})
