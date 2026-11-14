import type { Meta, StoryObj } from '@storybook/react-vite'

import { Spinner, type SpinnerSize } from './spinner'
import { StoryGrid } from './story-grid'

const meta = {
  title: 'Design system/Spinner',
  component: Spinner,
} satisfies Meta<typeof Spinner>

export default meta
type Story = StoryObj<typeof meta>

const sizes: SpinnerSize[] = ['sm', 'md', 'lg']

// Each size, without and with a label.
export const Overview: Story = {
  render: () => (
    <StoryGrid
      columns={['decorative', 'labeled']}
      rows={sizes.map((size) => ({
        label: size,
        cells: [
          <Spinner key="decorative" size={size} />,
          <Spinner key="labeled" size={size} label="Loading…" />,
        ],
      }))}
    />
  ),
}

export const Decorative: Story = {}

export const Labeled: Story = { args: { size: 'lg', label: 'Loading events…' } }
