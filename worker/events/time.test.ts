import { expect, test } from 'vitest'

import { clubMidnight, eventWindow, zonedTimeToInstant } from './time'

test('the window runs from the 1st of the month in Denver to 12 months later', () => {
  const window = eventWindow(new Date('2026-11-15T12:00:00Z'))
  expect(new Date(window.start).toISOString()).toBe('2026-11-01T06:00:00.000Z') // MDT on Nov 1
  expect(new Date(window.end).toISOString()).toBe('2027-11-01T06:00:00.000Z')
})

test('the month is Denver’s, not UTC’s', () => {
  // 2026-12-01T03:00Z is still November 30 in Denver.
  const window = eventWindow(new Date('2026-12-01T03:00:00Z'))
  expect(new Date(window.start).toISOString()).toBe('2026-11-01T06:00:00.000Z')
  // A window starting in December wraps into the next year.
  const december = eventWindow(new Date('2026-12-15T12:00:00Z'))
  expect(new Date(december.start).toISOString()).toBe('2026-12-01T07:00:00.000Z')
  expect(new Date(december.end).toISOString()).toBe('2027-12-01T07:00:00.000Z')
})

test('converts wall-clock times on both sides of DST changes', () => {
  const at = (time: Parameters<typeof zonedTimeToInstant>[0]) =>
    new Date(zonedTimeToInstant(time, 'America/Denver')).toISOString()
  expect(at({ year: 2027, month: 3, day: 14, hour: 1 })).toBe('2027-03-14T08:00:00.000Z')
  expect(at({ year: 2027, month: 3, day: 14, hour: 3 })).toBe('2027-03-14T09:00:00.000Z')
  expect(at({ year: 2026, month: 11, day: 1, hour: 0 })).toBe('2026-11-01T06:00:00.000Z')
  expect(at({ year: 2026, month: 11, day: 1, hour: 3 })).toBe('2026-11-01T10:00:00.000Z')
  expect(clubMidnight('2027-06-25')).toBe(Date.parse('2027-06-25T06:00:00Z'))
})
