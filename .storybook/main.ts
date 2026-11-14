import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  stories: ['../app/**/*.stories.tsx'],
  addons: ['@storybook/addon-a11y', 'storybook-addon-pseudo-states'],
  framework: {
    name: '@storybook/react-vite',
    options: { builder: { viteConfigPath: '.storybook/vite.config.ts' } },
  },
  core: { disableTelemetry: true },
  // The site is light only, and stories show it on the page's real background.
  features: { backgrounds: false },
}

export default config
