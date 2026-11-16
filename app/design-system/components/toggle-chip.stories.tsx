import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { eventColors } from '../theme'
import { Hover, StoryGrid } from './story-grid'
import { ToggleChip } from './toggle-chip'

const meta = {
  title: 'Design system/ToggleChip',
  component: ToggleChip,
  args: { pressed: true, color: 'event-tags', icon: 'tag', children: 'Tags League' },
} satisfies Meta<typeof ToggleChip>

export default meta
type Story = StoryObj<typeof meta>

// Each event color, pressed and not.
export const Overview: Story = {
  render: (args) => (
    <StoryGrid
      columns={['pressed', 'not pressed', 'hover']}
      rows={eventColors.map((color) => ({
        label: color,
        cells: [
          <ToggleChip key="on" {...args} color={color} pressed />,
          <ToggleChip key="off" {...args} color={color} pressed={false} />,
          <Hover key="hover">
            <ToggleChip {...args} color={color} pressed={false} />
          </Hover>,
        ],
      }))}
    />
  ),
}

export const Pressed: Story = {}

export const NotPressed: Story = { args: { pressed: false } }

// Click it to toggle.
export const Interactive: Story = {
  render: function Render(args) {
    const [pressed, setPressed] = useState(args.pressed)
    return (
      <ToggleChip
        {...args}
        pressed={pressed}
        onClick={() => {
          setPressed(!pressed)
        }}
      />
    )
  },
}
