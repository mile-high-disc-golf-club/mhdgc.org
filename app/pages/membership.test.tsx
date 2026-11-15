import { composeStories } from '@storybook/react-vite'
import { render, screen, within } from '@testing-library/react'
import { expect, test } from 'vitest'

import * as stories from './membership.stories'

const { Default } = composeStories(stories)

test('provides Home’s membership anchors and a way to join and contact the club', () => {
  render(<Default />)
  expect(screen.getByRole('heading', { level: 1, name: 'Membership' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'How to Join' })).toHaveAttribute('id', 'how-to-join')
  expect(screen.getByRole('heading', { name: 'How Do Tag Matches Work?' })).toHaveAttribute(
    'id',
    'how-tag-matches-work',
  )
  expect(screen.getByRole('link', { name: 'Find a Tag Match' })).toHaveAttribute('href', '/events')
  expect(screen.getByRole('link', { name: 'Facebook' })).toHaveAttribute(
    'href',
    'https://www.facebook.com/groups/mhdgc/',
  )
  expect(screen.getByText(/at no cost/)).toBeInTheDocument()
  expect(screen.getByText(/general club tag at a discount/)).toBeInTheDocument()
  expect(screen.getByText(/Grand Masters \(55\+\)/)).toBeInTheDocument()
})

test('shows ordered match steps and the approved division scoring note', () => {
  render(<Default />)
  const steps = screen.getAllByRole('list').find((list) => list.tagName === 'OL')
  if (!steps) throw new Error('Missing ordered match steps')
  expect(within(steps).getAllByRole('listitem')).toHaveLength(4)
  expect(Array.from(steps.querySelectorAll('strong'), (item) => item.textContent)).toEqual([
    'Check In',
    'Tags Are Collected',
    'Play the Round',
    'Tags Are Reassigned',
  ])
  expect(
    screen.getByText(/Grand Masters players typically receive a -3 stroke adjustment/),
  ).toBeInTheDocument()
  expect(screen.getByText('Grand Masters Tags')).toBeInTheDocument()
  expect(screen.queryByText(/Senior/)).not.toBeInTheDocument()
  expect(screen.queryByRole('link', { name: 'UDisc' })).not.toBeInTheDocument()
  expect(screen.getByRole('img', { name: /numbered bag tags/ })).toHaveAttribute('width', '1152')
})
