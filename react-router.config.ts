import type { Config } from '@react-router/dev/config'
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

import { siteUrl } from './app/site'
import { buildStaticHeaders } from './security-headers.config'

const config: Config = {
  // The Worker can render pages, but every page is prerendered to static HTML at
  // build time (`prerender: true` covers every path in routes.ts without a
  // parameter), so page views are served as static assets. The Worker only
  // renders what isn't a file: the 404 page, and any future dynamic route.
  ssr: true,
  prerender: true,
  // The 404 page isn't prerendered, and /home is a redirect.
  async buildEnd({ reactRouterConfig }) {
    const client = join(reactRouterConfig.buildDirectory, 'client')
    const files = await readdir(client, { recursive: true })
    const pages = files
      .filter((file) => file === 'index.html' || file.endsWith('/index.html'))
      // The CMS editor isn't a page: it gets its own headers and no sitemap entry.
      .filter((file) => !file.startsWith('admin/'))
      .map((file) => ({
        file,
        path: file === 'index.html' ? '/' : '/' + file.slice(0, -'/index.html'.length),
      }))
      .sort((a, b) => a.path.localeCompare(b.path))
    await writeFile(
      join(client, 'sitemap.xml'),
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map(({ path }) => `  <url><loc>${siteUrl}${path}</loc></url>`).join('\n')}\n</urlset>\n`,
    )

    const headersFile = join(client, '_headers')
    const [staticRules, documents] = await Promise.all([
      readFile(headersFile, 'utf8'),
      Promise.all(
        pages.map(async ({ file, path }) => ({
          path,
          html: await readFile(join(client, file), 'utf8'),
        })),
      ),
    ])
    await writeFile(headersFile, buildStaticHeaders(staticRules, documents))
  },
  // Put the whole route manifest in the page instead of fetching /__manifest on
  // navigation, so moving between pages never runs the Worker. Fine while the
  // site has a handful of routes.
  routeDiscovery: { mode: 'initial' },
}

export default config
