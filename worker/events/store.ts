import type { CalendarEvent, EventsResponse } from '../../shared/api'
import { expandFeed, type FeedEvent } from './ics'
import { clubMidnight, eventWindow } from './time'

/** The fields of a `content/calendars.json` entry the Worker needs. */
export type FeedCalendar = { id: string; slug: string }

/**
 * What the cron refresh keeps in KV, under one key. Calendars are keyed by
 * their Google ID, so renaming a slug doesn't lose data, and a calendar whose
 * fetch fails keeps its last good events and `updatedAt`.
 */
export type EventsSnapshot = {
  version: 1
  /** When this snapshot was written. */
  refreshedAt: string
  calendars: Partial<Record<string, { updatedAt: string; events: FeedEvent[] }>>
}

export const SNAPSHOT_KEY = 'events:v1'
const FETCH_TIMEOUT_MS = 10_000

export function feedUrl(calendarId: string) {
  return `https://calendar.google.com/calendar/ical/${encodeURIComponent(calendarId)}/public/basic.ics`
}

/**
 * Fetches every feed in parallel, expands it over the window and writes the
 * result to KV. A feed that fails keeps that calendar's previous entry. Nothing
 * is written if no calendar has any data, so an empty KV still triggers the
 * inline refresh in `readEvents`.
 */
export async function refreshEvents(
  kv: KVNamespace,
  calendars: readonly FeedCalendar[],
  now = new Date(),
): Promise<EventsSnapshot> {
  const window = eventWindow(now)
  const previous = await kv.get<EventsSnapshot>(SNAPSHOT_KEY, 'json')
  const results = await Promise.allSettled(
    calendars.map(async ({ id }) => {
      const response = await fetch(feedUrl(id), {
        headers: { Accept: 'text/calendar' },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      })
      if (!response.ok) throw new Error(`HTTP ${String(response.status)}`)
      return expandFeed(await response.text(), window)
    }),
  )
  const snapshot: EventsSnapshot = {
    version: 1,
    refreshedAt: now.toISOString(),
    calendars: {},
  }
  results.forEach((result, index) => {
    const { id, slug } = calendars[index]
    if (result.status === 'fulfilled') {
      snapshot.calendars[id] = { updatedAt: now.toISOString(), events: result.value }
      return
    }
    const kept = previous?.version === 1 ? previous.calendars[id] : undefined
    if (kept) snapshot.calendars[id] = kept
    console.error(
      `Events: the ${slug} calendar's feed failed${kept ? `, keeping its data from ${kept.updatedAt}` : ''}.`,
      result.reason,
    )
  })
  if (Object.keys(snapshot.calendars).length) await kv.put(SNAPSHOT_KEY, JSON.stringify(snapshot))
  return snapshot
}

/** The `/api/events` body. Reads KV, and refreshes inline once if it's empty. */
export async function readEvents(
  kv: KVNamespace,
  calendars: readonly FeedCalendar[],
  now = new Date(),
): Promise<EventsResponse> {
  let snapshot = await kv.get<EventsSnapshot>(SNAPSHOT_KEY, 'json')
  if (snapshot?.version !== 1) snapshot = await refreshEvents(kv, calendars, now)
  return toResponse(snapshot, calendars, now)
}

export function toResponse(
  snapshot: EventsSnapshot,
  calendars: readonly FeedCalendar[],
  now: Date,
): EventsResponse {
  // A calendar kept through failed fetches may still hold last month's events.
  const windowStart = eventWindow(now).start
  const events: { sortKey: number; event: CalendarEvent }[] = []
  const updated: string[] = []
  let partial = false
  for (const { id, slug } of calendars) {
    const entry = snapshot.calendars[id]
    if (!entry) {
      partial = true
      continue
    }
    updated.push(entry.updatedAt)
    for (const { id: eventId, ...event } of entry.events) {
      const start = event.allDay ? clubMidnight(event.start) : Date.parse(event.start)
      const end = event.allDay ? clubMidnight(event.end) : Date.parse(event.end)
      if (Math.max(end, start + 1) > windowStart)
        events.push({ sortKey: start, event: { id: eventId, calendar: slug, ...event } })
    }
  }
  events.sort((a, b) => a.sortKey - b.sortKey || a.event.title.localeCompare(b.event.title))
  return {
    events: events.map(({ event }) => event),
    updatedAt: updated.length ? updated.sort()[0] : null,
    partial,
  }
}
