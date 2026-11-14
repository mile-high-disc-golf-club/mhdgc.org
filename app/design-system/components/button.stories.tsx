import type { Meta, StoryObj } from '@storybook/react-vite'

import { Button, buttonClasses, type ButtonVariant } from './button'
import { Icon } from './icon'
import { Hover, Pressed, StoryGrid } from './story-grid'
import { Text } from './text'

const meta = {
  title: 'Design system/Button',
  component: Button,
  args: { children: 'Show more events' },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

const variants: ButtonVariant[] = ['primary', 'secondary', 'ghost']

// Each variant in each state.
export const Overview: Story = {
  render: (args) => (
    <StoryGrid
      columns={['default', 'hover', 'pressed', 'disabled']}
      rows={variants.map((variant) => ({
        label: variant,
        cells: [
          <Button key="default" {...args} variant={variant} />,
          <Hover key="hover">
            <Button {...args} variant={variant} />
          </Hover>,
          <Pressed key="pressed">
            <Button {...args} variant={variant} />
          </Pressed>,
          <Button key="disabled" {...args} variant={variant} disabled />,
        ],
      }))}
    />
  ),
}

export const Primary: Story = {}

export const Secondary: Story = { args: { variant: 'secondary' } }

export const Ghost: Story = { args: { variant: 'ghost' } }

export const Disabled: Story = { args: { disabled: true } }

export const WithIcon: Story = {
  args: {
    variant: 'secondary',
    children: (
      <>
        <Icon name="calendar" />
        Add to calendar
      </>
    ),
  },
}

// `buttonClasses` on a link, as the app's ButtonLink uses it.
export const LinkLook: Story = {
  render: () => (
    <StoryGrid
      columns={['default', 'hover', 'pressed']}
      rows={variants.map((variant) => {
        const link = (
          <a href="/membership" className={buttonClasses({ variant })}>
            <Text.Button>Join the club</Text.Button>
          </a>
        )
        return {
          label: variant,
          cells: [
            <span key="default">{link}</span>,
            <Hover key="hover">{link}</Hover>,
            <Pressed key="pressed">{link}</Pressed>,
          ],
        }
      })}
    />
  ),
}
