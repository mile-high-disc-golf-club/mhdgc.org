import type { Meta, StoryObj } from '@storybook/react-vite'

import { Icon } from '~/design-system'

import { ButtonLink } from './button-link'

const meta = {
  title: 'Components/ButtonLink',
  component: ButtonLink,
  args: { to: '/membership', children: 'Join the club' },
} satisfies Meta<typeof ButtonLink>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {}

export const Secondary: Story = { args: { variant: 'secondary' } }

export const WithIcon: Story = {
  args: {
    to: '/events',
    variant: 'secondary',
    children: (
      <>
        <Icon name="calendar" />
        See every event
      </>
    ),
  },
}

// An action on another site, which opens in a new tab and says so.
export const NewTab: Story = {
  args: { to: 'https://www.example.com/', newTab: true, children: 'Donate Now' },
}
