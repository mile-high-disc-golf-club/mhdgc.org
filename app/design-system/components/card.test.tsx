import { composeStories } from '@storybook/react-vite'
import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'

import * as stories from './card.stories'

const { Default, Event, List } = composeStories(stories)

it('is a raised panel on the surface color', () => {
  render(<Default />)
  const card = screen.getByRole('heading', { name: 'Thursday doubles' }).parentElement
  expect(card?.tagName).toBe('DIV')
  expect(card).toHaveClass('bg-surface', 'border-line', 'rounded-lg')
})

it('renders as the element passed in `as`', () => {
  render(<Event />)
  expect(screen.getByRole('article')).toContainElement(screen.getByRole('heading'))
})

it('renders as list items inside a list', () => {
  render(<List />)
  expect(screen.getAllByRole('listitem')).toHaveLength(2)
})
