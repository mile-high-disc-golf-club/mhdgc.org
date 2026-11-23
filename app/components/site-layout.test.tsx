import { composeStories } from '@storybook/react-vite'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

import * as stories from './site-layout.stories'

const { Desktop, HomePage, MobileMenuOpen, PrerenderedPath } = composeStories(stories)

// jsdom has no matchMedia. This one starts at phone width, and `resizeTo` crosses the
// tablet breakpoint the way widening the window would.
let isTablet = false
let mediaListeners: (() => void)[] = []
function resizeTo(width: 'phone' | 'tablet') {
  isTablet = width === 'tablet'
  act(() => {
    for (const listener of mediaListeners) listener()
  })
}

beforeEach(() => {
  isTablet = false
  mediaListeners = []
  vi.stubGlobal('matchMedia', (query: string) => ({
    media: query,
    get matches() {
      return isTablet
    },
    addEventListener: (_type: string, listener: () => void) => {
      mediaListeners.push(listener)
    },
    removeEventListener: (_type: string, listener: () => void) => {
      mediaListeners = mediaListeners.filter((other) => other !== listener)
    },
  }))
})

afterEach(() => {
  vi.unstubAllGlobals()
})

it('has one header, labeled main nav, main and footer', () => {
  render(<Desktop />)
  expect(screen.getByRole('banner')).toBeInTheDocument()
  expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument()
  expect(screen.getByRole('main')).toHaveAttribute('id', 'main')
  expect(screen.getByRole('contentinfo')).toBeInTheDocument()
})

it('starts with a skip link to the main content', () => {
  render(<Desktop />)
  const skip = screen.getAllByRole('link')[0]
  expect(skip).toHaveAccessibleName('Skip to content')
  expect(skip).toHaveAttribute('href', '#main')
})

it('links the badge and club name home', () => {
  render(<Desktop />)
  expect(screen.getByRole('link', { name: 'Mile High Disc Golf' })).toHaveAttribute('href', '/')
})

it('lists the nav links in order and marks the current page', () => {
  render(<Desktop />)
  const nav = screen.getByRole('navigation', { name: 'Main' })
  const links = within(nav).getAllByRole('link')
  expect(links.map((link) => link.textContent)).toEqual([
    'Home',
    'Events',
    'Membership',
    'About',
    'Donate',
  ])
  expect(within(nav).getByRole('link', { name: 'Events' })).toHaveAttribute('aria-current', 'page')
  expect(within(nav).getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current')
})

it('marks the current page at the trailing-slash path prerendering uses', () => {
  render(<PrerenderedPath />)
  const nav = screen.getByRole('navigation', { name: 'Main' })
  const current = within(nav)
    .getAllByRole('link')
    .filter((link) => link.getAttribute('aria-current') === 'page')
  expect(current.map((link) => link.textContent)).toEqual(['Events'])
})

it('marks only Home as current on the home page', () => {
  render(<HomePage />)
  const nav = screen.getByRole('navigation', { name: 'Main' })
  const current = within(nav)
    .getAllByRole('link')
    .filter((link) => link.getAttribute('aria-current') === 'page')
  expect(current.map((link) => link.textContent)).toEqual(['Home'])
})

it('opens and closes the menu with its button', () => {
  render(<Desktop />)
  const button = screen.getByRole('button', { name: 'Menu' })
  const menu = document.getElementById(button.getAttribute('aria-controls') ?? '')
  expect(menu).toBeInstanceOf(HTMLUListElement)
  expect(button).toHaveAttribute('aria-expanded', 'false')
  expect(menu).not.toHaveAttribute('data-open')

  fireEvent.click(button)
  expect(button).toHaveAttribute('aria-expanded', 'true')
  expect(menu).toHaveAttribute('data-open')

  fireEvent.click(button)
  expect(button).toHaveAttribute('aria-expanded', 'false')
})

it('closes the menu on Escape and returns focus to its button', () => {
  render(<MobileMenuOpen />)
  const button = screen.getByRole('button', { name: 'Menu' })
  fireEvent.click(button)
  expect(button).toHaveAttribute('aria-expanded', 'true')

  fireEvent.keyDown(document, { key: 'Escape' })
  expect(button).toHaveAttribute('aria-expanded', 'false')
  expect(button).toHaveFocus()
})

it('closes the menu on a click outside the nav, and not on one inside it', () => {
  render(<Desktop />)
  const button = screen.getByRole('button', { name: 'Menu' })
  fireEvent.click(button)

  const nav = screen.getByRole('navigation', { name: 'Main' })
  fireEvent.pointerDown(within(nav).getByRole('list'))
  expect(button).toHaveAttribute('aria-expanded', 'true')

  fireEvent.pointerDown(screen.getByRole('main'))
  expect(button).toHaveAttribute('aria-expanded', 'false')
  // Focus stays where the click put it, rather than jumping back to the button.
  expect(button).not.toHaveFocus()
})

it('closes the menu when focus leaves the nav, and not while it moves inside it', () => {
  vi.useFakeTimers()
  try {
    render(<Desktop />)
    const button = screen.getByRole('button', { name: 'Menu' })
    act(() => {
      button.focus()
    })
    fireEvent.click(button)

    const nav = screen.getByRole('navigation', { name: 'Main' })
    act(() => {
      within(nav).getByRole('link', { name: 'About' }).focus()
      vi.runAllTimers()
    })
    expect(button).toHaveAttribute('aria-expanded', 'true')

    // Tabbing on from the last link, out of the panel.
    act(() => {
      screen.getByRole('link', { name: 'Back to top' }).focus()
      vi.runAllTimers()
    })
    expect(button).toHaveAttribute('aria-expanded', 'false')
  } finally {
    vi.useRealTimers()
  }
})

it('leaves the menu to the click when focus drops to the body, as Safari does', () => {
  vi.useFakeTimers()
  try {
    render(<Desktop />)
    const button = screen.getByRole('button', { name: 'Menu' })
    fireEvent.click(button)
    const nav = screen.getByRole('navigation', { name: 'Main' })
    act(() => {
      within(nav).getByRole('link', { name: 'About' }).focus()
    })

    // Safari's mousedown on the menu button blurs the link without focusing the
    // button, before the click closes the menu.
    act(() => {
      ;(document.activeElement as HTMLElement).blur()
      vi.runAllTimers()
    })
    expect(button).toHaveAttribute('aria-expanded', 'true')
    fireEvent.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'false')
  } finally {
    vi.useRealTimers()
  }
})

