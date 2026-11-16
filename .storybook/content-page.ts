import { marked } from 'marked'

import type { ContentPage } from '../app/content'

/**
 * For stories only: a content page from its Markdown source, imported with `?raw`.
 * The build reads pages with gray-matter, which needs Node's `Buffer`, so it can't run
 * in Storybook's browser. Page front matter is plain `key: value` lines, which this
 * reads; content.config.ts still checks every page when the site builds.
 */
export function contentPage(source: string): ContentPage {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(source)
  if (!match) throw new Error('Content page has no front matter')
  const fields = new Map(
    match[1]
      .split(/\r?\n/)
      .map((line) => /^(\w+):\s*(.*)$/.exec(line))
      .filter((field) => field !== null)
      .map(([, key = '', value = '']) => [key, value.trim()]),
  )
  return {
    title: fields.get('title') ?? '',
    description: fields.get('description') ?? '',
    html: marked.parse(source.slice(match[0].length), { async: false }),
  }
}
