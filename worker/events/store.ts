import type { CalendarEvent, EventsResponse } from '../../shared/api'
import { type FeedEvent, fetchCalendarEvents } from './google'
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

/** What the refresh needs: the KV namespace and the Calendar API key. */
export type EventsEnv = { kv: KVNamespace; apiKey: string }

/**
 * Fetches every calendar's occurrences in the window from the Google Calendar
 * API in parallel and writes them to KV. A calendar whose fetch fails keeps its
 * previous entry. Nothing is written if no calendar has any data, so an empty
 * KV still triggers the inline refresh in `readEvents`.
 */
export async function refreshEvents(
  { kv, apiKey }: EventsEnv,
  calendars: readonly FeedCalendar[],
  now = new Date(),
): Promise<EventsSnapshot> {
  if (!apiKey) throw new Error('Events: GOOGLE_CALENDAR_API_KEY is not set. See the README.')
  const window = eventWindow(now)
  const previous = await kv.get<EventsSnapshot>(SNAPSHOT_KEY, 'json')
  const results = await Promise.allSettled(
    calendars.map(({ id }) => fetchCalendarEvents(id, apiKey, window)),
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
      `Events: fetching the ${slug} calendar failed${kept ? `, keeping its data from ${kept.updatedAt}` : ''}.`,
      result.reason,
    )
  })
  if (Object.keys(snapshot.calendars).length) await kv.put(SNAPSHOT_KEY, JSON.stringify(snapshot))
  return snapshot
}

/** The `/api/events` body. Reads KV, and refreshes inline once if it's empty. */
export async function readEvents(
  env: EventsEnv,
  calendars: readonly FeedCalendar[],
  now = new Date(),
): Promise<EventsResponse> {
  let snapshot = await env.kv.get<EventsSnapshot>(SNAPSHOT_KEY, 'json')
  if (snapshot?.version !== 1) snapshot = await refreshEvents(env, calendars, now)
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
