import { composeStories } from '@storybook/react-vite'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test } from 'vitest'

import * as stories from './youtube-embed.stories'

const { MileHighClassic, HighPlainsChallenge } = composeStories(stories)

test('loads only a local thumbnail before activation, then a titled privacy-enhanced player', async () => {
  const user = userEvent.setup()
  const { container } = render(<MileHighClassic />)
  expect(container.querySelector('iframe')).toBeNull()
  expect(container.querySelector('img')?.getAttribute('src')).not.toMatch(/^https?:/)
  expect(screen.getByText('Mile High Classic')).toBeVisible()
  await user.tab()
  const button = screen.getByRole('button', {
    name: 'Play: The 2015 Peak One Mile High Classic Round 2 part 1',
  })
  expect(button).toHaveFocus()
  await user.keyboard('{Enter}')
  const player = screen.getByTitle('The 2015 Peak One Mile High Classic Round 2 part 1')
  expect(player).toHaveAttribute(
    'src',
    'https://www.youtube-nocookie.com/embed/BYpfS7tfhNI?autoplay=1',
  )
  expect(player).toHaveAttribute('allowfullscreen')
  expect(player).toHaveFocus()
  expect(screen.queryByRole('button')).not.toBeInTheDocument()
  expect(container.querySelector('img')).toBeNull()
  expect(screen.getByText('Mile High Classic')).toBeVisible()
})

test('each video waits for its own click', async () => {
  const user = userEvent.setup()
  const { container } = render(
    <>
      <MileHighClassic />
      <HighPlainsChallenge />
    </>,
  )
  await user.click(
    screen.getByRole('button', { name: 'Play: 2015 High Plains Challenge round 3 part 1' }),
  )
  expect(screen.getByTitle('2015 High Plains Challenge round 3 part 1')).toHaveAttribute(
    'src',
    'https://www.youtube-nocookie.com/embed/F2DkIwXATsY?autoplay=1',
  )
  expect(container.querySelectorAll('iframe')).toHaveLength(1)
  expect(screen.getByRole('button', { name: /Play: The 2015 Peak One/ })).toBeVisible()
})
