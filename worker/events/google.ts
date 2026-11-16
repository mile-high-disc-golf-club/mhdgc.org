import type { CalendarEvent, DescriptionParagraph } from '../../shared/api'
import { httpUrl, parseDescription } from './description'
import type { EventWindow } from './time'

/** An occurrence before it's tagged with its calendar's slug. */
export type FeedEvent = Omit<CalendarEvent, 'calendar'>

// Google's limit per page. A year of the club's events fits in one page, so
// more pages are rare, and the cap stops a runaway loop.
const PAGE_SIZE = 2500
const MAX_PAGES = 10
const FETCH_TIMEOUT_MS = 10_000
// Only what the Worker uses. Leaving out creator and organizer also keeps
// board members' email addresses out of KV.
const FIELDS = 'nextPageToken,items(id,status,htmlLink,summary,description,location,start,end)'

// The parts of the Calendar API's Event resource that FIELDS asks for.
// https://developers.google.com/workspace/calendar/api/v3/reference/events
type ApiTime = { date?: string; dateTime?: string }
export type ApiEvent = {
  id?: string
  status?: string
  htmlLink?: string
  summary?: string
  description?: string
  location?: string
  start?: ApiTime
  end?: ApiTime
}
type ApiEvents = { items?: ApiEvent[]; nextPageToken?: string }
type ApiError = { error?: { message?: string } }

export function eventsUrl(calendarId: string, apiKey: string, window: EventWindow, page?: string) {
  const params = new URLSearchParams({
    key: apiKey,
    // Google expands recurring events into one item per occurrence, with
    // edits applied and deleted occurrences left out.
    singleEvents: 'true',
    // Events that end after timeMin and start before timeMax.
    timeMin: new Date(window.start).toISOString(),
    timeMax: new Date(window.end).toISOString(),
    maxResults: String(PAGE_SIZE),
    fields: FIELDS,
  })
  if (page) params.set('pageToken', page)
  return `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params.toString()}`
}

/**
 * Every occurrence on one public calendar that overlaps the window, from the
 * Google Calendar API. Throws if the API answers with an error, such as an
 * invalid key or a calendar that isn't public. The message never includes
 * the key.
 */
export async function fetchCalendarEvents(
  calendarId: string,
  apiKey: string,
  window: EventWindow,
): Promise<FeedEvent[]> {
  const events: FeedEvent[] = []
  // Every occurrence of a series usually shares one description.
  const descriptions = new Map<string, DescriptionParagraph[]>()
  let page: string | undefined
  for (let count = 0; count < MAX_PAGES; count++) {
    const response = await fetch(eventsUrl(calendarId, apiKey, window, page), {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    })
    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as ApiError
      throw new Error(
        `Calendar API HTTP ${String(response.status)}: ${body.error?.message ?? response.statusText}`,
      )
    }
    const body = await response.json<ApiEvents>()
    for (const item of body.items ?? []) {
      const event = toFeedEvent(item, descriptions)
      if (event) events.push(event)
    }
    page = body.nextPageToken
    if (!page) return events
  }
  console.warn(`Events: stopped after ${String(MAX_PAGES)} pages of ${calendarId}.`)
  return events
}

/** One API item as an occurrence. `null` if it has no ID or start. */
export function toFeedEvent(
  item: ApiEvent,
  descriptions = new Map<string, DescriptionParagraph[]>(),
): FeedEvent | null {
  const start = time(item.start)
  if (!item.id || !start) return null
  let end = time(item.end)
  if (!end || end.allDay !== start.allDay || end.value < start.value)
    end = start.allDay ? { allDay: true, value: addDays(start.value, 1) } : start
  const raw = item.description ?? ''
  let description = descriptions.get(raw)
  if (!description) descriptions.set(raw, (description = parseDescription(raw)))
  return {
    // Google's instance IDs, such as `6ot93pmu0j64t4c56g11ifeate_20261121T150000Z`
    // for an occurrence of a recurring event, are stable across refreshes.
    id: item.id,
    title: item.summary?.trim() ?? '',
    start: start.value,
    end: end.value,
    allDay: start.allDay,
    cancelled: item.status === 'cancelled',
    location: item.location?.trim() || null,
    description,
    url: item.htmlLink ? httpUrl(item.htmlLink) : null,
  }
}

// `dateTime` carries its UTC offset, such as `2026-11-28T16:00:00-07:00`, and
// becomes a UTC instant. `date` is an all-day event's calendar date.
function time(value: ApiTime | undefined): { allDay: boolean; value: string } | null {
  if (value?.date && /^\d{4}-\d{2}-\d{2}$/.test(value.date))
    return { allDay: true, value: value.date }
  if (value?.dateTime) {
    const instant = Date.parse(value.dateTime)
    if (!Number.isNaN(instant)) return { allDay: false, value: new Date(instant).toISOString() }
  }
  return null
}

function addDays(date: string, days: number) {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10)
}
