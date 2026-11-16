import { composeStories } from '@storybook/react-vite'
import { render, screen, within } from '@testing-library/react'
import { expect, test } from 'vitest'

import * as stories from './about.stories'

const { Default } = composeStories(stories)

test('renders the approved board in order with a placeholder for Jason', () => {
  render(<Default />)
  const cards = screen.getAllByRole('listitem')
  expect(cards).toHaveLength(11)
  expect(within(cards[0]).getByRole('heading', { name: 'Joel Chirhart' })).toBeInTheDocument()
  expect(within(cards[5]).getByRole('heading', { name: 'Jason Haas' })).toBeInTheDocument()
  expect(within(cards[5]).getByText('JH')).toBeInTheDocument()
  expect(within(cards[5]).queryByRole('img')).not.toBeInTheDocument()
  expect(within(cards[10]).getByText("Member At-Large '26–Present")).toBeInTheDocument()
  expect(within(cards[10]).getByText("Board Member '14–'25")).toBeInTheDocument()
  expect(within(screen.getByRole('list')).getAllByRole('img')).toHaveLength(10)
  expect(screen.getAllByText('Tag Master')).toHaveLength(2)
})

test('provides a lazy contact embed and an accessible fallback link', () => {
  render(<Default />)
  expect(screen.getByRole('heading', { name: 'Contact Us' })).toHaveAttribute('id', 'contact-us')
  const form = screen.getByTitle('Contact Us: Name, Email and Comment')
  expect(form).toHaveAttribute('loading', 'lazy')
  const fallback = screen.getByRole('link', { name: 'Open the contact form opens in a new tab' })
  expect(fallback).toHaveAttribute('target', '_blank')
  expect(form.getAttribute('src')).toBe(`${fallback.getAttribute('href')}?embedded=true`)
  // The embedded form comes first, with the new-tab link below it as the fallback.
  expect(form.compareDocumentPosition(fallback) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
})
