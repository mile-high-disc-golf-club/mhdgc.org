import type { ReactNode } from 'react'

// Rendered Markdown can't use Text, so each element gets the classes of the Text
// preset it stands for, under a descendant variant. They're written out in full so
// Tailwind finds them, and prose.test.tsx checks they match the presets.
// Markdown headings start at h2: the page's own title is its h1.
export const proseElements = {
  // Text.Body, for paragraphs and list items.
  body: 'text-base font-normal text-ink',
  // Text.H2 and Text.H3, with room above to start a section.
  h2: '[&_h2]:mt-4 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-ink',
  h3: '[&_h3]:mt-2 [&_h3]:font-display [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-ink',
  // Text.Link.
  a: '[&_a]:text-base [&_a]:font-medium [&_a]:text-link [&_a]:underline',
  strong: '[&_strong]:font-semibold',
  lists: '[&_li]:mt-1 [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6',
  blockquote:
    '[&_blockquote]:border-l-4 [&_blockquote]:border-line [&_blockquote]:pl-4 [&_blockquote]:text-ink-muted',
  hr: '[&_hr]:border-line',
  img: '[&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-lg',
}

const className = `flex flex-col gap-4 ${Object.values(proseElements).join(' ')}`

/**
 * Styles rendered Markdown with the design system's type scale, so a content page
 * matches the rest of the site. Pass the HTML that a loader rendered at build time
 * from the repo's content files, or elements as `children`.
 */
export function Prose(props: { html: string } | { children: ReactNode }) {
  if ('html' in props)
    // The HTML comes from Markdown in this repo, rendered at build time, never
    // from visitors, so it's as trusted as the code.
    return <div className={className} dangerouslySetInnerHTML={{ __html: props.html }} />
  return <div className={className}>{props.children}</div>
}
