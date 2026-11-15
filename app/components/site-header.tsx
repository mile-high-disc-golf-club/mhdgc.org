import { useEffect, useId, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router'

import { badgeUrl } from '~/brand'
import { IconButton, Text } from '~/design-system'
import { navLinks } from '~/site'

/**
 * The badge and club name linking home, and the main nav. Below tablet width the nav
 * is a disclosure: a menu button shows the links in a panel under the header. From
 * tablet width up the links sit in a row and the button is hidden.
 */
export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const menuId = useId()
  const menuButton = useRef<HTMLButtonElement>(null)

  // Escape closes the open menu and puts focus back on its button.
  useEffect(() => {
    if (!open) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      setOpen(false)
      menuButton.current?.focus()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <header className="relative border-b border-line bg-surface">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-2">
        <Link to="/" className="flex min-h-11 items-center gap-3 rounded-lg">
          {/* The name beside it says what the link is, so the badge is decorative here. */}
          <img src={badgeUrl} alt="" width={48} height={48} className="size-12" />
          <span className="font-display">
            <Text as="span" size="xl" weight="semibold" color="ink">
              Mile High Disc Golf
            </Text>
          </span>
        </Link>
        <nav aria-label="Main">
          <div className="md:hidden">
            <IconButton
              ref={menuButton}
              icon={open ? 'close' : 'menu'}
              label="Menu"
              size="lg"
              aria-expanded={open}
              aria-controls={menuId}
              onClick={() => {
                setOpen(!open)
              }}
            />
          </div>
          {/* A panel under the header on phones, shown while the menu is open. A row in
              the header from tablet width up. */}
          <ul
            id={menuId}
            data-open={open || undefined}
            className="absolute inset-x-0 top-full z-10 hidden flex-col gap-1 border-b border-line bg-surface px-4 pt-2 pb-4 shadow-md data-open:flex md:static md:flex md:flex-row md:border-0 md:p-0 md:shadow-none"
          >
            {navLinks.map((link) => (
              <li key={link.to}>
                {/* Prerendering renders each page at its path with a trailing slash, such as
                    /events/, and `end` would leave it unmarked in the HTML. Only Home needs
                    `end`, or it would match every page. */}
                <NavLink
                  to={link.to}
                  end={link.to === '/'}
                  onClick={() => {
                    setOpen(false)
                  }}
                  className="flex min-h-11 items-center rounded-lg px-3 hover:bg-surface-hover aria-[current=page]:bg-primary-soft aria-[current=page]:text-primary-ink"
                >
                  <Text as="span" weight="medium">
                    {link.label}
                  </Text>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}