it('keeps the menu open when the window loses focus', () => {
  vi.useFakeTimers()
  const hasFocus = vi.spyOn(document, 'hasFocus')
  try {
    render(<Desktop />)
    const button = screen.getByRole('button', { name: 'Menu' })
    act(() => {
      button.focus()
    })
    fireEvent.click(button)

    hasFocus.mockReturnValue(false)
    act(() => {
      button.blur()
      vi.runAllTimers()
    })
    expect(button).toHaveAttribute('aria-expanded', 'true')
  } finally {
    hasFocus.mockRestore()
    vi.useRealTimers()
  }
})

it('closes the menu when the window widens to tablet width', () => {
  render(<Desktop />)
  const button = screen.getByRole('button', { name: 'Menu' })
  fireEvent.click(button)
  expect(button).toHaveAttribute('aria-expanded', 'true')

  resizeTo('tablet')
  expect(button).toHaveAttribute('aria-expanded', 'false')
  // Its listeners go once it's closed, so narrowing the window again leaves it closed.
  expect(mediaListeners).toHaveLength(0)
  resizeTo('phone')
  expect(button).toHaveAttribute('aria-expanded', 'false')
})

it('closes the menu when a link is chosen', () => {
  render(<Desktop />)
  const button = screen.getByRole('button', { name: 'Menu' })
  fireEvent.click(button)
  fireEvent.click(screen.getByRole('link', { name: 'About' }))
  expect(button).toHaveAttribute('aria-expanded', 'false')
})

it('links straight to the social sites in a new tab', () => {
  render(<Desktop />)
  const facebook = screen.getByRole('link', { name: 'Facebook opens in a new tab' })
  expect(facebook).toHaveAttribute('href', 'https://www.facebook.com/groups/mhdgc/')
  expect(facebook).toHaveAttribute('target', '_blank')
  expect(facebook).toHaveAttribute('rel', 'noopener noreferrer')
  expect(screen.getByRole('link', { name: 'Instagram opens in a new tab' })).toHaveAttribute(
    'href',
    'https://www.instagram.com/mhdgc_co/',
  )
})

it('shows the 501(c)(3) line, the copyright year and a link back to the top', () => {
  render(<Desktop />)
  const footer = screen.getByRole('contentinfo')
  expect(
    within(footer).getByText('Mile High Disc Golf Club is a registered 501(c)(3)'),
  ).toBeInTheDocument()
  expect(within(footer).getByText('© 2026 Mile High Disc Golf Club')).toBeInTheDocument()
  expect(within(footer).getByRole('link', { name: 'Back to top' })).toHaveAttribute('href', '#top')
  expect(document.getElementById('top')).toBeInTheDocument()
})

it('leaves out the copyright when the year is unknown', () => {
  render(<Desktop year={undefined} />)
  expect(screen.queryByText(/©/)).not.toBeInTheDocument()
})
