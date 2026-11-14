import type { ColorToken } from '../theme'
import { type IconName, icons } from './icons'

const sizes = { sm: 16, md: 20, lg: 24, xl: 28 }

// Text colors from the theme, so colors.test.ts covers their contrast.
// `current` takes the color of the text around it. Classes are written out in
// full so Tailwind finds them; the type catches a token that doesn't exist.
const colors = {
  current: 'text-current',
  ink: 'text-ink',
  muted: 'text-ink-muted',
  primary: 'text-primary-ink',
  link: 'text-link',
  accent: 'text-accent-ink',
  success: 'text-success-ink',
  info: 'text-info-ink',
  warning: 'text-warning-ink',
  danger: 'text-danger-ink',
} satisfies Record<string, `text-${ColorToken | 'current'}`>

export type IconSize = keyof typeof sizes
export type IconColor = keyof typeof colors

export function Icon({
  name,
  filled = false,
  size = 'md',
  color = 'current',
  label,
}: {
  name: IconName
  // Falls back to the outline for icons with no filled version.
  filled?: boolean
  size?: IconSize
  color?: IconColor
  // Only for an icon that means something on its own. Leave it out when text
  // beside the icon, or the button around it, already says what it is.
  label?: string
}) {
  const icon = icons[name]
  const Svg = (filled && 'filled' in icon && icon.filled) || icon.outline
  return (
    <Svg
      size={sizes[size]}
      stroke={2}
      className={`shrink-0 ${colors[color]}`}
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
    />
  )
}
