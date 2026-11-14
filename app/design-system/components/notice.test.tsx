import { composeStories } from '@storybook/react-vite'
import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'

import * as stories from './notice.stories'

const { Info, LoadError, Warning } = composeStories(stories)

it('has no role unless one is passed', () => {
  render(<Info />)
  expect(screen.queryByRole('alert')).toBeNull()
  expect(screen.queryByRole('status')).toBeNull()
})

it('tints the notice and colors its title by tone', () => {
  render(<Warning />)
  const title = screen.getByText('Course closed')
  expect(title).toHaveClass('text-warning-ink', 'font-semibold')
  expect(title.parentElement).toHaveClass('bg-warning-soft', 'border-warning', 'text-ink')
})

it('announces an error as an alert', () => {
  render(<LoadError />)
  expect(screen.getByRole('alert')).toHaveTextContent("Events couldn't load")
})
