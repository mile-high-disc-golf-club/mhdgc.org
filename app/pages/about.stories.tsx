import type { Meta, StoryObj } from '@storybook/react-vite'

import board from '~/../content/board.json'

import { AboutPage } from './about'

const photos = import.meta.glob<{ default: string }>('~/../content/images/board/*.jpg', {
  eager: true,
})
function photoSource(name: string) {
  const entry = Object.entries(photos).find(([path]) => path.endsWith(name))
  if (!entry) throw new Error(`Missing board photo: ${name}`)
  return entry[1].default
}

const meta = {
  title: 'Pages/About',
  component: AboutPage,
  args: {
    title: 'Meet the Board',
    html: '',
    board: board.map(({ photo, ...member }) => ({
      ...member,
      ...(photo
        ? {
            photo: {
              src: photoSource(photo),
              width: 640,
              height: 640,
              sources: [],
            },
          }
        : {}),
    })),
  },
} satisfies Meta<typeof AboutPage>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const Phone: Story = { globals: { viewport: { value: 'mobile', isRotated: false } } }
export const WithoutPhotos: Story = {
  args: { board: board.map(({ name, roles, tenure }) => ({ name, roles, tenure })) },
}
