// Site-wide values shared by routes. Content moves to content files in #9.

export const siteName = 'Mile High Disc Golf Club'

export function pageTitle(page?: string) {
  return page ? `${page} · ${siteName}` : siteName
}

export const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/events', label: 'Events' },
  { to: '/membership', label: 'Membership' },
  { to: '/about', label: 'About' },
] as const
