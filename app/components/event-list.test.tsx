import { composeStories } from '@storybook/react-vite'
import { fireEvent, render, screen } from '@testing-library/react'
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

it('opens a long description from its summary', () => {
  render(<Examples />)
  const details = screen.getByText('Details').closest('details')
  expect(details?.querySelector('summary')).toHaveClass('min-h-11')
  expect(screen.getByRole('link', { name: /the agenda/ })).toHaveAttribute(
    'href',
    'https://example.com/agenda',
  )
})
