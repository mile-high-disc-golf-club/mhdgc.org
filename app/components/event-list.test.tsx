import { composeStories } from '@storybook/react-vite'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { expect, it } from 'vitest'

import * as stories from './event-list.stories'

const { Default, Examples, NoMore } = composeStories(stories)

it('heads each date and labels today', () => {
  render(<Default />)
  const dates = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)
  expect(dates[0]).toBe('Today, Sunday, November 15')
  expect(dates[1]).toBe('Friday, November 20')
})

it('calls onShowMore from Show more, and leaves it out at the end', () => {
  const onShowMore = Default.args.onShowMore
  render(<Default />)
  fireEvent.click(screen.getByRole('button', { name: 'Show more' }))
  expect(onShowMore).toHaveBeenCalledOnce()
  render(<NoMore />)
  expect(screen.getAllByRole('button', { name: 'Show more' })).toHaveLength(1)
})

it('shows all-day events as such, before timed ones', () => {
  render(<Examples />)
  const day = screen.getByRole('heading', { name: 'Sunday, November 22' }).parentElement
  const items = day?.querySelectorAll('article') ?? []
  expect(items[0]).toHaveTextContent('All dayExample Volunteer Day')
})

it('hides the location and links in a panel until its button opens it', () => {
  render(<Default />)
  const item = screen
    .getAllByRole('heading', { level: 3, name: "Johnny Robert's Tags (Glow)" })[0]
    .closest('article')
  if (!item) throw new Error('Missing event')
  const button = within(item).getByRole('button', {
    name: "More about Johnny Robert's Tags (Glow)",
    expanded: false,
  })
  const panel = document.getElementById(button.getAttribute('aria-controls') ?? '')
  expect(panel).toHaveAttribute('inert')
  expect(panel).toContainElement(within(item).getByRole('link', { name: /Memorial Park/ }))
  expect(panel).toContainElement(
    within(item).getByRole('link', { name: /Open in Google Calendar/ }),
  )
  fireEvent.click(button)
  expect(button).toHaveAttribute('aria-expanded', 'true')
  expect(panel).not.toHaveAttribute('inert')
  expect(panel).toHaveAttribute('data-open')
  fireEvent.click(button)
  expect(panel).toHaveAttribute('inert')
})

it('puts every description in the panel, including tournament links', () => {
  render(<Examples />)
  const tournament = screen
    .getByRole('heading', { name: 'Winter Warriors - Fehringer' })
    .closest('article')
  if (!tournament) throw new Error('Missing event')
  const link = within(tournament).getByRole('link', { name: /discgolfscene/ })
  expect(link.closest('[inert]')).not.toBeNull()
  fireEvent.click(within(tournament).getByRole('button', { expanded: false }))
  expect(link.closest('[inert]')).toBeNull()
  const agenda = screen.getByRole('link', { name: /the agenda/ })
  expect(agenda.closest('[inert]')).not.toBeNull()
})
