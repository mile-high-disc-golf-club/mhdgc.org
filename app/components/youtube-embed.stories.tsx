import type { Meta, StoryObj } from '@storybook/react-vite'

import classicThumbnail from '~/../content/images/videos/bypfs7tfhni.jpg'
import challengeThumbnail from '~/../content/images/videos/f2dkiwxatsy.jpg'

import { YouTubeEmbed } from './youtube-embed'

const meta = {
  title: 'Components/YouTubeEmbed',
  component: YouTubeEmbed,
  args: {
    id: 'BYpfS7tfhNI',
    title: 'The 2015 Peak One Mile High Classic Round 2 part 1',
    caption: 'Mile High Classic',
    thumbnail: { src: classicThumbnail, width: 1280, height: 720, sources: [] },
  },
} satisfies Meta<typeof YouTubeEmbed>

export default meta
type Story = StoryObj<typeof meta>
export const MileHighClassic: Story = {}
export const HighPlainsChallenge: Story = {
  args: {
    id: 'F2DkIwXATsY',
    title: '2015 High Plains Challenge round 3 part 1',
    caption: 'High Plains Challenge',
    thumbnail: { src: challengeThumbnail, width: 1280, height: 720, sources: [] },
  },
}
export const Playing: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: `Play: ${meta.args.title}` }))
  },
}
