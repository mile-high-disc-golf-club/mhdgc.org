import type { Meta, StoryObj } from '@storybook/react-vite'

import { Badge, type BadgeTone } from './badge'
import { StoryGrid } from './story-grid'

const meta = {
  title: 'Design system/Badge',
  component: Badge,
  args: { children: 'League' },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

const tones: BadgeTone[] = ['neutral', 'primary', 'accent', 'success', 'info', 'warning', 'danger']

// Each tone, without and with an icon.
export const Overview: Story = {
  render: (args) => (
    <StoryGrid
      columns={['label', 'with icon']}
      rows={tones.map((tone) => ({
        label: tone,
        cells: [
          <Badge key="label" {...args} tone={tone} />,
          <Badge key="icon" {...args} tone={tone} icon="calendar" />,
        ],
      }))}
    />
  ),
}

export const Neutral: Story = {}

// The calendar an event comes from.
export const Calendar: Story = { args: { tone: 'info', icon: 'calendar' } }
