import type { Meta, StoryObj } from '@storybook/react-vite'

import { NotFoundPage } from './not-found'

const meta = {
  title: 'Pages/Not Found',
  component: NotFoundPage,
} satisfies Meta<typeof NotFoundPage>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const Phone: Story = { globals: { viewport: { value: 'mobile', isRotated: false } } }
