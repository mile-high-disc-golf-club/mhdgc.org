import type { Meta, StoryObj } from '@storybook/react-vite'

import { type ColorToken, palette, themes } from './colors'
import { luminance } from './contrast'

// Black or white, whichever reads better on the color.
const readableOn = (hex: string) => (luminance(hex) > 0.18 ? '#000000' : '#ffffff')

const family = (name: string) =>
  [name, `${name}-hover`, `on-${name}`, `${name}-soft`, `${name}-ink`] as ColorToken[]

const tokenGroups: [string, ColorToken[]][] = [
  ['Surfaces', ['canvas', 'surface', 'surface-hover', 'scrim']],
  ['Text', ['ink', 'ink-muted', 'link']],
  ['Lines', ['line', 'line-strong', 'focus']],
  ['Primary', family('primary')],
  ['Accent', family('accent')],
  ['Success', family('success')],
  ['Info', family('info')],
  ['Warning', family('warning')],
  ['Danger', family('danger')],
]

function Colors() {
  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Palette</h2>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] gap-4">
          {Object.entries(palette).map(([hue, scale]) => (
            <div key={hue}>
              <h3 className="mb-1 font-medium capitalize">{hue}</h3>
              <ul className="overflow-hidden rounded-lg">
                {Object.entries(scale).map(([step, color]) => (
                  <li
                    key={step}
                    className="flex justify-between px-2 py-2 font-mono text-xs"
                    style={{ backgroundColor: color, color: readableOn(color) }}
                  >
                    <span>{step}</span>
                    <span>{color}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-xl font-semibold">Semantic tokens</h2>
        {tokenGroups.map(([group, tokens]) => (
          <div key={group}>
            <h3 className="mb-1 font-medium">{group}</h3>
            <ul className="grid grid-cols-[repeat(auto-fill,minmax(13rem,1fr))] gap-3">
              {tokens.map((token) => {
                const color = themes.light[token]
                // A translucent color shows over white, so black reads best on it.
                const textColor = color.length > 7 ? '#000000' : readableOn(color)
                return (
                  <li key={token} className="overflow-hidden rounded-lg border border-line">
                    <div
                      className="px-2 py-3 font-mono text-xs"
                      style={{ backgroundColor: color, color: textColor }}
                    >
                      {color}
                    </div>
                    <p className="px-2 py-1.5 text-sm font-medium">{token}</p>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </section>
    </div>
  )
}

const meta = {
  title: 'Design system/Colors',
  component: Colors,
} satisfies Meta<typeof Colors>

export default meta
type Story = StoryObj<typeof meta>

export const Overview: Story = {}
