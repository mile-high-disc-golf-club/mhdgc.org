// Types shared by the React app and the Worker.

export type HealthResponse = {
  ok: true
  env: string
  time: string
}

/**
 * `GET /api/events`: every occurrence from the club's calendars, from the 1st of
 * the current month in America/Denver to 12 months ahead, sorted by start.
 * A cron Worker refreshes it from the public Google Calendar feeds every 15
 * minutes, so it can be up to about 15 minutes behind Google Calendar.
 */
export type EventsResponse = {
  events: CalendarEvent[]
  /**
   * ISO instant of the oldest calendar's last successful fetch, so every event
   * is at least this fresh. `null` when no calendar has any data yet.
   */
  updatedAt: string | null
  /**
   * `true` when at least one calendar in `content/calendars.json` has never been
   * fetched successfully, so its events are missing. A calendar whose latest
   * fetch failed keeps its last good events and doesn't set this.
   */
  partial: boolean
}

/** One occurrence. Each occurrence of a recurring event is its own entry. */
export type CalendarEvent = {
  /**
   * Stable across refreshes: the ICS `UID` (without Google's `@google.com`), an
   * underscore, and the occurrence's original start (its `RECURRENCE-ID`), as
   * `20261121T150000Z` or, for all-day events, `20270625`. Rescheduling one
   * occurrence keeps its ID. The same Google event on two calendars shares an
   * ID, so key lists by `calendar` and `id` together.
   */
  id: string
  /** The calendar's `slug` from `content/calendars.json`. */
  calendar: string
  /** The event's title. Empty when it has none. */
  title: string
  /**
   * Timed events: an ISO instant in UTC, such as `2026-11-21T15:00:00.000Z`.
   * Show it in America/Denver.
   * All-day events: a calendar date, such as `2027-06-25`.
   */
  start: string
  /**
   * Like `start`. For all-day events the date is exclusive, as in ICS: a
   * one-day event on 2027-06-25 ends `2027-06-26`.
   */
  end: string
  allDay: boolean
  /** Cancelled in Google Calendar but still listed. Deleted occurrences are left out. */
  cancelled: boolean
  /** A course name and/or address, as typed in Google Calendar. `null` when empty. */
  location: string | null
  /** Plain text and links, never HTML. An empty list when there's no description. */
  description: DescriptionParagraph[]
  /** The event's ICS `URL` property, if it's an `http(s)` link. Google's feeds rarely set it. */
  url: string | null
}

/** One line of a description: text and links, in order. Never empty. */
export type DescriptionParagraph = DescriptionSegment[]

export type DescriptionSegment = string | DescriptionLink

/** An `http(s)` link. `text` is what the description showed, or the URL itself. */
export type DescriptionLink = { href: string; text: string }
