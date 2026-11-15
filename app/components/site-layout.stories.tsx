import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'

import { Text } from '~/design-system'

import { SiteLayout } from './site-layout'

const meta = {
  title: 'Components/SiteLayout',
  component: SiteLayout,
  args: {
    year: 2026,
    children: <Text.H1>Upcoming events</Text.H1>,
  },
  parameters: { layout: 'fullscreen', path: '/events' },
} satisfies Meta<typeof SiteLayout>

export default meta
type Story = StoryObj<typeof meta>

// Nav links in a row in the header, with the current page marked.
export const Desktop: Story = {}

// The links are behind the menu button.
export const Mobile: Story = {
  globals: { viewport: { value: 'mobile', isRotated: false } },
}

// The menu open, showing the links in a panel under the header.
export const MobileMenuOpen: Story = {
  globals: { viewport: { value: 'mobile', isRotated: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', { name: 'Menu' })
    await userEvent.click(button)
    await expect(button).toHaveAttribute('aria-expanded', 'true')
  },
}

// Prerendering renders each page at its path with a trailing slash. Events is still current.
export const PrerenderedPath: Story = {
  parameters: { path: '/events/' },
}

// On the home page, Home is the current link.
export const HomePage: Story = {
  parameters: { path: '/' },
  args: { children: <Text.H1>Welcome to the Mile High Disc Golf Club</Text.H1> },
}
