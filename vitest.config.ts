import { defineConfig } from 'vitest/config'

// Load the app's aliases without starting the React Router or Cloudflare plugins.
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    projects: [
      {
        extends: true,
        test: { name: 'server', include: ['{app,worker,shared}/**/*.test.ts'] },
      },
      {
        extends: true,
        test: {
          name: 'dom',
          include: ['app/**/*.test.tsx'],
          environment: 'jsdom',
          setupFiles: ['.storybook/vitest.setup.ts'],
        },
      },
    ],
  },
})
