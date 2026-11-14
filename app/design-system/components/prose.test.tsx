import { composeStories } from '@storybook/react-vite'
import { render, screen } from '@testing-library/react'
import type { ReactElement } from 'react'
import { describe, expect, it } from 'vitest'

import { proseElements } from './prose'
import * as stories from './prose.stories'
import { Text } from './text'

const { FromChildren, FromHtml } = composeStories(stories)

it('renders HTML from a loader', () => {
  render(<FromHtml />)
  expect(screen.getByRole('heading', { level: 2, name: 'Leagues' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'events calendar' })).toHaveAttribute('href', '/events')
})

it('renders elements passed as children with the same classes', () => {
  const { container: fromChildren } = render(<FromChildren />)
  const { container: fromHtml } = render(<FromHtml />)
  expect(fromChildren.firstElementChild?.className).toBe(fromHtml.firstElementChild?.className)
})

// Each Markdown element must look like the Text preset it stands for.
describe('matches the Text presets', () => {
  const presetClasses = (ui: ReactElement) =>
    render(ui).container.firstElementChild?.className.split(' ') ?? []

  it.each([
    ['h2', <Text.H2 key="h2">Heading</Text.H2>],
    ['h3', <Text.H3 key="h3">Heading</Text.H3>],
    ['a', <Text.Link key="a">Link</Text.Link>],
  ] as const)('%s', (element, preset) => {
    const prose = proseElements[element].split(' ')
    for (const name of presetClasses(preset).filter((name) => name !== 'text-current'))
      expect(prose).toContain(`[&_${element}]:${name}`)
  })

  it('body text', () => {
    const body = presetClasses(<Text.Body>Text</Text.Body>).filter(
      (name) => name !== 'text-current',
    )
    expect(proseElements.body.split(' ')).toEqual(expect.arrayContaining(body))
  })
})
