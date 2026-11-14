import type { Meta, StoryObj } from '@storybook/react-vite'

import { StoryGrid } from './story-grid'
import { Text, type TextColor, type TextSize, type TextWeight } from './text'

const meta = {
  title: 'Design system/Text',
  component: Text,
  args: { children: 'Thursday doubles at Riverside Park' },
} satisfies Meta<typeof Text>

export default meta
type Story = StoryObj<typeof meta>

const presets = ['H1', 'H2', 'H3', 'Body', 'Small', 'Label', 'Caption', 'Button', 'Link'] as const
const sizes: TextSize[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl']
const weights: TextWeight[] = ['regular', 'medium', 'semibold', 'bold']
const colors: TextColor[] = [
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

// Every preset. Each heading renders as a span here, so the grid keeps one heading order.
export const Overview: Story = {
  render: (args) => (
    <StoryGrid
      columns={['sample']}
      rows={presets.map((preset) => {
        const Preset = Text[preset]
        return {
          label: preset,
          cells: [
            <Preset key="sample" as="span">
              {args.children}
            </Preset>,
          ],
        }
      })}
    />
  ),
}

export const Sizes: Story = {
  render: () => (
    <StoryGrid
      columns={weights}
      rows={sizes.map((size) => ({
        label: size,
        cells: weights.map((weight) => (
          <Text key={weight} as="span" size={size} weight={weight}>
            Aa
          </Text>
        )),
      }))}
    />
  ),
}

export const Colors: Story = {
  render: (args) => (
    <StoryGrid
      columns={['sample']}
      rows={colors.map((color) => ({
        label: color,
        cells: [
          <Text key="sample" as="span" color={color}>
            {args.children}
          </Text>,
        ],
      }))}
    />
  ),
}

// A preset can render as another element, such as a heading styled smaller.
export const AsElement: Story = {
  render: () => <Text.H3 as="h2">Upcoming events</Text.H3>,
}

export const Heading: Story = { render: () => <Text.H1>Mile High Disc Golf Club</Text.H1> }

export const Danger: Story = {
  render: () => <Text.Small color="danger">Events couldn't load</Text.Small>,
}

// A preset keeps its default when an optional prop arrives as undefined.
export const UndefinedColor: Story = {
  render: () => <Text.H1 color={undefined}>Mile High Disc Golf Club</Text.H1>,
}

// Same-width digits, so a column of times lines up.
export const Numeric: Story = {
  render: () => (
    <div className="flex flex-col">
      {['6:00 PM', '10:30 AM', '11:15 AM'].map((time) => (
        <Text key={time} numeric>
          {time}
        </Text>
      ))}
    </div>
  ),
}

// Long text cut to one line, or clamped to two, inside a narrow parent.
export const Lines: Story = {
  render: () => (
    <div className="flex w-40 flex-col gap-4">
      <Text lines={1}>Riverside Park, north parking lot</Text>
      <Text.H2 lines={2}>Thursday Night Doubles at Riverside Park</Text.H2>
    </div>
  ),
}
