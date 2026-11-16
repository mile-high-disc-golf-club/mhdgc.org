import {
  type Icon as TablerIcon,
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandYoutube,
  IconCalendarEvent,
  IconCalendarEventFilled,
  IconCalendarMonth,
  IconCalendarMonthFilled,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconExternalLink,
  IconHeartHandshake,
  IconList,
  IconMapPin,
  IconMapPinFilled,
  IconMenu2,
  IconPlayerPlay,
  IconPlayerPlayFilled,
  IconSchool,
  IconTag,
  IconTagFilled,
  IconTags,
  IconTagsFilled,
  IconTrophy,
  IconTrophyFilled,
  IconUsersGroup,
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
  // Move to the previous or next page of something, such as a month.
  previous: { outline: IconChevronLeft },
  next: { outline: IconChevronRight },
  // The Events page's views: the upcoming list and the month grid.
  list: { outline: IconList },
  month: { outline: IconCalendarMonth, filled: IconCalendarMonthFilled },
  // The event calendars, chosen in content/calendars.json: a tag round, the
  // ladies' tag rounds, a tournament, a board meeting, a clinic and a
  // volunteer day.
  tag: { outline: IconTag, filled: IconTagFilled },
  tags: { outline: IconTags, filled: IconTagsFilled },
  trophy: { outline: IconTrophy, filled: IconTrophyFilled },
  'users-group': { outline: IconUsersGroup },
  school: { outline: IconSchool },
  'heart-handshake': { outline: IconHeartHandshake },
} satisfies Record<string, { outline: TablerIcon; filled?: TablerIcon }>

export type IconName = keyof typeof icons
