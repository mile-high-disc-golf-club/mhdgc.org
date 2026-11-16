import { composeStories } from '@storybook/react-vite'
import { fireEvent, render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'

import * as stories from './toggle-chip.stories'

const { Interactive, NotPressed, Pressed } = composeStories(stories)

it('is a toggle button filled in its color when pressed', () => {
  render(<Pressed />)
  const chip = screen.getByRole('button', { name: 'Tags League', pressed: true })
  expect(chip).toHaveClass('aria-pressed:bg-event-tags', 'aria-pressed:text-on-event')
  expect(chip.querySelector('svg')).toHaveClass('tabler-icon-tag-filled')
  expect(chip.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
})

it('is outlined, with an outline icon, when not pressed', () => {
  render(<NotPressed />)
  const chip = screen.getByRole('button', { name: 'Tags League', pressed: false })
  expect(chip).toHaveClass('border-line-strong', 'bg-surface')
  expect(chip.querySelector('svg')).toHaveClass('tabler-icon-tag')
})

it('keeps its label when toggled', () => {
  render(<Interactive />)
  fireEvent.click(screen.getByRole('button', { name: 'Tags League', pressed: true }))
  expect(screen.getByRole('button', { name: 'Tags League', pressed: false })).toBeInTheDocument()
})
