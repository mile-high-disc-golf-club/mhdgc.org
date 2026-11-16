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
  // The event calendars' hues, apart from the families above, so a calendar
  // never reads as a status.
  green: {
    50: '#e3f3e1',
    700: '#2e7d32',
    800: '#1e5c22',
  },
  pink: {
    50: '#fbe4ef',
    700: '#ad1f6b',
    800: '#8a1656',
  },
  purple: {
    50: '#efe7fa',
    700: '#6b3fb0',
    800: '#55308f',
  },
  slate: {
    50: '#e6ecf1',
    700: '#4b5d6e',
    800: '#384856',
  },
  blue: {
    50: '#e1ebfa',
    700: '#1f5fbf',
    800: '#184c99',
  },
  brown: {
    50: '#f5ebe0',
    700: '#8a5a2b',
    800: '#6e4720',
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

  // One per event calendar, named for its slug and chosen in
  // content/calendars.json. Each has three
  // roles: the base is a solid fill, such as a calendar's chip when it's
  // shown, with `on-event` for text on it. `-soft` is a tint, such as an event
  // in the month grid, and `-ink` is text and icons in that color. Text and
  // an icon always name the calendar, so color is never the only cue.
  'on-event': palette.gray[0],
  'event-tags': palette.green[700],
  'event-tags-soft': palette.green[50],
  'event-tags-ink': palette.green[800],
  'event-ladies-tags': palette.pink[700],
  'event-ladies-tags-soft': palette.pink[50],
  'event-ladies-tags-ink': palette.pink[800],
  'event-tournaments': palette.purple[700],
  'event-tournaments-soft': palette.purple[50],
  'event-tournaments-ink': palette.purple[800],
  'event-board': palette.slate[700],
  'event-board-soft': palette.slate[50],
  'event-board-ink': palette.slate[800],
  'event-clinics': palette.blue[700],
  'event-clinics-soft': palette.blue[50],
  'event-clinics-ink': palette.blue[800],
  'event-volunteer': palette.brown[700],
  'event-volunteer-soft': palette.brown[50],
  'event-volunteer-ink': palette.brown[800],
}

export type ColorToken = keyof typeof light
// An event calendar's color: the name of its fill token, such as `event-tags`.
export type EventColor = Exclude<
  Extract<ColorToken, `event-${string}`>,
  `${string}-soft` | `${string}-ink`
>
// Any other theme must define every token `light` does.
export type Theme = Record<ColorToken, string>
export type ThemeName = keyof typeof themes

// The site is light only. A dark theme would go here, and plugin.ts and
// colors.test.ts would pick it up.
export const themes = { light } satisfies Record<string, Theme>

// Every event color, for checking content/calendars.json.
export const eventColors = Object.keys(light).filter(
  (token): token is EventColor =>
    token.startsWith('event-') && !token.endsWith('-soft') && !token.endsWith('-ink'),
)
