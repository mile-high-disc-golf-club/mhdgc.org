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
  roles: string[]
  tenure: string[]
  photo?: string
}

/** A public Google Calendar, from `content/calendars.json`. */
export interface CalendarConfig {
  /** The full Google Calendar ID, ending `@group.calendar.google.com`. */
  id: string
  name: string
  /** Used in `?cal=` and as `calendar` in `/api/events`. */
  slug: string
  /** An icon name. #19 narrows it to the icons in the design system. */
  icon: string
  /** An `event-*` color token. #19 narrows it to the tokens in colors.ts. */
  color: string
}

export interface ContentData {
  pages: Record<string, ContentPage>
  board: BoardMember[]
  calendars: CalendarConfig[]
  images: Record<string, ContentImage>
}
