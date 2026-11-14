import type { Meta, StoryObj } from '@storybook/react-vite'

import { LoadingRegion } from './loading-region'
import { Text } from './text'

const meta = {
  title: 'Design system/LoadingRegion',
  component: LoadingRegion,
  args: {
    label: 'Loading events…',
    children: (
      <>
        <Text.H2>Upcoming events</Text.H2>
        <Text.Body>Thursday doubles</Text.Body>
        <a href="/events">See every event</a>
      </>
    ),
  },
} satisfies Meta<typeof LoadingRegion>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

// Refreshing content that's already on screen.
export const Busy: Story = { args: { busy: true } }

// The first load, before there's anything to show.
export const FirstLoad: Story = { args: { busy: true, children: undefined } }
