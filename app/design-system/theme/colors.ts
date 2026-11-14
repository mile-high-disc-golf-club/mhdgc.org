// The only place colors are defined. Tailwind gets them through ./plugin, so
// `surface` here is `bg-surface`, `text-surface` and so on in class names.
// colors.test.ts checks every pairing in every theme.

// The raw values, one scale per hue: lower numbers are lighter. Components
// never use these directly; they go through a role below.
export const palette = {
  // Plain, with no brand tint, so color only shows where it means something.
  gray: {
    0: '#ffffff',
    50: '#f5f5f5',
    100: '#ebebeb',
    200: '#e0e0e0',
    500: '#767676',
    600: '#525252',
    900: '#1c1c1c',
  },
  // Built around the logo's navy (900), at the same hue.
  navy: {
    50: '#e5e5f5',
    700: '#2d2ba1',
    800: '#32317d',
    900: '#24235a',
  },
  gold: {
    50: '#fdf4d6',
    500: '#f0b429',
    600: '#dda015',
    800: '#7a5600',
    950: '#2a1e00',
  },
  teal: {
    50: '#dcf3ef',
    700: '#00796b',
    800: '#005f55',
  },
  sky: {
    50: '#dff2fa',
    700: '#0b6e99',
    800: '#085678',
  },
  orange: {
    50: '#ffedd9',
    500: '#fb8500',
    600: '#e67700',
    800: '#8f4700',
    950: '#2a1500',
  },
  red: {
    50: '#fbe7e5',
    700: '#b3261e',
    800: '#8f1e18',
  },
}

const light = {
  // The page behind everything.
  canvas: palette.gray[50],
  // Cards, fields, menus and dialogs.
  surface: palette.gray[0],
  // Hovered rows, menu items and ghost buttons.
  'surface-hover': palette.gray[100],
  // Dims the page behind a sheet or dialog, or a photo behind text.
  scrim: '#00000066',

  // Text and icons.
  ink: palette.gray[900],
  'ink-muted': palette.gray[600],

  // Decorative lines, such as around a card.
  line: palette.gray[200],
  // Lines people need to see to find a control.
  'line-strong': palette.gray[500],
  focus: palette.navy[900],
  // Brighter than `primary`, which is too close to `ink` to read as a link.
  link: palette.navy[700],

  // Each family below has the same five roles. The base is a solid fill, with
  // `on-` for text on it. `-soft` is a tint, such as a notice's background.
  // `-ink` is text in that color, readable on the tint and on any surface.

  // Main actions and selection, in the logo's navy. Hover goes lighter, since
  // anything darker is hard to tell apart from it.
  primary: palette.navy[900],
  'primary-hover': palette.navy[800],
  'on-primary': palette.gray[0],
  'primary-soft': palette.navy[50],
  'primary-ink': palette.navy[700],

  // Highlights. Never the main action.
  accent: palette.gold[500],
  'accent-hover': palette.gold[600],
  'on-accent': palette.gold[950],
  'accent-soft': palette.gold[50],
  'accent-ink': palette.gold[800],

  // Teal, not a true green, so it stands apart from `danger` under red-green
  // color blindness.
  success: palette.teal[700],
  'success-hover': palette.teal[800],
  'on-success': palette.gray[0],
  'success-soft': palette.teal[50],
  'success-ink': palette.teal[800],

  info: palette.sky[700],
  'info-hover': palette.sky[800],
  'on-info': palette.gray[0],
  'info-soft': palette.sky[50],
  'info-ink': palette.sky[800],

  // Orange, so a warning doesn't look like the gold accent.
  warning: palette.orange[500],
  'warning-hover': palette.orange[600],
  'on-warning': palette.orange[950],
  'warning-soft': palette.orange[50],
  'warning-ink': palette.orange[800],

  // Destructive actions and error messages.
  danger: palette.red[700],
  'danger-hover': palette.red[800],
  'on-danger': palette.gray[0],
  'danger-soft': palette.red[50],
  'danger-ink': palette.red[800],
}

export type ColorToken = keyof typeof light
// Any other theme must define every token `light` does.
export type Theme = Record<ColorToken, string>
export type ThemeName = keyof typeof themes

// The site is light only. A dark theme would go here, and plugin.ts and
// colors.test.ts would pick it up.
export const themes = { light } satisfies Record<string, Theme>
