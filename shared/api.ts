// Types shared by the React app and the Worker.

export type HealthResponse = {
  ok: true
  env: string
  time: string
}

/**
 * `GET /api/events`: every occurrence from the club's calendars, from the 1st of
 * the current month in America/Denver to 12 months ahead, sorted by start.
 * A cron Worker refreshes it from the Google Calendar API every 15 minutes,
 * so it can be up to about 15 minutes behind Google Calendar.
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
   * Google Calendar's event ID, stable across refreshes. For an occurrence of a
   * recurring event it's the series' ID, an underscore and the occurrence's
   * original start, such as `6ot93pmu0j64t4c56g11ifeate_20261121T150000Z` (or
   * `…_20270625` for all-day events), so rescheduling one occurrence keeps its
   * ID. The same Google event on two calendars shares an ID, so key lists by
   * `calendar` and `id` together.
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
   * Like `start`. For all-day events the date is exclusive, as in Google
   * Calendar: a one-day event on 2027-06-25 ends `2027-06-26`.
   */
  end: string
  allDay: boolean
  /**
   * Cancelled but still listed. Google Calendar has no cancel action, only
   * delete, and deleted events and occurrences are left out, so this is
   * rarely `true`.
   */
  cancelled: boolean
  /** A course name and/or address, as typed in Google Calendar. `null` when empty. */
  location: string | null
  /** Plain text and links, never HTML. An empty list when there's no description. */
  description: DescriptionParagraph[]
  /** The event's page on Google Calendar, where visitors can add it to their own calendar. */
  url: string | null
}

/** One line of a description: text and links, in order. Never empty. */
export type DescriptionParagraph = DescriptionSegment[]

export type DescriptionSegment = string | DescriptionLink

/** An `http(s)` link. `text` is what the description showed, or the URL itself. */
export type DescriptionLink = { href: string; text: string }
