import type { Meta, StoryObj } from '@storybook/react-vite'

import HomePage from './home'

const meta = {
  component: HomePage,
} satisfies Meta<typeof HomePage>

export default meta

export const Default: StoryObj<typeof meta> = {}
