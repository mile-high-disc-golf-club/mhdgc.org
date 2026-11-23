import { composeStories } from '@storybook/react-vite'
import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'

import { fundraiserUrl } from './donate'
import * as stories from './donate.stories'

const { Default } = composeStories(stories)

test('links Donate Now to the Food Bank of the Rockies fundraiser in a new tab', () => {
  render(<Default />)
  expect(screen.getByRole('heading', { level: 1, name: 'Donate' })).toBeInTheDocument()
  const donate = screen.getByRole('link', { name: 'Donate Now opens in a new tab' })
  expect(donate).toHaveAttribute('href', fundraiserUrl)
  expect(donate).toHaveAttribute('target', '_blank')
  expect(donate).toHaveAttribute('rel', 'noopener noreferrer')
  expect(fundraiserUrl).toBe('https://fundraise.foodbankrockies.org/p2p/site/87SP5/page/5bSMNz#/')
})

test('sends direct donations to the contact form', () => {
  render(<Default />)
  expect(screen.getByRole('heading', { level: 2, name: 'Donating to the Club' })).toHaveAttribute(
    'id',
    'donating-to-the-club',
  )
  expect(screen.getByText(/don't have a simple way to do that yet/)).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'contact form' })).toHaveAttribute(
    'href',
    '/about#contact-us',
  )
})
