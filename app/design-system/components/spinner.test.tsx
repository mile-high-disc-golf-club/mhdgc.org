import { composeStories } from '@storybook/react-vite'
import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'

import * as stories from './spinner.stories'

const { Decorative, Labeled } = composeStories(stories)

it('announces a labeled spinner as a status', () => {
  render(<Labeled />)
  expect(screen.getByRole('status')).toHaveTextContent('Loading events…')
})

it('hides a spinner without a label from screen readers', () => {
  const { container } = render(<Decorative />)
  expect(screen.queryByRole('status')).toBeNull()
  expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
})
