import type { Meta, StoryObj } from '@storybook/react-vite'

import { Prose } from './prose'

// Markdown as a build-time renderer turns it into HTML.
const html = `
<p>The club runs weekly leagues and a few tournaments each year. <strong>Everyone is welcome</strong>, whatever your skill level.</p>
<h2>Leagues</h2>
<p>Each league has its own format. See the <a href="/events">events calendar</a> for times.</p>
<ul>
  <li>Doubles, with random partners</li>
  <li>Singles, by division
    <ul><li>Nested item</li></ul>
  </li>
</ul>
<h3>What to bring</h3>
<ol>
  <li>A few discs</li>
  <li>Water</li>
</ol>
<blockquote><p>A quote set apart from the text.</p></blockquote>
<hr />
<p>A closing paragraph.</p>
`

const meta = {
  title: 'Design system/Prose',
  component: Prose,
} satisfies Meta<typeof Prose>

export default meta
type Story = StoryObj<typeof meta>

export const FromHtml: Story = { args: { html } }

export const FromChildren: Story = {
  args: {
    children: (
      <>
        <h2>Leagues</h2>
        <p>
          See the <a href="/events">events calendar</a> for times.
        </p>
      </>
    ),
  },
}
