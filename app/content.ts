/** Serializable build output; no rendering or image-processing dependencies. */
export interface ContentImage {
  src: string
  width: number
  height: number
  sources: { type: 'image/avif' | 'image/webp'; srcSet: string }[]
}

export interface ContentPage {
  title: string
  description: string
  ogImage?: ContentImage
  html: string
}

export interface BoardMember {
  name: string
  role: string
  photo?: string
}

export interface ContentData {
  pages: Record<string, ContentPage>
  board: BoardMember[]
  images: Record<string, ContentImage>
}
