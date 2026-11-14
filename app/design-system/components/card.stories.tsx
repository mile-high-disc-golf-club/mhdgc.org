import type { Meta, StoryObj } from '@storybook/react-vite'

import { Badge } from './badge'
import { Card } from './card'
import { Text } from './text'

const meta = {
  title: 'Design system/Card',
  component: Card,
  args: {
    children: (
      <>
        <Text.H2>Thursday doubles</Text.H2>
        <Text.Body>Random partners, two rounds, all skill levels.</Text.Body>
      </>
    ),
  },
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

// An event, as the events list will show one.
export const Event: Story = {
  args: {
    as: 'article',
    children: (
      <>
        <Badge tone="primary" icon="calendar">
          League
        </Badge>
        <Text.H3 as="h2">Thursday doubles</Text.H3>
        <Text.Small>Riverside Park · 6:00 PM</Text.Small>
      </>
    ),
  },
}

// Cards in a list, each an item.
export const List: Story = {
  render: () => (
    <ul className="grid gap-4 sm:grid-cols-2">
      {['Thursday doubles', 'Sunday singles'].map((name) => (
        <Card key={name} as="li">
          <Text.H3 as="h2">{name}</Text.H3>
          <Text.Body>All skill levels.</Text.Body>
        </Card>
      ))}
    </ul>
  ),
}
