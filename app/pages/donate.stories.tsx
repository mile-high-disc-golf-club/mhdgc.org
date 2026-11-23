import type { Meta, StoryObj } from '@storybook/react-vite'

import { contentPage as page } from '~/../.storybook/content-page'
import donate from '~/../content/pages/donate.md?raw'
import club from '~/../content/pages/donate-club.md?raw'

import { DonatePage } from './donate'

const meta = {
  title: 'Pages/Donate',
  component: DonatePage,
  args: { donate: page(donate), club: page(club) },
} satisfies Meta<typeof DonatePage>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const Phone: Story = { globals: { viewport: { value: 'mobile', isRotated: false } } }
