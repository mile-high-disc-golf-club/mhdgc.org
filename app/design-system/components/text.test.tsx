import { composeStories } from '@storybook/react-vite'
import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'

import { textLinkClasses } from './text'
import * as stories from './text.stories'

const { AsElement, Danger, Heading, Lines, Numeric, UndefinedColor } = composeStories(stories)

it('renders a heading preset as its heading level, in the display face', () => {
  render(<Heading />)
  expect(screen.getByRole('heading', { level: 1 })).toHaveClass('font-display', 'text-3xl')
})

it('renders a preset as the element passed in `as`', () => {
  render(<AsElement />)
  expect(screen.getByRole('heading', { level: 2 })).toHaveClass('text-xl', 'font-semibold')
})

it('applies the color token', () => {
  render(<Danger />)
  expect(screen.getByText("Events couldn't load")).toHaveClass('text-danger-ink')
})

it('keeps a preset default when a prop is passed as undefined', () => {
  render(<UndefinedColor />)
  expect(screen.getByRole('heading', { level: 1 })).toHaveClass('text-ink')
})

it('uses same-width digits when numeric', () => {
  render(<Numeric />)
  expect(screen.getByText('6:00 PM')).toHaveClass('tabular-nums')
})

it('cuts text to one line or clamps it to two', () => {
  render(<Lines />)
  expect(screen.getByText('Riverside Park, north parking lot')).toHaveClass('truncate')
  expect(screen.getByRole('heading', { level: 2 })).toHaveClass('line-clamp-2')
})

it('gives a text link a tap target only when standalone', () => {
  expect(textLinkClasses()).toBe('')
  expect(textLinkClasses({ standalone: true }).split(' ')).toContain('min-h-11')
})
