import { composeStories } from '@storybook/react-vite'
import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'

import * as stories from './button-link.stories'

const { Primary, Secondary, WithIcon } = composeStories(stories)

it('looks like a primary button with a 44px tap target', () => {
  render(<Primary />)
  const link = screen.getByRole('link', { name: 'Join the club' })
  expect(link).toHaveAttribute('href', '/membership')
  expect(link).toHaveClass('min-h-11', 'bg-primary')
})

it('takes a variant', () => {
  render(<Secondary />)
  expect(screen.getByRole('link')).toHaveClass('border-line-strong')
})

it('sets the label in the button type, with the icon inside it', () => {
  render(<WithIcon />)
  const label = screen.getByText('See every event')
  expect(label).toHaveClass('font-semibold')
  expect(label.querySelector('svg')).not.toBeNull()
})
