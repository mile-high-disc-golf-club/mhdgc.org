// Site-wide values shared by routes. Page copy and the board list live in content/ (see CONTENT.md).

export const siteName = 'Mile High Disc Golf Club'

// Canonical URLs, social cards and the sitemap use this host, whichever host serves the page.
export const siteUrl = 'https://www.mhdgc.org'

export function pageTitle(page?: string) {
  return page ? `${page} · ${siteName}` : siteName
}

export const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/events', label: 'Events' },
  { to: '/membership', label: 'Membership' },
  { to: '/about', label: 'About' },
] as const

// Linked straight to the sites, not through the Google Site's redirect wrapper.
export const socialLinks = [
  { href: 'https://www.facebook.com/groups/mhdgc/', label: 'Facebook', icon: 'facebook' },
  { href: 'https://www.instagram.com/mhdgc_co/', label: 'Instagram', icon: 'instagram' },
] as const
