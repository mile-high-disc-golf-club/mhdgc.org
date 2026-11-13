---
name: issue-implement
description: Build one GitHub issue on its own branch, ready for review. Used by Codex when the review-and-ship skill hands it an issue, and by Claude only when review-and-ship takes over after Codex hits its usage limit.
argument-hint: '<issue number>'
---

Build the issue named in your prompt (`<N>` below) on its own branch. Nobody can answer questions while you work, so never stop to ask. When something needs the owner, stop and report it as described below.

## Steps

1. **Read the issue.** `gh issue view <N> --comments`. Read everything it lists under "Read first", the issues it says it depends on, and its milestone's other closed issues if you need context. The previous issue's run may have left notes for this one in the comments. If it depends on an issue that is still open, report `blocked`.
2. **Check it's buildable.** Report `blocked` if the issue depends on an open `decision` issue, would make you pick a product rule the issue leaves open, or needs something only the board can give (the issue's **Board asks**, or the `needs-board` label) and has no stand-in. Never invent club facts: names, roles, prices, dates, URLs or policies come from the issue, the repo's content files or the current Google Site (https://www.mhdgc.org), quoted exactly. Where the issue says what to use until the board answers (such as images exported from the Google Site), use that and list it under "Not done". If you can only build part of it, build that part and list what's left.
3. **Branch from the latest `main`.** `git fetch origin main`, then `git checkout -b codex/issue-<N>-<short-slug> origin/main`. If the branch already exists, check it out and carry on from where it left off.
4. **Build it.** Follow `AGENTS.md` and the README, and load the skills it names for the kind of work (`design-system` for UI, `react-router` for routes, loaders, `meta` and prerendering). Add tests and stories as `AGENTS.md` describes. Keep every page prerendered: page content comes from build-time loaders, and only `/api/*` and the 404 run the Worker. After changing `wrangler.jsonc`, run `bun run cf-typegen` and commit `worker-configuration.d.ts`.
5. **Check it.** Run `bun run format`, which fixes formatting so the reviewer's `format:check` passes, then `bun run lint`, `bun run typecheck`, `bun run test` and `bun run build`. Skip any script `package.json` doesn't have yet. Fix what fails. If a check can't run in your sandbox (no network, for example), say which one and why.
6. **Commit.** One or more commits, imperative messages. Don't push: the reviewer pushes after their review. If the sandbox won't let you commit, leave the changes uncommitted and say so.

## Report

End with a final message in this shape, which the reviewer reads before the diff:

```
STATUS: ready | partial | blocked
BRANCH: codex/issue-<N>-<slug>

## Done
- what you built, by area

## Not done
- anything from the issue you didn't build, and why

## Assumptions
- each choice the issue didn't spell out, and what you picked

## Checks
- format / lint / typecheck / test / build: passed, failed (with the error) or not run (with the reason)
```

For `blocked`, give the exact question or missing value under "Not done", quoting the issue.
