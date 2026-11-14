import { describe, expect, it } from 'vitest'

import { type ColorToken, themes } from './colors'
import { contrast } from './contrast'

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
    ['ink-muted', `${name}-soft`, MUTED],
    ['link', `${name}-soft`, TEXT],
    [`${name}-ink`, `${name}-soft`, TEXT],
    ...backgrounds.map((bg): [ColorToken, ColorToken, number] => [`${name}-ink`, bg, TEXT]),
  ]),
  ...backgrounds.map((bg): [ColorToken, ColorToken, number] => ['link', bg, TEXT]),
  ['danger', 'surface', CONTROL],
]

describe.each(Object.keys(themes) as (keyof typeof themes)[])('%s theme contrast', (mode) => {
  it.each(pairs)('%s on %s is at least %d:1', (fg, bg, minimum) => {
    expect(contrast(themes[mode][fg], themes[mode][bg])).toBeGreaterThanOrEqual(minimum)
  })
})
