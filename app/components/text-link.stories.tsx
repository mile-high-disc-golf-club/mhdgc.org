import type { Meta, StoryObj } from '@storybook/react-vite'

import { TextLink } from './text-link'

const meta = {
  title: 'Components/TextLink',
  component: TextLink,
  args: { to: '/events', children: 'see the events calendar' },
} satisfies Meta<typeof TextLink>

export default meta
type Story = StoryObj<typeof meta>

// In a sentence it wraps with the text around it.
export const InProse: Story = {
  render: (args) => (
    <p className="w-56">
      For league nights and tournaments, <TextLink {...args} />.
    </p>
  ),
}

// On its own line it gets a 44px tap target.
export const Standalone: Story = {
  args: { standalone: true, to: '/about', children: 'About the club' },
}

// Another site, opened in a new tab.
export const NewTab: Story = {
  render: (args) => (
    <p className="w-56">
      Find a course on <TextLink {...args} />.
    </p>
  ),
  args: { to: 'https://www.pdga.com/', newTab: true, children: 'the PDGA site' },
}

export const StandaloneNewTab: Story = {
  args: { ...NewTab.args, standalone: true, children: 'PDGA' },
}
