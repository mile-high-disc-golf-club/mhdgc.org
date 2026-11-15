import { content } from 'virtual:repo-content'

export function readPage(slug: string) {
  const page = content.pages[slug]
  if (!Object.hasOwn(content.pages, slug)) throw new Error(`Unknown content page: ${slug}`)
  return page
}

export function readBoard() {
  return content.board.map(({ photo, ...member }) => ({
    ...member,
    ...(photo ? { photo: content.images[photo] } : {}),
  }))
}

export function readImage(name: string) {
  const image = content.images[name]
  if (!Object.hasOwn(content.images, name)) throw new Error(`Unknown content image: ${name}`)
  return image
}
