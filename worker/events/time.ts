// The club's time zone. Events are stored as instants and shown in this zone,
// and the window starts on the 1st of the current month here.
export const CLUB_TIME_ZONE = 'America/Denver'

// How many months past the current one the window covers.
const WINDOW_MONTHS = 12

const formatters = new Map<string, Intl.DateTimeFormat>()

function wallClock(instant: number, timeZone: string) {
  let formatter = formatters.get(timeZone)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    })
    formatters.set(timeZone, formatter)
  }
  const parts: Record<string, number> = {}
  for (const { type, value } of formatter.formatToParts(instant)) parts[type] = Number(value)
  return {
    year: parts.year,
    month: parts.month,
    day: parts.day,
    hour: parts.hour,
    minute: parts.minute,
    second: parts.second,
  }
}

export type WallTime = {
  year: number
  /** 1 to 12. */
  month: number
  day: number
  hour?: number
  minute?: number
  second?: number
}

/** The instant, in milliseconds, of a wall-clock time in an IANA time zone. */
export function zonedTimeToInstant(time: WallTime, timeZone: string): number {
  const asUtc = Date.UTC(
    time.year,
    time.month - 1,
    time.day,
    time.hour ?? 0,
    time.minute ?? 0,
    time.second ?? 0,
  )
  // The zone's offset at a guess, then again at the corrected instant, which
  // settles the answer on either side of a DST change.
  let instant = asUtc
  for (let i = 0; i < 2; i++) {
    const local = wallClock(instant, timeZone)
    const offset =
      Date.UTC(local.year, local.month - 1, local.day, local.hour, local.minute, local.second) -
      instant
    instant = asUtc - offset
  }
  return instant
}

/** Midnight in the club's time zone at the start of a `YYYY-MM-DD` date. */
export function clubMidnight(date: string): number {
  const [year, month, day] = date.split('-').map(Number)
  return zonedTimeToInstant({ year, month, day }, CLUB_TIME_ZONE)
}

export type EventWindow = { start: number; end: number }

/**
 * From midnight on the 1st of the current month in America/Denver, up to (not
 * including) the 1st of the month 12 months later.
 */
export function eventWindow(now: Date): EventWindow {
  const { year, month } = wallClock(now.getTime(), CLUB_TIME_ZONE)
  const endMonth = month - 1 + WINDOW_MONTHS
  return {
    start: zonedTimeToInstant({ year, month, day: 1 }, CLUB_TIME_ZONE),
    end: zonedTimeToInstant(
      { year: year + Math.floor(endMonth / 12), month: (endMonth % 12) + 1, day: 1 },
      CLUB_TIME_ZONE,
    ),
  }
}
