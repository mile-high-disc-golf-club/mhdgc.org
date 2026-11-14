import { composeStories } from '@storybook/react-vite'
import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'

import * as stories from './loading-region.stories'

const { Default, Busy, FirstLoad } = composeStories(stories)

const content = () => screen.getByText('Thursday doubles').parentElement

it('leaves idle content available', () => {
  render(<Default />)
  expect(content()).toHaveAttribute('aria-busy', 'false')
  expect(content()).not.toHaveAttribute('inert')
  expect(screen.queryByText('Loading events…')).not.toBeInTheDocument()
})

it('dims and blocks busy content, with a spinner announced outside it', () => {
  render(<Busy />)
  expect(content()).toHaveAttribute('aria-busy', 'true')
  expect(content()).toHaveAttribute('inert')
  expect(content()).toHaveAttribute('data-busy')
  const status = screen.getByText('Loading events…')
  expect(content()).not.toContainElement(status)
  expect(status.closest('[aria-live]')).toHaveAttribute('aria-live', 'polite')
})

it('keeps the live region mounted, and gives an empty first load room for the spinner', () => {
  const { container } = render(<FirstLoad />)
  const region = container.firstElementChild
  expect(region).toHaveClass('data-busy:min-h-40')
  expect(region).toHaveAttribute('data-busy')
  expect(container.querySelector('[aria-live="polite"]')).toHaveTextContent('Loading events…')
})
