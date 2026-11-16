import { composeStories } from '@storybook/react-vite'
import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'

import * as stories from './calendar-label.stories'

const { AllCalendars, Default } = composeStories(stories)

it('names the calendar in its color, with a decorative icon', () => {
  render(<Default />)
  const label = screen.getByText('Rotating Tags League').parentElement
  expect(label).toHaveClass('text-event-tags-ink')
  expect(label?.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
})

it('has a label for every calendar', () => {
  render(<AllCalendars />)
  for (const name of [
    'Rotating Tags League',
    'Rotating Ladies Tags League',
    'Tournament',
    'Board Meeting',
    'Clinic',
    'Volunteer Day',
  ])
    expect(screen.getAllByText(name)).toHaveLength(2)
})
