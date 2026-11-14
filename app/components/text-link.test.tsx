import { composeStories } from '@storybook/react-vite'
import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'

import * as stories from './text-link.stories'

const { InProse, NewTab, Standalone, StandaloneNewTab } = composeStories(stories)

it('gives the label the link color, medium weight and an underline', () => {
  render(<InProse />)
  const label = screen.getByText('see the events calendar')
  expect(label.tagName).toBe('SPAN')
  expect(label).toHaveClass('text-link', 'font-medium', 'underline')
})

it('stays inline in a sentence, with no tap-target height', () => {
  render(<InProse />)
  const link = screen.getByRole('link')
  expect(link).toHaveAttribute('href', '/events')
  expect(link).not.toHaveClass('min-h-11')
  expect(link).not.toHaveAttribute('target')
})

it('gives a standalone link a 44px tap target', () => {
  render(<Standalone />)
  expect(screen.getByRole('link', { name: 'About the club' })).toHaveClass('min-h-11')
})

it('opens another site in a new tab and says so', () => {
  render(<NewTab />)
  const link = screen.getByRole('link', { name: 'the PDGA site opens in a new tab' })
  expect(link).toHaveAttribute('href', 'https://www.pdga.com/')
  expect(link).toHaveAttribute('target', '_blank')
  expect(link).toHaveAttribute('rel', 'noopener noreferrer')
})

it('keeps the tap target on a standalone new-tab link', () => {
  render(<StandaloneNewTab />)
  expect(screen.getByRole('link', { name: 'PDGA opens in a new tab' })).toHaveClass('min-h-11')
})
