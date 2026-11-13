import type { Config } from '@react-router/dev/config'

export default {
  // The Worker can render pages, but every page is prerendered to static HTML at
  // build time (`prerender: true` covers every path in routes.ts without a
  // parameter), so page views are served as static assets. The Worker only
  // renders what isn't a file: the 404 page, and any future dynamic route.
  ssr: true,
  prerender: true,
  // Put the whole route manifest in the page instead of fetching /__manifest on
  // navigation, so moving between pages never runs the Worker. Fine while the
  // site has a handful of routes.
  routeDiscovery: { mode: 'initial' },
} satisfies Config
