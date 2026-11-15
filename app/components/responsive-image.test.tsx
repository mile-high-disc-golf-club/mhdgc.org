import { composeStories } from '@storybook/react-vite'
import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'

import * as stories from './responsive-image.stories'

const { Default, Decorative, Cropped } = composeStories(stories)

test('preserves intrinsic dimensions and selects modern sources with layout sizes', () => {
  const { container } = render(
    <Default
      image={{
        src: '/photo.png',
        width: 640,
        height: 320,
        sources: [
          { type: 'image/avif', srcSet: '/photo-320.avif 320w, /photo-640.avif 640w' },
          { type: 'image/webp', srcSet: '/photo-320.webp 320w, /photo-640.webp 640w' },
        ],
      }}
    />,
  )
  const image = screen.getByRole('img', { name: 'Mile High Disc Golf Club wordmark' })
  expect(image).toHaveAttribute('width', '640')
  expect(image).toHaveAttribute('height', '320')
  expect(image).toHaveAttribute('loading', 'lazy')
  const sources = container.querySelectorAll('picture source')
  expect(sources).toHaveLength(2)
  expect(sources[0]).toHaveAttribute('type', 'image/avif')
  expect(sources[0]).toHaveAttribute('srcset', '/photo-320.avif 320w, /photo-640.avif 640w')
  expect(sources[1]).toHaveAttribute('sizes', '(max-width: 640px) 100vw, 640px')
})

test('supports decorative images and eager loading', () => {
  const { container } = render(<Decorative loading="eager" />)
  expect(screen.queryByRole('img')).not.toBeInTheDocument()
  expect(container.querySelector('img')).toHaveAttribute('alt', '')
  expect(container.querySelector('img')).toHaveAttribute('loading', 'eager')
})

test('keeps the image inside its container when a class is added', () => {
  const { container } = render(<Cropped />)
  expect(container.querySelector('img')).toHaveClass('max-w-full', 'object-cover')
})
