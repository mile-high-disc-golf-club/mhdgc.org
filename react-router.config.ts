import type { Config } from '@react-router/dev/config'
import { createHash } from 'node:crypto'
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { type DefaultTreeAdapterTypes, parse } from 'parse5'

import { siteUrl } from './app/site'
import { documentPolicy, securityHeaders } from './shared/security-headers'

function* inlineScriptHashes(node: DefaultTreeAdapterTypes.Node): Generator<string> {
  if (
    'tagName' in node &&
    node.tagName === 'script' &&
    !node.attrs.some(({ name }) => name === 'src')
  ) {
    const script = node.childNodes.map((child) => ('value' in child ? child.value : '')).join('')
    yield `'sha256-${createHash('sha256').update(script).digest('base64')}'`
  }
  if ('childNodes' in node) {
    for (const child of node.childNodes) yield* inlineScriptHashes(child)
  }
}

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
      .map((file) => ({
        file,
        path: file === 'index.html' ? '/' : '/' + file.slice(0, -'/index.html'.length),
      }))
      .sort((a, b) => a.path.localeCompare(b.path))
    await writeFile(
      join(client, 'sitemap.xml'),
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map(({ path }) => `  <url><loc>${siteUrl}${path}</loc></url>`).join('\n')}\n</urlset>\n`,
    )

    // Hash the text the HTML parser will hand to the browser, including the
    // route-specific hydration scripts. The hashes change with the build.
    const documentRules = await Promise.all(
      pages.map(async ({ file, path }) => {
        const html = await readFile(join(client, file), 'utf8')
        const hashes = [...new Set(inlineScriptHashes(parse(html, { scriptingEnabled: true })))]
        return `${path}\n  Cache-Control: public, max-age=300\n  Content-Security-Policy: ${documentPolicy(hashes)}`
      }),
    )
    const commonRule = [
      '/*',
      ...Object.entries(securityHeaders).map(([name, value]) => `  ${name}: ${value}`),
    ].join('\n')
    const staticRules = await readFile(join(client, '_headers'), 'utf8')
    await writeFile(
      join(client, '_headers'),
      `${staticRules.trimEnd()}\n\n${[commonRule, ...documentRules].join('\n\n')}\n`,
    )
  },
  // Put the whole route manifest in the page instead of fetching /__manifest on
  // navigation, so moving between pages never runs the Worker. Fine while the
  // site has a handful of routes.
  routeDiscovery: { mode: 'initial' },
}

export default config
