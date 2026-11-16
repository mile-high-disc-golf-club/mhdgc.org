import { composeStories } from '@storybook/react-vite'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { expect, it } from 'vitest'

import * as stories from './event-month.stories'

const { AllCalendars, BusyDay, Default } = composeStories(stories)

it('opens on the current month, Sunday first', () => {
  render(<Default />)
  const grid = screen.getByRole('table', { name: 'November 2026' })
  expect(within(grid).getAllByRole('columnheader')[0]).toHaveTextContent('Sun')
  expect(within(grid).getByText('Today, Sunday, November 15')).toBeInTheDocument()
  expect(within(grid).getByText('Today, Sunday, November 15').closest('td')).toHaveAttribute(
    'data-today',
  )
})

it('mutes earlier days and colors the rest by calendar, naming the calendar', () => {
  render(<AllCalendars />)
  const past = screen.getByTitle(/Board Meeting/)
  expect(past).toHaveClass('bg-surface-hover')
  expect(past.closest('td')).toHaveAttribute('data-past')
  const clinic = screen.getByTitle(/Example Putting Clinic/)
  expect(clinic).toHaveClass('bg-event-clinics-soft')
  expect(within(clinic).getByRole('img', { name: 'Clinic' })).toBeInTheDocument()
  expect(
    screen.getByTitle(/Village Greens Tags \(Rotating Tags League, cancelled\)/),
  ).toBeInTheDocument()
})

it('pages through 12 months and stops', () => {
  render(<Default />)
  const next = screen.getByRole('button', { name: 'Next month' })
  for (let click = 0; click < 11; click++) fireEvent.click(next)
  expect(screen.getByRole('table', { name: 'October 2027' })).toBeInTheDocument()
  expect(next).toBeDisabled()
  expect(screen.getByRole('button', { name: 'Previous month' })).toBeEnabled()
})

it('shows a multi-day event on each of its days', () => {
  render(<Default />)
  const next = screen.getByRole('button', { name: 'Next month' })
  for (let click = 0; click < 7; click++) fireEvent.click(next)
  expect(screen.getByRole('table', { name: 'June 2027' })).toBeInTheDocument()
  expect(screen.getAllByTitle(/High Plains Challenge/)).toHaveLength(3)
})

it('collects a busy day behind "+N more", in a popover with every event', () => {
  render(<BusyDay />)
  const more = screen.getByRole('button', { name: '+2 more on Saturday, November 21' })
  const popover = document.getElementById(more.getAttribute('popovertarget') ?? '')
  expect(popover).toHaveAttribute('popover', 'auto')
  expect(popover).toHaveAttribute('role', 'dialog')
  // Closed until the button opens it.
  expect(within(popover as HTMLElement).getAllByRole('listitem', { hidden: true })).toHaveLength(4)
})
