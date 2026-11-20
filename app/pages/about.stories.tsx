import type { Meta, StoryObj } from '@storybook/react-vite'

import boardJson from '~/../content/board.json'
import type { BoardMember } from '~/content'

import { AboutPage } from './about'

// The raw file, as the CMS writes it: it leaves out an empty roles list, which
// content.config.ts reads as no roles.
const board = (boardJson as (Omit<BoardMember, 'roles'> & { roles?: string[] })[]).map(
  ({ roles = [], ...member }) => ({ ...member, roles }),
)

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
            // The board photos are square, so one square size stands in for each.
            // Real sizes and AVIF/WebP sources come from the build's image pipeline.
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
