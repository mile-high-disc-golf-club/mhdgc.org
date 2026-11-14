import { composeStories } from '@storybook/react-vite'
import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'

import * as stories from './icon-button.stories'

const { Ghost, Disabled, Play } = composeStories(stories)

it('names an icon button by its label', () => {
  render(<Ghost />)
  const button = screen.getByRole('button', { name: 'Open menu' })
  expect(button).toHaveAttribute('type', 'button')
  expect(button.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
})

it('keeps a 44px tap target at every size', () => {
  render(<Play />)
  expect(screen.getByRole('button', { name: 'Play video' })).toHaveClass(
    'after:size-11',
    'rounded-full',
  )
})

it('disables an icon button', () => {
  render(<Disabled />)
  expect(screen.getByRole('button', { name: 'Open menu' })).toBeDisabled()
})
