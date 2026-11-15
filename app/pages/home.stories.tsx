import type { Meta, StoryObj } from '@storybook/react-vite'
import matter from 'gray-matter'
import { marked } from 'marked'

import course from '~/../content/images/home/course.jpg'
import classic from '~/../content/images/videos/bypfs7tfhni.jpg'
import challenge from '~/../content/images/videos/f2dkiwxatsy.jpg'
import welcome from '~/../content/pages/home.md?raw'
import activities from '~/../content/pages/home-activities.md?raw'
import involved from '~/../content/pages/home-involved.md?raw'
import type { ContentPage } from '~/content'

import { HomePage } from './home'

function page(source: string): ContentPage {
  const { data, content } = matter(source)
  return {
    title: String(data.title),
    description: String(data.description),
    html: marked.parse(content, { async: false }),
  }
}

const meta = {
  title: 'Pages/Home',
  component: HomePage,
  args: {
    welcome: page(welcome),
    activities: page(activities),
    involved: page(involved),
    course: { src: course, width: 1280, height: 891, sources: [] },
    classic: { src: classic, width: 1280, height: 720, sources: [] },
    challenge: { src: challenge, width: 1280, height: 720, sources: [] },
  },
} satisfies Meta<typeof HomePage>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const Phone: Story = { globals: { viewport: { value: 'mobile', isRotated: false } } }
