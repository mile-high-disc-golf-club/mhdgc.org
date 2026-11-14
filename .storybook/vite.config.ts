import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// Storybook renders stories without starting the React Router or Cloudflare plugins.
export default defineConfig({
  plugins: [tailwindcss()],
  // Prebundle React's CommonJS entries before Storybook's preview imports them.
  optimizeDeps: { include: ['react', 'react-dom', 'react-dom/client', 'react/jsx-runtime'] },
  resolve: { tsconfigPaths: true },
})
