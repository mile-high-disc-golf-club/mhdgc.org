# mhdgc.org

The Mile High Disc Golf Club website: a React Router app on Cloudflare Workers, with every page prerendered to static HTML. It replaces the club's Google Site at https://www.mhdgc.org.

- [README.md](README.md): how a request is handled, layout, local development, deploying and the reasoning behind decisions.
- [GitHub issues](https://github.com/mile-high-disc-golf-club/mhdgc.org/issues): the work still to do, with a milestone for each phase. Undecided questions go in an issue labeled `decision`. Only record a choice once the owner has made it. If they're undecided, discuss it instead. Anything only the club's board can supply (photos, logos, policies, prices) is labeled `needs-board`.

## Rules that matter most

- **Start each new task on a branch from the latest `main`.** Unless otherwise specified, pull from `origin/main`, then create and check out a new task branch from `main` before starting work.
- **Never invent club facts.** Names, roles, dates, prices, links and policies come from the issue, the content files or the current Google Site, word for word. If something's missing, ask, or leave it out and say so.
- **Pages stay prerendered.** Page content comes from build-time loaders, so it's in the HTML. Only `/api/*` and the 404 page run the Worker. Live data, such as events, loads in the browser from `/api/*`.
- **Bun installs, Node 24 runs.** Bun is the package manager and script runner. Don't use `--bun` or Bun-only APIs.
- **Secrets stay in the Worker.** `VITE_*` variables are compiled into the browser bundle. After changing `wrangler.jsonc`, run `bun run cf-typegen` and commit `worker-configuration.d.ts`.

## Code style

Prettier and ESLint enforce most of this. Lefthook fixes and restages linted and formatted files before each commit.

- Named exports only, except where a tool needs a default (route modules, `root.tsx`, config files).
- In `app/`, use `./` in the same folder and `~/` to reach elsewhere in the app. Import `components/`, `lib/`, `.server/` and `design-system/` through their `index.ts`. Inside those folders, import the file directly to avoid cycles. List re-exports by name.
- Routes in `app/routes` keep the `loader`, `meta` and router hooks. Their markup goes in `app/pages`, which takes data as props, so stories can render it.
- Keep `app/design-system` independent of the router and other app modules. Pass data and behavior through props.
- Use design-system color tokens and the `Text` component for type size and weight. ESLint bans palette classes and `dark:` variants in the app and raw typography classes in pages and components.
- Put tests beside the code as `*.test.ts` for Node or `*.test.tsx` for jsdom. Render component stories with `composeStories`.
- Put `*.stories.tsx` beside components and pages, with one story per meaningful state. Run them with `bun run storybook`.

## Before finishing

Run these checks:

```bash
bun run format:check
bun run lint
bun run typecheck
bun run test
bun run build
```

Changes to pages or the Worker also need a check on `bun run preview`, which serves the production build in workerd, with the console open.

## Skills

Skills live in `.claude/skills`, and `.agents/skills` links to them for Codex.

- `design-system`: required for any UI work.
- `react-router`: routes, loaders, `meta`, prerendering and upgrades.
- `pr-new` and `pr-feedback`: opening PRs and handling review comments.
- `done`: cleaning up the branch, worktree and issue after a PR merges.
- `pipeline`, `review-and-ship` and `issue-implement`: the Codex build, Claude review and merge loop, one issue at a time.
