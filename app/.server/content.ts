import { content } from 'virtual:repo-content'

export function readPage(slug: string) {
  if (!Object.hasOwn(content.pages, slug)) throw new Error(`Unknown content page: ${slug}`)
  return content.pages[slug]
}

export function readBoard() {
  return content.board.map(({ photo, ...member }) => ({
    ...member,
    ...(photo ? { photo: content.images[photo] } : {}),
  }))
}

export function readImage(name: string) {
  if (!Object.hasOwn(content.images, name)) throw new Error(`Unknown content image: ${name}`)
  return content.images[name]
}

/** The club's public calendars, in display order. */
export function readCalendars() {
  return content.calendars
}
