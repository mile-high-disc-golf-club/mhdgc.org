import { composeStories } from '@storybook/react-vite'
import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'

import * as stories from './not-found.stories'

const { Default } = composeStories(stories)

test('helps visitors recover from a missing page', () => {
  render(<Default />)
  expect(screen.getByRole('list', { name: 'Main pages' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { level: 1, name: 'Page not found' })).toBeInTheDocument()
  for (const [name, href] of Object.entries({
    Home: '/',
    Events: '/events',
    Membership: '/membership',
    About: '/about',
    'Contact us': '/about#contact-us',
  })) {
    expect(screen.getByRole('link', { name })).toHaveAttribute('href', href)
  }
})
