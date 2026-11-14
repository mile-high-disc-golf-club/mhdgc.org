import { composeStories } from '@storybook/react-vite'
import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'

import * as stories from './badge.stories'

const { Calendar, Neutral } = composeStories(stories)

it('sets its label in the label type on a neutral tint', () => {
  render(<Neutral />)
  const label = screen.getByText('League')
  expect(label).toHaveClass('font-medium')
  expect(label.parentElement).toHaveClass('bg-surface-hover', 'text-ink-muted')
})

it('colors the badge by tone, with a decorative icon', () => {
  render(<Calendar />)
  const badge = screen.getByText('League').parentElement
  expect(badge).toHaveClass('bg-info-soft', 'text-info-ink')
  expect(badge?.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
})
