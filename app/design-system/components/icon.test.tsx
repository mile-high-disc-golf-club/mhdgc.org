import { composeStories } from '@storybook/react-vite'
import { render, screen } from '@testing-library/react'
import type { ReactElement } from 'react'
import { expect, it } from 'vitest'

import * as stories from './icon.stories'

const { Default, Filled, FilledFallback, Labeled } = composeStories(stories)

const svgOf = (ui: ReactElement) => render(ui).container.querySelector('svg')

it('draws the filled version when there is one', () => {
  expect(svgOf(<Filled />)).toHaveClass('tabler-icon-map-pin-filled')
  expect(svgOf(<Filled filled={false} />)).toHaveClass('tabler-icon-map-pin')
})

it('falls back to the outline when there is no filled version', () => {
  expect(svgOf(<FilledFallback />)?.outerHTML).toBe(
    svgOf(<FilledFallback filled={false} />)?.outerHTML,
  )
})

it('is hidden from screen readers without a label', () => {
  const { container } = render(<Default />)
  expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  expect(screen.queryByRole('img')).not.toBeInTheDocument()
})

it('is an image named by its label', () => {
  render(<Labeled />)
  expect(screen.getByRole('img', { name: 'YouTube' })).toBeInTheDocument()
})
