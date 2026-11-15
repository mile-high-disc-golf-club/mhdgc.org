import { TextLink } from '~/components'
import { Text } from '~/design-system'
import { navLinks } from '~/site'

export function NotFoundPage() {
  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <Text.H1>Page not found</Text.H1>
      <Text.Body>We couldn’t find that page. Try one of the main pages below.</Text.Body>
      <ul aria-label="Main pages">
        {navLinks.map(({ to, label }) => (
          <li key={to}>
            <TextLink to={to} standalone>
              {label}
            </TextLink>
          </li>
        ))}
      </ul>
      <Text.Body>
        Still can’t find what you need? <TextLink to="/about#contact-us">Contact us</TextLink>.
      </Text.Body>
    </div>
  )
}
