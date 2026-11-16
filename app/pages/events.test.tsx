import { composeStories } from '@storybook/react-vite'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { expect, test } from 'vitest'

import * as stories from './events.stories'

const {
  AllCalendars,
  Empty,
  FeedError,
  Filtered,
  List,
  Loading,
  Month,
  MonthOnPhone,
  NoneShown,
  Partial,
} = composeStories(stories)

const dateHeadings = () => screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)

test('shows the heading and the UDisc line word for word, without links', () => {
  render(<List />)
  expect(screen.getByRole('heading', { level: 1, name: 'Upcoming Events' })).toBeInTheDocument()
  const line = screen.getByText(
    'See UDisc and Disc Golf Scene for more information about specific leagues and tournaments.',
  )
  expect(within(line).queryByRole('link')).not.toBeInTheDocument()
})

test('lists events from today through 8 weeks, grouped by date in Denver', () => {
  render(<List />)
  const headings = dateHeadings()
  expect(headings[0]).toBe('Today, Sunday, November 15')
  expect(headings).toContain('Thursday, December 10')
  expect(headings.at(-2)).toBe('Saturday, January 9, 2027')
  // Thursday's board meeting at 6:30 PM in Denver is Friday in UTC.
  const meeting = screen.getByRole('heading', { level: 3, name: 'Board Meeting' })
  expect(meeting.closest('article')).toHaveTextContent(/6:30\s–\s7:30\sPM/)
  expect(screen.queryByText('High Plains Challenge')).not.toBeInTheDocument()
})

test('extends the list with Show more until the 12 months run out', () => {
  render(<List />)
  for (let click = 0; click < 6; click++)
    fireEvent.click(screen.getByRole('button', { name: 'Show more' }))
  expect(screen.getByRole('heading', { name: 'High Plains Challenge' })).toBeInTheDocument()
  expect(
    screen.getByText('Fri, Jun 25 – Sun, Jun 27', {
      normalizer: (text) => text.replace(/\s+/g, ' '),
    }),
  ).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Show more' })).not.toBeInTheDocument()
})

test('shows each event with its calendar, a map link, its description links and its Google Calendar page', () => {
  render(<List />)
  const round = screen.getAllByRole('heading', { level: 3, name: "Johnny Robert's Tags (Glow)" })[0]
  const item = round.closest('article')
  if (!item) throw new Error('Missing event')
  expect(within(item).getByText('Rotating Tags League')).toBeInTheDocument()
  expect(within(item).getByRole('link', { name: /Memorial Park/ })).toHaveAttribute(
    'href',
    expect.stringContaining('https://www.google.com/maps/search/?api=1&query=Memorial%20Park'),
  )
  const ww = screen.getByRole('heading', { name: 'Winter Warriors - Fehringer' }).closest('article')
  if (!ww) throw new Error('Missing event')
  // Tournaments have no location in the feeds.
  expect(within(ww).queryByRole('link', { name: /maps/ })).not.toBeInTheDocument()
  expect(
    within(ww).getByRole('link', { name: /Winter_Warriors_XXII_Week_3_Ferhinger_Ranch_2026/ }),
  ).toHaveAttribute('target', '_blank')
  expect(within(ww).getByRole('link', { name: /Open in Google Calendar/ })).toHaveAttribute(
    'href',
    expect.stringMatching(/^https:\/\/www\.google\.com\/calendar\/event\?eid=/),
  )
})

test('strikes through cancelled events with a badge, and collapses long descriptions', () => {
  render(<AllCalendars />)
  const cancelled = screen.getByText('Cancelled').closest('article')
  const struck = [...(cancelled?.querySelectorAll('s') ?? [])].map((s) => s.textContent)
  expect(struck).toEqual([expect.stringMatching(/^2:00\s–\s4:30\sPM$/), 'Village Greens Tags'])
  const details = screen.getByText('Details').closest('details')
  expect(details).not.toHaveAttribute('open')
  expect(details).toHaveTextContent('Example agenda')
})

test('has a chip for each calendar with events, all shown by default', () => {
  render(<List />)
  const chips = within(screen.getByRole('group', { name: 'Show calendars' })).getAllByRole('button')
  expect(chips.map((chip) => chip.textContent)).toEqual([
    'Rotating Tags League',
    'Tournament',
    'Board Meeting',
  ])
  for (const chip of chips) expect(chip).toHaveAttribute('aria-pressed', 'true')
})

