import { composeStories } from '@storybook/react-vite'
import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'

import * as stories from './home.stories'

const { Default } = composeStories(stories)

test('renders the club welcome heading', () => {
  render(<Default />)

  expect(
    screen.getByRole('heading', { level: 1, name: 'Welcome to the Mile High Disc Golf Club' }),
  ).toBeInTheDocument()
})
