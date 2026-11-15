import { composeStories } from '@storybook/react-vite'
import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'

import * as stories from './home.stories'

const { Default } = composeStories(stories)

test('renders the welcome, section headings and activity cards', () => {
  render(<Default />)

  expect(
    screen.getByRole('heading', { level: 1, name: 'Welcome to the Mile High Disc Golf Club' }),
  ).toBeInTheDocument()
  expect(screen.getByRole('heading', { level: 2, name: 'What We Do' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { level: 2, name: 'Get Involved' })).toBeInTheDocument()
  for (const activity of [
    'Weekly Tag Matches',
    'Events & Tournaments',
    'Course Cleanups & Improvements',
    'Community Building',
  ])
    expect(screen.getByText(activity, { selector: 'li > strong' })).toBeInTheDocument()
})

test('links visitors to events, membership anchors and the Facebook group', () => {
  render(<Default />)
  expect(screen.getByRole('link', { name: 'Club Tags Work' })).toHaveAttribute(
    'href',
    '/membership#how-tag-matches-work',
  )
  expect(screen.getByRole('link', { name: 'Club Member' })).toHaveAttribute(
    'href',
    '/membership#how-to-join',
  )
  expect(screen.getByRole('link', { name: 'Facebook' })).toHaveAttribute(
    'href',
    'https://www.facebook.com/groups/mhdgc/',
  )
  expect(screen.getAllByRole('link', { name: 'Events' })).toHaveLength(2)
  expect(screen.getByRole('link', { name: 'Membership' })).toHaveAttribute('href', '/membership')
  expect(screen.getAllByRole('button', { name: /^Play:/ })).toHaveLength(2)
  expect(document.querySelector('iframe')).toBeNull()
})
