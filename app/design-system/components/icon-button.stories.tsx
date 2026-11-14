import type { Meta, StoryObj } from '@storybook/react-vite'

import type { ButtonVariant } from './button'
import { IconButton } from './icon-button'
import { Hover, Pressed, StoryGrid } from './story-grid'

const meta = {
  title: 'Design system/IconButton',
  component: IconButton,
  args: { icon: 'menu', label: 'Open menu' },
} satisfies Meta<typeof IconButton>

export default meta
type Story = StoryObj<typeof meta>

const variants: ButtonVariant[] = ['primary', 'secondary', 'ghost']

// Each variant in every size and shape, then its states.
export const Overview: Story = {
  render: (args) => (
    <StoryGrid
      columns={[
        'sm',
        'md',
        'lg',
        'sm circle',
        'md circle',
        'lg circle',
        'hover',
        'pressed',
        'disabled',
      ]}
      rows={variants.map((variant) => {
        const props = { ...args, variant }
        return {
          label: variant,
          cells: [
            <IconButton key="sm" {...props} size="sm" />,
            <IconButton key="md" {...props} size="md" />,
            <IconButton key="lg" {...props} size="lg" />,
            <IconButton key="sm-circle" {...props} size="sm" shape="circle" />,
            <IconButton key="md-circle" {...props} size="md" shape="circle" />,
            <IconButton key="lg-circle" {...props} size="lg" shape="circle" />,
            <Hover key="hover">
              <IconButton {...props} />
            </Hover>,
            <Pressed key="pressed">
              <IconButton {...props} />
            </Pressed>,
            <IconButton key="disabled" {...props} disabled />,
          ],
        }
      })}
    />
  ),
}

export const Ghost: Story = {}

export const Primary: Story = { args: { variant: 'primary' } }

export const Secondary: Story = { args: { variant: 'secondary' } }

// A video's play button sits over its thumbnail.
export const Play: Story = {
  args: { icon: 'play', label: 'Play video', variant: 'primary', size: 'lg', shape: 'circle' },
}

export const Disabled: Story = { args: { variant: 'secondary', disabled: true } }
