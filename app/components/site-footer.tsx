import { badgeUrl } from '~/brand'
import { Icon, iconButtonClasses, Text, textLinkClasses } from '~/design-system'
import { siteName, socialLinks } from '~/site'

/**
 * The badge, links to the club's social pages, the 501(c)(3) line, the copyright and a
 * link back to the top. `year` comes from the build, since reading the date while
 * rendering would differ between the prerendered HTML and the browser.
 */
export function SiteFooter({ year }: { year?: number }) {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 py-8 text-center">
        {/* The text below names the club, so the badge is decorative here. */}
        <img src={badgeUrl} alt="" width={80} height={80} className="size-20" />
        <ul aria-label="Social media" className="flex gap-2">
          {socialLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${link.label} opens in a new tab`}
                className={iconButtonClasses({ size: 'lg' })}
              >
                <Icon name={link.icon} size="xl" />
              </a>
            </li>
          ))}
        </ul>
        <Text.Small>Mile High Disc Golf Club is a registered 501(c)(3)</Text.Small>
        {year !== undefined && (
          <Text.Small>
            © {year} {siteName}
          </Text.Small>
        )}
        {/* A plain anchor: the browser scrolls to the top and moves focus there. */}
        <div>
          <a href="#top" className={textLinkClasses({ standalone: true })}>
            <Text.Link>Back to top</Text.Link>
          </a>
        </div>
      </div>
    </footer>
  )
}
