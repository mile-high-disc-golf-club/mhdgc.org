import type { Meta, StoryObj } from '@storybook/react-vite'

import { Icon, type IconColor, type IconSize } from './icon'
import { type IconName, icons } from './icons'
import { StoryGrid } from './story-grid'

const meta = {
  title: 'Design system/Icon',
  component: Icon,
  args: { name: 'calendar' },
} satisfies Meta<typeof Icon>

export default meta
type Story = StoryObj<typeof meta>

const colors: IconColor[] = [
  'current',
  'ink',
  'muted',
  'primary',
  'link',
  'accent',
  'success',
  'info',
  'warning',
  'danger',
]
const sizes: IconSize[] = ['sm', 'md', 'lg', 'xl']

// Every color at every size, then filled.
export const Overview: Story = {
  render: (args) => (
    <StoryGrid
      columns={[...sizes, 'filled']}
      rows={colors.map((color) => ({
        label: color,
        cells: [
          ...sizes.map((size) => <Icon key={size} {...args} color={color} size={size} />),
          <Icon key="filled" {...args} color={color} size="lg" filled />,
        ],
      }))}
    />
  ),
}

export const Default: Story = {}

export const Filled: Story = { args: { name: 'location', filled: true } }

// `menu` has no filled version, so it shows the outline.
export const FilledFallback: Story = { args: { name: 'menu', filled: true } }

export const Labeled: Story = { args: { name: 'youtube', label: 'YouTube', color: 'ink' } }

const names = Object.keys(icons) as IconName[]

// Every icon the site uses, with its filled version beside it.
export const Gallery: Story = {
  render: () => (
    <ul className="grid grid-cols-3 gap-4 text-sm sm:grid-cols-5">
      {names.map((name) => (
        <li key={name} className="flex flex-col items-center gap-2 text-center">
          <span className="flex gap-2">
            <Icon name={name} size="lg" />
            {'filled' in icons[name] && <Icon name={name} size="lg" filled />}
          </span>
          {name}
        </li>
      ))}
    </ul>
  ),
}

export const InheritsTextColor: Story = {
  render: (args) => (
    <p className="flex items-center gap-1 text-primary-ink">
      <Icon {...args} name="location" />
      Takes the color of the text around it
    </p>
  ),
}
