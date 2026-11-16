// Site-wide values shared by routes. Page copy and the board list live in content/ (see CONTENT.md).

export const siteName = 'Mile High Disc Golf Club'

// Canonical URLs, social cards and the sitemap use this host, whichever host serves the page.
export const siteUrl = 'https://www.mhdgc.org'

// The Cloudflare Web Analytics site token for www.mhdgc.org. It's public, since
// it's in every page. Setting it to '' turns analytics off. See Analytics in the README.
export const webAnalyticsToken = '6c61cde4505440d8824483d33777dad6'

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
