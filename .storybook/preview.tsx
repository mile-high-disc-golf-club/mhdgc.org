import './preview.css'

import type { Preview } from '@storybook/react-vite'

import { withRouter } from './router-decorator'

// The same page setup as root.tsx.
document.body.classList.add('bg-canvas', 'text-ink')

const preview: Preview = {
  decorators: [withRouter],
  parameters: {
    // Fail a story with accessibility violations, rather than only listing them.
    a11y: { test: 'error' },
    viewport: {
      options: {
        desktop: {
          name: 'Desktop',
          styles: { width: '1280px', height: '800px' },
          type: 'desktop',
        },
        // The narrowest phone the site is checked at.
        mobile: { name: 'Mobile', styles: { width: '375px', height: '812px' }, type: 'mobile' },
      },
    },
  },
  initialGlobals: { viewport: { value: 'desktop', isRotated: false } },
}

export default preview
