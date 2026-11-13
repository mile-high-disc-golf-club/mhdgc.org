import { defineConfig } from 'vite'

// Storybook renders stories without starting the React Router or Cloudflare plugins.
export default defineConfig({
  resolve: { tsconfigPaths: true },
})
