import { composeStories } from '@storybook/react-vite'
import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'

import { buttonClasses } from './button'
import * as stories from './button.stories'

const { Disabled, Primary, Secondary, WithIcon } = composeStories(stories)

it('is a plain button with a 44px tap target, not a submit', () => {
  render(<Primary />)
  const button = screen.getByRole('button', { name: 'Show more events' })
  expect(button).toHaveAttribute('type', 'button')
  expect(button).toHaveClass('min-h-11', 'bg-primary', 'text-on-primary')
})

it('takes a variant', () => {
  render(<Secondary />)
  expect(screen.getByRole('button')).toHaveClass('border-line-strong')
})

it('sets the label in the button type, with the icon beside it', () => {
  render(<WithIcon />)
  const label = screen.getByText('Add to calendar')
  expect(label).toHaveClass('font-semibold')
  expect(label.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
})

it('disables a button', () => {
  render(<Disabled />)
  expect(screen.getByRole('button')).toBeDisabled()
})

it('gives a link the button look', () => {
  expect(buttonClasses()).toContain('bg-primary')
  expect(buttonClasses()).toContain('min-h-11')
  expect(buttonClasses({ variant: 'secondary' })).toContain('border-line-strong')
})
