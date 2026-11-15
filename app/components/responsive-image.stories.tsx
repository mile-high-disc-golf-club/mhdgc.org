import type { Meta, StoryObj } from '@storybook/react-vite'

import { ResponsiveImage } from './responsive-image'

const meta = {
  title: 'Components/ResponsiveImage',
  component: ResponsiveImage,
  args: {
    image: { src: '/og-image.png', width: 1200, height: 630, sources: [] },
    alt: 'Mile High Disc Golf Club wordmark',
    sizes: '(max-width: 640px) 100vw, 640px',
  },
} satisfies Meta<typeof ResponsiveImage>

export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const Decorative: Story = { args: { alt: '' } }
export const Cropped: Story = { args: { className: 'aspect-square w-64 object-cover' } }
