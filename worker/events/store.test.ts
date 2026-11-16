import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import empty from './fixtures/empty.ics?raw'
import tournament from './fixtures/tournament.ics?raw'
import {
  type EventsSnapshot,
  type FeedCalendar,
  feedUrl,
  readEvents,
  refreshEvents,
  SNAPSHOT_KEY,
} from './store'

const calendars: FeedCalendar[] = [
  { id: 'tournament@group.calendar.google.com', slug: 'tournaments' },
  { id: 'empty@group.calendar.google.com', slug: 'clinics' },
]
const now = new Date('2026-11-15T12:00:00Z')
const later = new Date('2026-11-15T12:15:00Z')

// The parts of KVNamespace the store uses, backed by a Map.
function memoryKv() {
  const store = new Map<string, string>()
  const kv = {
    get: vi.fn((key: string) => {
      const value = store.get(key)
      return Promise.resolve(value === undefined ? null : JSON.parse(value))
    }),
    put: vi.fn((key: string, value: string) => {
      store.set(key, value)
      return Promise.resolve()
    }),
  }
  return { kv: kv as unknown as KVNamespace, store, put: kv.put }
}

let feeds: Partial<Record<string, string | number>>
beforeEach(() => {
  feeds = {
    [feedUrl(calendars[0].id)]: tournament,
    [feedUrl(calendars[1].id)]: empty,
  }
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string) => {
      const feed = feeds[url]
      if (feed === undefined) return Promise.reject(new TypeError('Network error'))
      return Promise.resolve(
        typeof feed === 'number' ? new Response('Error', { status: feed }) : new Response(feed),
      )
    }),
  )
  vi.spyOn(console, 'error').mockImplementation(() => undefined)
})
afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

test('builds the feed URL from the calendar ID', () => {
  expect(feedUrl('c_abc@group.calendar.google.com')).toBe(
    'https://calendar.google.com/calendar/ical/c_abc%40group.calendar.google.com/public/basic.ics',
  )
})

test('refreshes into KV, then serves sorted events tagged with their calendar', async () => {
  const { kv, store } = memoryKv()
  const snapshot = await refreshEvents(kv, calendars, now)
  expect(Object.keys(snapshot.calendars)).toEqual(calendars.map(({ id }) => id))
  expect(store.has(SNAPSHOT_KEY)).toBe(true)

  const body = await readEvents(kv, calendars, now)
  expect(body.partial).toBe(false)
  expect(body.updatedAt).toBe(now.toISOString())
  expect(body.events).toHaveLength(16)
  expect(Object.keys(body.events[0])).toEqual([
    'id',
    'calendar',
    'title',
    'start',
    'end',
    'allDay',
    'cancelled',
    'location',
    'description',
    'url',
  ])
  expect(body.events.every((event) => event.calendar === 'tournaments')).toBe(true)
  const starts = body.events.map((event) => event.start)
  expect(starts[0]).toBe('2026-11-07T15:00:00.000Z')
  expect(starts.at(-1)).toBe('2027-06-25')
  expect(JSON.stringify(body)).not.toMatch(/<a |<br/)
})

test('an empty KV refreshes inline once', async () => {
  const { kv, put } = memoryKv()
  expect((await readEvents(kv, calendars, now)).events).toHaveLength(16)
  expect(put).toHaveBeenCalledTimes(1)
  await readEvents(kv, calendars, now)
  expect(put).toHaveBeenCalledTimes(1)
  expect(fetch).toHaveBeenCalledTimes(2)
})

test('a failed feed keeps its calendar’s last good events', async () => {
  const { kv } = memoryKv()
  await refreshEvents(kv, calendars, now)
  feeds[feedUrl(calendars[0].id)] = 503
  const snapshot = await refreshEvents(kv, calendars, later)
  expect(snapshot.calendars[calendars[0].id]?.updatedAt).toBe(now.toISOString())
  expect(snapshot.calendars[calendars[1].id]?.updatedAt).toBe(later.toISOString())
  expect(console.error).toHaveBeenCalledOnce()

  const body = await readEvents(kv, calendars, later)
  expect(body.events).toHaveLength(16)
  expect(body.partial).toBe(false)
  // The oldest calendar's update.
  expect(body.updatedAt).toBe(now.toISOString())
})

test('a calendar with no data at all makes the response partial', async () => {
  const { kv } = memoryKv()
  feeds = { [feedUrl(calendars[1].id)]: empty }
  const body = await readEvents(kv, calendars, now)
  expect(body).toEqual({ events: [], updatedAt: now.toISOString(), partial: true })
})

test('a feed that is not iCalendar counts as failed', async () => {
  const { kv } = memoryKv()
  feeds[feedUrl(calendars[1].id)] = '<!doctype html><title>Sign in</title>'
  const snapshot = await refreshEvents(kv, calendars, now)
  expect(snapshot.calendars[calendars[1].id]).toBeUndefined()
})

test('nothing is written when every feed fails, so the next request tries again', async () => {
  const { kv, put } = memoryKv()
  feeds = {}
  expect(await readEvents(kv, calendars, now)).toEqual({
    events: [],
    updatedAt: null,
    partial: true,
  })
  expect(put).not.toHaveBeenCalled()
})

test('drops events from before the current month and calendars no longer configured', async () => {
  const { kv, store } = memoryKv()
  await refreshEvents(kv, calendars, now)
  const snapshot = JSON.parse(store.get(SNAPSHOT_KEY) ?? '') as EventsSnapshot
  snapshot.calendars['removed@group.calendar.google.com'] = {
    updatedAt: '2026-01-01T00:00:00.000Z',
    events: [],
  }
  store.set(SNAPSHOT_KEY, JSON.stringify(snapshot))
  // In January, November's and December's Winter Warriors are past.
  const body = await readEvents(kv, calendars, new Date('2027-01-10T12:00:00Z'))
  expect(body.events[0].start).toBe('2027-01-02T15:00:00.000Z')
  expect(body.updatedAt).toBe(now.toISOString())
})
