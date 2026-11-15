import type { Meta, StoryObj } from '@storybook/react-vite'
import matter from 'gray-matter'
import { marked } from 'marked'

import tags from '~/../content/images/membership/bag-tags.jpg'
import membership from '~/../content/pages/membership.md?raw'
import join from '~/../content/pages/membership-join.md?raw'
import matches from '~/../content/pages/membership-matches.md?raw'
import type { ContentPage } from '~/content'

import { MembershipPage } from './membership'

function page(source: string): ContentPage {
  const { data, content } = matter(source)
  return {
    title: String(data.title),
    description: String(data.description),
    html: marked.parse(content, { async: false }),
  }
}

const meta = {
  title: 'Pages/Membership',
  component: MembershipPage,
  args: {
    membership: page(membership),
    join: page(join),
    matches: page(matches),
    tags: { src: tags, width: 1152, height: 1152, sources: [] },
  },
} satisfies Meta<typeof MembershipPage>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const Phone: Story = { globals: { viewport: { value: 'mobile', isRotated: false } } }
