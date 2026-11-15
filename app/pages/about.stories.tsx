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
// Sample copy, to show how Markdown from content/pages renders.
export const WithCopy: Story = {
  args: {
    html: '<h2>Section heading</h2>\n<p>A paragraph with <strong>bold</strong> text and <a href="/events">a link</a>.</p>\n<ul>\n<li>A list item</li>\n</ul>\n',
  },
}
