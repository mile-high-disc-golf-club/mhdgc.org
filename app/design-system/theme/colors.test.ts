import { describe, expect, it } from 'vitest'

import { type ColorToken, themes } from './colors'

function luminance(hex: string): number {
  const [r = 0, g = 0, b = 0] = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number]
  return (hi + 0.05) / (lo + 0.05)
}

// Higher than AA for the main text, because people read this on phones outdoors.
const BODY = 7
const MUTED = 5.5
const TEXT = 4.5
const CONTROL = 3

const backgrounds = ['canvas', 'surface', 'surface-hover'] as const
const families = ['primary', 'accent', 'success', 'info', 'warning', 'danger'] as const

const pairs: [ColorToken, ColorToken, number][] = [
  ...backgrounds.flatMap((bg): [ColorToken, ColorToken, number][] => [
    ['ink', bg, BODY],
    ['ink-muted', bg, MUTED],
    ['line-strong', bg, CONTROL],
    ['focus', bg, CONTROL],
  ]),
  ...families.flatMap((name): [ColorToken, ColorToken, number][] => [
    [`on-${name}`, name, TEXT],
    [`on-${name}`, `${name}-hover`, TEXT],
    ['ink', `${name}-soft`, BODY],
    [`${name}-ink`, `${name}-soft`, TEXT],
    ...backgrounds.map((bg): [ColorToken, ColorToken, number] => [`${name}-ink`, bg, TEXT]),
  ]),
  ...backgrounds.map((bg): [ColorToken, ColorToken, number] => ['link', bg, TEXT]),
  ['link', 'primary-soft', CONTROL],
  ['danger', 'surface', CONTROL],
]

describe.each(Object.keys(themes) as (keyof typeof themes)[])('%s theme contrast', (mode) => {
  it.each(pairs)('%s on %s is at least %d:1', (fg, bg, minimum) => {
    expect(contrast(themes[mode][fg], themes[mode][bg])).toBeGreaterThanOrEqual(minimum)
  })
})
