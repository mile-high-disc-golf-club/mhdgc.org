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
  // A screen's height, so what follows doesn't shift when the content arrives.
  expect(region?.firstElementChild).toBeEmptyDOMElement()
  expect(region?.firstElementChild).toHaveClass('data-busy:empty:min-h-dvh')
  const status = container.querySelector('[aria-live="polite"]')
  expect(status).toHaveTextContent('Loading events…')
  expect(status).toHaveClass('data-busy:inset-0')
  expect(status).toHaveAttribute('data-busy')
})

it('shrinks the idle status region so it doesn’t cover the content', () => {
  const { container } = render(<Default />)
  expect(container.querySelector('[aria-live="polite"]')).not.toHaveAttribute('data-busy')
})
