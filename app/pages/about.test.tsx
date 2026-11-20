import { composeStories } from '@storybook/react-vite'
import { render, screen, within } from '@testing-library/react'
import { expect, test } from 'vitest'

import * as stories from './about.stories'

const { Default, WithoutPhotos } = composeStories(stories)

// The stories render content/board.json, which the board edits in the CMS, so
// these check how the page shows any board rather than who is on it.
const board = Default.args.board ?? []
const initials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')

test('renders every board member in order, with their roles, tenure and photo', () => {
  render(<Default />)
  const cards = screen.getAllByRole('listitem')
  expect(board.length).toBeGreaterThan(0)
  expect(cards).toHaveLength(board.length)
  board.forEach((member, index) => {
    const card = within(cards[index])
    expect(card.getByRole('heading', { name: member.name })).toBeInTheDocument()
    for (const line of [...member.roles, ...member.tenure])
      expect(card.getByText(line)).toBeInTheDocument()
    if (member.photo) {
      expect(card.getByRole('img', { name: member.name })).toBeInTheDocument()
    } else {
      expect(card.getByText(initials(member.name))).toBeInTheDocument()
      expect(card.queryByRole('img')).not.toBeInTheDocument()
    }
  })
})

test("shows a member's initials in place of a missing photo", () => {
  render(<WithoutPhotos />)
  const cards = screen.getAllByRole('listitem')
  board.forEach((member, index) => {
    expect(within(cards[index]).getByText(initials(member.name))).toBeInTheDocument()
    expect(within(cards[index]).queryByRole('img')).not.toBeInTheDocument()
  })
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
