import plugin from 'tailwindcss/plugin'

import { themes } from './colors'

const variables = Object.fromEntries(
  Object.entries(themes.light).map(([name, value]) => [`--c-${name}`, value]),
)

export default plugin(
  (api) => {
    api.addBase({
      // Light only, so the browser keeps form controls and scrollbars light too.
      ':root': { colorScheme: 'light', ...variables },
      // Tailwind 4 leaves buttons with the default arrow. Anything clickable
      // gets a pointer, including Base UI parts by their roles, and drops it
      // when disabled. `:where` adds no specificity, so classes still win.
      ':where(button, select, summary, input:is([type=checkbox], [type=radio]), label:has(input:is([type=checkbox], [type=radio])), [role=button], [role=tab], [role=option], [role^=menuitem])':
        { cursor: 'pointer' },
      ':where(:disabled, [aria-disabled=true], [data-disabled], label:has(input:disabled))': {
        cursor: 'default',
      },
      ':focus-visible': {
        outline: '2px solid var(--c-focus)',
        outlineOffset: '2px',
      },
    })
  },
  {
    theme: {
      extend: {
        colors: Object.fromEntries(
          Object.keys(themes.light).map((name) => [name, `var(--c-${name})`]),
        ),
      },
    },
  },
)
