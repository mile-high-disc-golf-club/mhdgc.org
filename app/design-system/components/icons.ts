import {
  type Icon as TablerIcon,
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandYoutube,
  IconCalendarEvent,
  IconCalendarEventFilled,
  IconChevronDown,
  IconExternalLink,
  IconMapPin,
  IconMapPinFilled,
  IconMenu2,
  IconPlayerPlay,
  IconPlayerPlayFilled,
  IconX,
} from '@tabler/icons-react'

// The only file that imports the icon library. Names describe what the icon
// means on the site, not what it draws, so the library can change underneath.
// Every icon here ships with any page that uses Icon, so add only what's used.
// `filled` is the version for an active or emphasized state.
export const icons = {
  facebook: { outline: IconBrandFacebook },
  instagram: { outline: IconBrandInstagram },
  youtube: { outline: IconBrandYoutube },
  calendar: { outline: IconCalendarEvent, filled: IconCalendarEventFilled },
  location: { outline: IconMapPin, filled: IconMapPinFilled },
  // Beside a link that leaves the site in a new tab.
  'external-link': { outline: IconExternalLink },
  menu: { outline: IconMenu2 },
  close: { outline: IconX },
  // Over a video's thumbnail, before the player loads.
  play: { outline: IconPlayerPlay, filled: IconPlayerPlayFilled },
  // Opens a disclosure, such as a `<details>` summary or a nav submenu.
  chevron: { outline: IconChevronDown },
} satisfies Record<string, { outline: TablerIcon; filled?: TablerIcon }>

export type IconName = keyof typeof icons
