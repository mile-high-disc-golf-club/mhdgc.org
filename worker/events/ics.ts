import ICAL from 'ical.js'

import type { CalendarEvent } from '../../shared/api'
import { httpUrl, parseDescription } from './description'
import { CLUB_TIME_ZONE, clubMidnight, type EventWindow, zonedTimeToInstant } from './time'

/** An occurrence before it's tagged with its calendar's slug. */
export type FeedEvent = Omit<CalendarEvent, 'calendar'>

// Stops a runaway rule, such as FREQ=MINUTELY with no end, from using up the
// Worker's CPU time. A weekly series from years back is a few hundred.
const MAX_OCCURRENCES_PER_SERIES = 5000

type Occurrence = {
  item: ICAL.Event
  master: ICAL.Event
  recurrenceId: ICAL.Time
  start: ICAL.Time
  end: ICAL.Time | null
}

/**
 * Parses one ICS feed and returns every occurrence that overlaps the window:
 * recurring events are expanded (RRULE, RDATE, EXDATE), edited occurrences
 * (RECURRENCE-ID) replace the ones they edit, and cancelled ones are kept.
 * Throws if the text isn't an iCalendar feed.
 */
export function expandFeed(ics: string, window: EventWindow): FeedEvent[] {
  const root = ICAL.Component.fromString(ics)
  if (root.name !== 'vcalendar') throw new Error('Not an iCalendar feed')
  const calendarZone = validTimeZone(root.getFirstPropertyValue('x-wr-timezone')) ?? CLUB_TIME_ZONE

  // Google lists a recurring event's edited occurrences as separate VEVENTs
  // with the same UID and a RECURRENCE-ID.
  const series = new Map<string, { master?: ICAL.Component; exceptions: ICAL.Component[] }>()
  for (const component of root.getAllSubcomponents('vevent')) {
    const uid = text(component.getFirstPropertyValue('uid'))
    if (!uid) continue
    let entry = series.get(uid)
    if (!entry) series.set(uid, (entry = { exceptions: [] }))
    if (component.hasProperty('recurrence-id')) entry.exceptions.push(component)
    else entry.master ??= component
  }

  const events: FeedEvent[] = []
  const add = (occurrence: Occurrence) => {
    const event = toFeedEvent(occurrence, window, calendarZone)
    if (event) events.push(event)
  }
  for (const { master, exceptions } of series.values()) {
    if (!master) {
      // Edited occurrences without their series, such as a single instance
      // shared to this calendar: each stands alone.
      for (const component of exceptions) {
        const item = new ICAL.Event(component)
        add({ item, master: item, recurrenceId: item.recurrenceId, ...dates(item) })
      }
      continue
    }
    const event = new ICAL.Event(master, { exceptions, strictExceptions: false })
    if (!event.isRecurring()) {
      add({ item: event, master: event, recurrenceId: event.startDate, ...dates(event) })
      continue
    }
    const zone = eventZone(master, calendarZone)
    const iterator = event.iterator()
    for (let count = 0; count < MAX_OCCURRENCES_PER_SERIES; count++) {
      const next = iterator.next() as ICAL.Time | null
      if (!next || startInstant(next, zone) >= window.end) break
      const details = event.getOccurrenceDetails(next)
      add({
        item: details.item,
        master: event,
        recurrenceId: details.recurrenceId,
        start: details.startDate,
        end: details.endDate,
      })
    }
    // An occurrence edited to move from after the window into it.
    for (const item of Object.values(event.exceptions)) {
      if (startInstant(item.recurrenceId, zone) >= window.end)
        add({ item, master: event, recurrenceId: item.recurrenceId, ...dates(item) })
    }
  }
  return events
}

function dates(event: ICAL.Event) {
  return {
    start: event.startDate,
    end:
      event.component.hasProperty('dtend') || event.component.hasProperty('duration')
        ? event.endDate
        : null,
  }
}

function toFeedEvent(
  { item, master, recurrenceId, start, end }: Occurrence,
  window: EventWindow,
  calendarZone: string,
): FeedEvent | null {
  const zone = eventZone(item.component, calendarZone)
  let startValue: string
  let endValue: string
  let startMs: number
  let endMs: number
  if (start.isDate) {
    startValue = dateOf(start)
    // DTEND is exclusive. Without one, an all-day event lasts one day.
    const endDate = end ? dateOf(end) : ''
    endValue = endDate > startValue ? endDate : addDays(startValue, 1)
    startMs = clubMidnight(startValue)
    endMs = clubMidnight(endValue)
  } else {
    startMs = startInstant(start, zone)
    endMs = Math.max(startMs, end ? startInstant(end, zone) : startMs)
    startValue = new Date(startMs).toISOString()
    endValue = new Date(endMs).toISOString()
  }
  // Overlaps the window. A zero-length event counts at its start.
  if (Math.max(endMs, startMs + 1) <= window.start || startMs >= window.end) return null

  const uid = item.uid.replace(/@google\.com$/, '')
  const status = (component: ICAL.Component) =>
    text(component.getFirstPropertyValue('status')).toUpperCase()
  return {
    id: `${uid}_${idTime(recurrenceId, eventZone(master.component, calendarZone))}`,
    title: text(item.summary).trim() || text(master.summary).trim(),
    start: startValue,
    end: endValue,
    allDay: start.isDate,
    cancelled: status(item.component) === 'CANCELLED' || status(master.component) === 'CANCELLED',
    location: text(item.location).trim() || null,
    description: parseDescription(text(item.description)),
    url: httpUrl(text(item.component.getFirstPropertyValue('url'))),
  }
}

/**
 * Times with a TZID defined in the feed's VTIMEZONE, or in UTC (`Z`), convert
 * directly. Floating times, and a TZID the feed doesn't define, are read as
 * wall-clock time in that TZID if it's a known IANA zone, else in the
 * calendar's own zone.
 */
function startInstant(time: ICAL.Time, zone: string): number {
  if (time.zone.tzid !== 'floating') return time.toUnixTime() * 1000
  return zonedTimeToInstant(time, zone)
}

function eventZone(component: ICAL.Component, calendarZone: string) {
  const tzid = component.getFirstProperty('dtstart')?.getParameter('tzid')
  return validTimeZone(tzid) ?? calendarZone
}

// `20261121T150000Z` for a time, `20270625` for a date.
function idTime(time: ICAL.Time, zone: string) {
  if (time.isDate) return dateOf(time).replaceAll('-', '')
  return new Date(startInstant(time, zone)).toISOString().replace(/[-:]|\.\d+/g, '')
}

function dateOf(time: ICAL.Time) {
  return `${String(time.year)}-${pad(time.month)}-${pad(time.day)}`
}

function addDays(date: string, days: number) {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10)
}

function pad(value: number) {
  return String(value).padStart(2, '0')
}

function text(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function validTimeZone(value: unknown): string | null {
  if (typeof value !== 'string' || !value) return null
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: value })
    return value
  } catch {
    return null
  }
}
