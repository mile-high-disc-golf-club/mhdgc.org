// What the Events page does with `/api/events`: which Denver day each event
// falls on, the list's window, the month grid's weeks, the `?cal=` and `?view=`
// parameters, and how times read. Days are `YYYY-MM-DD` strings throughout, so
// they compare and sort as text.
import type { CalendarEvent, DescriptionParagraph } from '~/../shared/api'
import type { CalendarConfig } from '~/content'
import type { EventColor, IconName } from '~/design-system'

// A calendar from content/calendars.json. The build checks its icon and color
// against the design system, so the app can rely on them.
export type Calendar = Omit<CalendarConfig, 'icon' | 'color'> & {
  icon: IconName
  color: EventColor
}

// The club's time zone. Every date and time on the page is shown in it.
export const timeZone = 'America/Denver'

// The list starts with this many weeks, and Show more adds as many again.
export const listWeeks = 8

// The month grid pages through this many months, starting with the current one,
// matching the window `/api/events` returns.
export const gridMonths = 12

const dayFormat = new Intl.DateTimeFormat('en-CA', {
  timeZone,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

// The Denver day an instant falls on.
export function denverDay(instant: Date): string {
  return dayFormat.format(instant)
}

function utcDate(day: string) {
  return new Date(`${day}T00:00:00Z`)
}

export function addDays(day: string, days: number): string {
  const date = utcDate(day)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

// The first and last Denver day an event covers. A timed event that ends at
// midnight doesn't reach into the next day.
export function eventDays(event: CalendarEvent): { first: string; last: string } {
  if (event.allDay) {
    const last = addDays(event.end, -1)
    return { first: event.start, last: last < event.start ? event.start : last }
  }
  const first = denverDay(new Date(event.start))
  const last = denverDay(new Date(Math.max(Date.parse(event.end) - 1, Date.parse(event.start))))
  return { first, last }
}

export function hasEnded(event: CalendarEvent, now: Date): boolean {
  if (event.allDay) return eventDays(event).last < denverDay(now)
  return Date.parse(event.end) <= now.getTime()
}

// All-day events first on their day, then by start time.
function compareEvents(a: CalendarEvent, b: CalendarEvent) {
  const [dayA, dayB] = [eventDays(a).first, eventDays(b).first]
  if (dayA !== dayB) return dayA < dayB ? -1 : 1
  if (a.allDay !== b.allDay) return a.allDay ? -1 : 1
  return Date.parse(a.start) - Date.parse(b.start) || a.title.localeCompare(b.title)
}

export interface DayGroup {
  day: string
  events: CalendarEvent[]
}

/**
 * Events that haven't ended, grouped by Denver day, from today through `weeks` weeks.
 * An event that started before today, such as a multi-day tournament, is listed
 * under today. `more` says whether any events come after the window.
 */
export function upcomingEvents(
  events: CalendarEvent[],
  { now, weeks }: { now: Date; weeks: number },
): { groups: DayGroup[]; more: boolean } {
  const today = denverDay(now)
  const end = addDays(today, weeks * 7)
  const groups: DayGroup[] = []
  let more = false
  for (const event of events.filter((item) => !hasEnded(item, now)).sort(compareEvents)) {
    const first = eventDays(event).first
    const day = first < today ? today : first
    if (day >= end) {
      more = true
      continue
    }
    const last = groups.at(-1)
    if (last?.day === day) last.events.push(event)
    else groups.push({ day, events: [event] })
  }
  return { groups, more }
}

// `YYYY-MM` for the months the grid shows, starting with the current one.
export function gridMonthList(now: Date, count = gridMonths): string[] {
  const [year = 0, month = 1] = denverDay(now).split('-').map(Number)
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(Date.UTC(year, month - 1 + index, 1))
    return date.toISOString().slice(0, 7)
  })
}

// A month's days in weeks from Sunday to Saturday, with `null` for the days
// before the 1st and after the last.
export function monthWeeks(month: string): (string | null)[][] {
  const first = `${month}-01`
  const cells: (string | null)[] = Array.from({ length: utcDate(first).getUTCDay() }, () => null)
  for (let day = first; day.startsWith(month); day = addDays(day, 1)) cells.push(day)
  while (cells.length % 7) cells.push(null)
  return Array.from({ length: cells.length / 7 }, (_, week) => cells.slice(week * 7, week * 7 + 7))
}

// Each day of the month that has events, with every event that covers it.
export function monthEvents(events: CalendarEvent[], month: string): Map<string, CalendarEvent[]> {
  const days = new Map<string, CalendarEvent[]>()
  for (const event of [...events].sort(compareEvents)) {
    const { first, last } = eventDays(event)
    for (let day = first; day <= last; day = addDays(day, 1)) {
      if (!day.startsWith(month)) continue
      const list = days.get(day)
      if (list) list.push(event)
      else days.set(day, [event])
    }
  }
  return days
}

export type EventsView = 'list' | 'month'

// `?view=month` asks for the month grid. Anything else is the list.
export function parseView(params: URLSearchParams): EventsView {
  return params.get('view') === 'month' ? 'month' : 'list'
}

/**
 * The calendars shown, from `?cal=tags,tournaments`. Without the parameter every
 * calendar is shown. Slugs that aren't in `available` are ignored, and an empty
 * `?cal=` shows none.
 */
export function parseCalendars(params: URLSearchParams, available: string[]): string[] {
  const value = params.get('cal')
  if (value === null) return available
  const asked = new Set(value.split(','))
  return available.filter((slug) => asked.has(slug))
}

// The `?cal=` value for a selection, or null when every calendar is shown.
export function calendarsParam(shown: string[], available: string[]): string | null {
  const set = new Set(shown)
  return available.every((slug) => set.has(slug))
    ? null
    : available.filter((slug) => set.has(slug)).join(',')
}

// Turns one calendar on or off, keeping the other parameters.
export function toggleCalendar(
  params: URLSearchParams,
  available: string[],
  slug: string,
): URLSearchParams {
  const shown = parseCalendars(params, available)
  const next = shown.includes(slug) ? shown.filter((item) => item !== slug) : [...shown, slug]
  const result = new URLSearchParams(params)
  const value = calendarsParam(next, available)
  if (value === null) result.delete('cal')
  else result.set('cal', value)
  return result
}

const headingFormat = new Intl.DateTimeFormat('en-US', {
  timeZone: 'UTC',
  weekday: 'long',
  month: 'long',
  day: 'numeric',
})
const headingWithYearFormat = new Intl.DateTimeFormat('en-US', {
  timeZone: 'UTC',
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
})

// A date group's heading, such as "Saturday, November 21", with the year when
// it isn't this year's. `relative` is "Today" or "Tomorrow" when it is one.
export function dayHeading(day: string, now: Date): { label: string; relative: string | null } {
  const today = denverDay(now)
  const format = day.slice(0, 4) === today.slice(0, 4) ? headingFormat : headingWithYearFormat
  const relative = day === today ? 'Today' : day === addDays(today, 1) ? 'Tomorrow' : null
  return { label: format.format(utcDate(day)), relative }
}

const timeFormat = new Intl.DateTimeFormat('en-US', {
  timeZone,
  hour: 'numeric',
  minute: '2-digit',
})
const dateTimeFormat = new Intl.DateTimeFormat('en-US', {
  timeZone,
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})
const dateRangeFormat = new Intl.DateTimeFormat('en-US', {
  timeZone: 'UTC',
  weekday: 'short',
  month: 'short',
  day: 'numeric',
})

/**
 * When an event happens, in Denver time: "7:30 – 10:00 PM", "All day", a date range
 * such as "Fri, Jun 25 – Sun, Jun 27" for a multi-day event, or dates and times for a
 * timed event that runs past midnight.
 */
export function eventTime(event: CalendarEvent): string {
  const { first, last } = eventDays(event)
  if (event.allDay)
    return first === last ? 'All day' : dateRangeFormat.formatRange(utcDate(first), utcDate(last))
  const [start, end] = [new Date(event.start), new Date(event.end)]
  if (end <= start) return timeFormat.format(start)
  return (first === last ? timeFormat : dateTimeFormat).formatRange(start, end)
}

// The start time alone, for the month grid, or null for an all-day event.
export function startTime(event: CalendarEvent): string | null {
  return event.allDay ? null : timeFormat.format(new Date(event.start))
}

const monthFormat = new Intl.DateTimeFormat('en-US', {
  timeZone: 'UTC',
  month: 'long',
  year: 'numeric',
})

// "November 2026" for `2026-11`.
export function monthLabel(month: string): string {
  return monthFormat.format(utcDate(`${month}-01`))
}

// A description is long when it has more than two paragraphs, or more than
// about three lines of text on a phone. Long ones start collapsed.
export function isLongDescription(description: DescriptionParagraph[]): boolean {
  const length = description
    .flat()
    .reduce(
      (total, segment) => total + (typeof segment === 'string' ? segment : segment.text).length,
      0,
    )
  return description.length > 2 || length > 280
}

// Google Maps search for an event's location.
export function mapsUrl(location: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`
}

// Google Calendar's add-calendar link. Google's shareable links carry the
// calendar ID base64 encoded, without padding, in `cid`.
export function googleCalendarUrl(calendarId: string): string {
  const cid = btoa(calendarId).replace(/=+$/, '')
  return `https://calendar.google.com/calendar/u/0?cid=${encodeURIComponent(cid)}`
}

// The public ICS feed as a `webcal://` link, which Apple Calendar and Outlook
// open as a subscription.
export function webcalUrl(calendarId: string): string {
  return `webcal://calendar.google.com/calendar/ical/${encodeURIComponent(calendarId)}/public/basic.ics`
}
