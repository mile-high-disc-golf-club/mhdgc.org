import { cloudflare } from '@cloudflare/vite-plugin'
import { reactRouter } from '@react-router/dev/vite'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, type Plugin } from 'vite'

// Chrome requests this whenever DevTools is open. Answering here keeps React
// Router from logging "No route matches" for it on every page load.
const quietChromeDevtoolsProbe: Plugin = {
  name: 'quiet-chrome-devtools-probe',
  apply: 'serve',
  configureServer(server) {
    server.middlewares.use('/.well-known/appspecific/com.chrome.devtools.json', (_req, res) => {
      res.statusCode = 404
      res.end()
    })
  },
}

// The Cloudflare plugin runs the Worker in workerd (the real Workers runtime)
// during `vite dev` and `vite preview`, as React Router's server environment.
export default defineConfig({
  plugins: [
    quietChromeDevtoolsProbe,
    cloudflare({ viteEnvironment: { name: 'ssr' } }),
    tailwindcss(),
    reactRouter(),
  ],
  resolve: {
    tsconfigPaths: true,
  },
})
