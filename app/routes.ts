import { index, route, type RouteConfig } from '@react-router/dev/routes'

// Every path here without a parameter is prerendered (react-router.config.ts).
export default [
  index('routes/home.tsx'),
  route('events', 'routes/events.tsx'),
  route('membership', 'routes/membership.tsx'),
  route('about', 'routes/about.tsx'),
  // Anything else: rendered by the Worker with a 404 status.
  route('*', 'routes/not-found.tsx'),
] satisfies RouteConfig
