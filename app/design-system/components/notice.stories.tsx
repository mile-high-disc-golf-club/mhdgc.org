import type { Meta, StoryObj } from '@storybook/react-vite'

import { Notice, type NoticeTone } from './notice'
import { StoryGrid } from './story-grid'
import { Text } from './text'

const meta = {
  title: 'Design system/Notice',
  component: Notice,
  args: {
    children: <Text.Body>The course is closed for maintenance until further notice.</Text.Body>,
  },
} satisfies Meta<typeof Notice>

export default meta
type Story = StoryObj<typeof meta>

const tones: NoticeTone[] = ['info', 'success', 'warning', 'danger']

// Each tone, with and without a title.
export const Overview: Story = {
  render: (args) => (
    <StoryGrid
      columns={['with title', 'without title']}
      rows={tones.map((tone) => ({
        label: tone,
        cells: [
          <Notice key="title" {...args} tone={tone} title="Course closed" />,
          <Notice key="plain" {...args} tone={tone} />,
        ],
      }))}
    />
  ),
}

export const Info: Story = { args: { title: 'Course closed' } }

export const Warning: Story = { args: { tone: 'warning', title: 'Course closed' } }

// The events list when the calendars couldn't load, announced as it appears.
export const LoadError: Story = {
  args: {
    tone: 'danger',
    role: 'alert',
    title: "Events couldn't load",
    children: <Text.Body>Check your connection and try again.</Text.Body>,
  },
}
