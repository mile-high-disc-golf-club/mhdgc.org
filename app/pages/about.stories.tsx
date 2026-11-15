import type { Meta, StoryObj } from '@storybook/react-vite'

import { AboutPage } from './about'

const meta = {
  title: 'Pages/About',
  component: AboutPage,
  args: { title: 'Meet the Board', html: '' },
} satisfies Meta<typeof AboutPage>
export default meta
type Story = StoryObj<typeof meta>
export const Placeholder: Story = {}