test('hides a calendar when its chip is turned off, and shows it again', () => {
  render(<List />)
  const tags = screen.getByRole('button', { name: 'Rotating Tags League', pressed: true })
  fireEvent.click(tags)
  expect(screen.getByRole('button', { name: 'Rotating Tags League', pressed: false })).toBeVisible()
  expect(screen.queryByRole('heading', { name: 'Village Greens Tags' })).not.toBeInTheDocument()
  expect(screen.getAllByRole('heading', { name: /Winter Warriors/ }).length).toBeGreaterThan(0)
  fireEvent.click(screen.getByRole('button', { name: 'Rotating Tags League', pressed: false }))
  expect(screen.getAllByRole('heading', { name: 'Village Greens Tags' }).length).toBeGreaterThan(0)
})

test('reads the shown calendars from ?cal=', () => {
  render(<Filtered />)
  expect(screen.getByRole('button', { name: 'Tournament', pressed: true })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Board Meeting', pressed: false })).toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Board Meeting' })).not.toBeInTheDocument()
})

test('says when the chosen calendars have no upcoming events', () => {
  render(<NoneShown />)
  expect(screen.getByText('No upcoming events on the calendars you chose.')).toBeInTheDocument()
})

test('shows the month grid for ?view=month, from the current month', () => {
  render(<Month />)
  expect(screen.getByRole('button', { name: 'Month', pressed: true })).toBeInTheDocument()
  const grid = screen.getByRole('table', { name: 'November 2026' })
  expect(within(grid).getAllByRole('columnheader')).toHaveLength(7)
  expect(screen.getByRole('button', { name: 'Previous month' })).toBeDisabled()
  // Earlier days this month are muted.
  const meeting = within(grid).getByTitle(/Board Meeting/)
  expect(meeting.closest('td')).toHaveAttribute('data-past')
  fireEvent.click(screen.getByRole('button', { name: 'Next month' }))
  expect(screen.getByRole('table', { name: 'December 2026' })).toBeInTheDocument()
})

test('the grid is offered only from lg, and the list stands in below it', () => {
  render(<MonthOnPhone />)
  expect(screen.getByRole('group', { name: 'View' })).toHaveClass('hidden', 'lg:flex')
  expect(screen.getByRole('table').parentElement?.parentElement).toHaveClass('hidden', 'lg:block')
  expect(screen.getAllByRole('heading', { level: 2 })[0]?.closest('.lg\\:hidden')).not.toBeNull()
})

test('switches views, keeping the filter in the URL state', () => {
  render(<Filtered />)
  fireEvent.click(screen.getByRole('button', { name: 'Month', pressed: false }))
  expect(screen.getByRole('table', { name: 'November 2026' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Tournament', pressed: true })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Board Meeting', pressed: false })).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'List', pressed: false }))
  expect(screen.queryByRole('table')).not.toBeInTheDocument()
})

test('links each calendar with events to Google Calendar and webcal', () => {
  render(<List />)
  const subscribe = screen.getByRole('region', { name: 'Subscribe' })
  const google = within(subscribe).getAllByRole('link', { name: /Add to Google Calendar/ })
  expect(google).toHaveLength(3)
  const cid = new URL(google[0]?.getAttribute('href') ?? '').searchParams.get('cid')
  expect(atob(cid ?? '')).toBe(
    'c_73988d5a86f321570525d7c6a62f5136d39a3c78f54dfc99acd0823894a7c5b6@group.calendar.google.com',
  )
  expect(
    within(subscribe).getByRole('link', { name: /Apple Calendar or Outlook: Tournament/ }),
  ).toHaveAttribute(
    'href',
    expect.stringMatching(/^webcal:\/\/calendar\.google\.com\/.*basic\.ics$/),
  )
})

test('shows a spinner while loading, with every subscribe link', () => {
  render(<Loading />)
  expect(screen.getByText('Loading events…')).toBeInTheDocument()
  expect(screen.queryByRole('group', { name: 'Show calendars' })).not.toBeInTheDocument()
  expect(screen.getAllByRole('link', { name: /Add to Google Calendar/ })).toHaveLength(6)
})

test('says so when there are no events', () => {
  render(<Empty />)
  expect(screen.getByText('No upcoming events, check back soon.')).toBeInTheDocument()
})

test('points to Facebook when the events fail to load', () => {
  render(<FeedError />)
  const alert = screen.getByRole('alert')
  expect(alert).toHaveTextContent("Events couldn't load")
  expect(within(alert).getByRole('link', { name: /Facebook group/ })).toHaveAttribute(
    'href',
    'https://www.facebook.com/groups/mhdgc/',
  )
})

test('warns when some calendars may be out of date', () => {
  render(<Partial />)
  expect(screen.getByText('Some calendars may be out of date')).toBeInTheDocument()
  expect(screen.getAllByRole('heading', { level: 3 }).length).toBeGreaterThan(0)
})
