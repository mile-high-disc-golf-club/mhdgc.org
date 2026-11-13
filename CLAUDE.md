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

Tooling arrives in #2, which expands this section to match dgtags. Until then:

- Named exports only, except where a tool needs a default (route modules, `root.tsx`, config files).
- In `app/`: `./` for the same folder, `~/` for anything further.
- Routes in `app/routes` keep the `loader`, `meta` and router hooks. Their markup goes in `app/pages`, which takes data as props, so stories can render it.
- Tests sit beside the code as `*.test.ts`, or `*.test.tsx` for components.

## Before finishing

Run each of these that `package.json` has:

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
