import type { ReactNode } from 'react'

import type { ColorToken } from '../theme'

// The type scale. Classes are written out in full so Tailwind finds them.
const sizes = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
}

const weights = {
  regular: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
}

// The same text colors as Icon, so colors.test.ts covers their contrast.
// `current` takes the color of the text around it.
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

export type TextSize = keyof typeof sizes
export type TextWeight = keyof typeof weights
export type TextColor = keyof typeof colors
type TextElement = 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'label' | 'strong'

// `1` cuts to one line with an ellipsis; `2` clamps to two lines.
const lineLimits = { 1: 'truncate', 2: 'line-clamp-2' }

type PresetProps = {
  as?: TextElement
  color?: TextColor
  id?: string
  // Only used when `as` is `label`.
  htmlFor?: string
  // Same-width digits, so times and dates in a list line up.
  numeric?: boolean
  // Cut long text to this many lines. Give it a width from the parent.
  lines?: keyof typeof lineLimits
  children: ReactNode
}

type TextProps = PresetProps & { size?: TextSize; weight?: TextWeight }

// Headings use the display face, which is condensed and tall like the logo's lettering.
const display = 'font-display'

function render(
  {
    as: Element = 'p',
    size = 'md',
    weight = 'regular',
    color = 'current',
    id,
    htmlFor,
    numeric = false,
    lines,
    children,
  }: TextProps,
  layout = '',
) {
  return (
    <Element
      id={id}
      {...(Element === 'label' && { htmlFor })}
      className={[
        sizes[size],
        weights[weight],
        colors[color],
        numeric && 'tabular-nums',
        lines && lineLimits[lines],
        layout,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </Element>
  )
}

// Prefer a preset, such as `Text.Body`. The base takes any size and weight,
// for the odd case none fits. Like Icon it takes no `className`: lay it out
// from the parent with `gap`.
export function Text(props: TextProps) {
  return render(props)
}

// `??` rather than spreading defaults first, so a caller passing `undefined`
// gets the preset's default. Prose copies these classes for rendered Markdown,
// and prose.test.ts keeps them in step.
Text.H1 = function H1(props: PresetProps) {
  return render(
    { ...props, as: props.as ?? 'h1', color: props.color ?? 'ink', size: '3xl', weight: 'bold' },
    display,
  )
}

Text.H2 = function H2(props: PresetProps) {
  return render(
    {
      ...props,
      as: props.as ?? 'h2',
      color: props.color ?? 'ink',
      size: '2xl',
      weight: 'semibold',
    },
    display,
  )
}

Text.H3 = function H3(props: PresetProps) {
  return render(
    { ...props, as: props.as ?? 'h3', color: props.color ?? 'ink', size: 'xl', weight: 'semibold' },
    display,
  )
}

Text.Body = function Body(props: PresetProps) {
  return render({ ...props, size: 'md', weight: 'regular' })
}

Text.Small = function Small(props: PresetProps) {
  return render({ ...props, color: props.color ?? 'muted', size: 'sm', weight: 'regular' })
}

Text.Label = function Label(props: PresetProps) {
  return render({ ...props, as: props.as ?? 'span', size: 'sm', weight: 'medium' })
}

Text.Caption = function Caption(props: PresetProps) {
  return render({
    ...props,
    as: props.as ?? 'span',
    color: props.color ?? 'muted',
    size: 'xs',
    weight: 'regular',
  })
}

// A button's label. It lines up an icon beside the text, so Button can pass
// its children straight in.
Text.Button = function ButtonText(props: PresetProps) {
  return render(
    { ...props, as: props.as ?? 'span', size: 'md', weight: 'semibold' },
    'inline-flex items-center gap-2',
  )
}

// A text link's label. Every text link is `link` colored and medium weight, so
// it takes no `color`. It stays inline, so a link in a sentence wraps with the
// sentence.
Text.Link = function LinkText(props: Omit<PresetProps, 'color'>) {
  return render(
    { ...props, as: props.as ?? 'span', size: 'md', weight: 'medium', color: 'link' },
    'underline',
  )
}

// Classes for the link element around Text.Link. With `standalone`, a 44px tap
// target for a link on its own line, with room for an Icon beside the label.
export function textLinkClasses({ standalone = false }: { standalone?: boolean } = {}) {
  return standalone ? 'inline-flex min-h-11 items-center gap-2 self-start' : ''
}
