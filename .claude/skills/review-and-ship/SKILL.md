---
name: review-and-ship
description: Take one issue from a Codex build to a merged PR - run Codex, review and fix its branch, open the PR, handle the @claude review and merge. Used by Claude in the session the pipeline skill starts for each issue, or on its own for one issue.
argument-hint: '<issue number>'
---

Take issue `$ARGUMENTS` to a merged PR. Start at the first section that isn't done yet:

| What GitHub shows                        | Start at                                  |
| ---------------------------------------- | ----------------------------------------- |
| A merged PR for it, but the issue's open | Close the issue, then the last steps of 4 |
| An open PR for the issue                 | 3. Handle the review                      |
| Only PRs closed without merging          | Stop and ask                              |
| A `codex/issue-<N>-*` branch, but no PR  | 1. Review (with no report)                |
| Nothing                                  | 0. Build with Codex                       |

Find the branch with `git ls-remote --heads origin 'codex/issue-<N>-*'` and `git branch --list 'codex/issue-<N>-*'`. Find the PR with `gh issue view <N> --json closedByPullRequestsReferences`, which lists PRs that say `Closes #<N>`, or else with `gh pr list --state all --head <branch>`.

Before starting Codex, the checkout must be clean: if it isn't, stop and ask. When resuming an issue's branch, uncommitted changes are Codex's unfinished work: review them with the rest.

**Usage limits.** The owner never wants extra usage or credits spent automatically. Before each numbered section, and before each review round, read the plan usage with the app's usage tool. Stop with `WAITING` if extra usage's `spent` is above the baseline in your brief (or above what it was when you started, without one), or the 5-hour limit is at 90% or more. Say which limit it was and when it resets. GitHub holds the state, so the next run picks up where you stopped. Before stopping, commit any work in progress to the issue's branch and push it.

In a new worktree, set it up first: copy `.dev.vars` from the main checkout (`$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/.dev.vars`) if it's missing, or else copy `.dev.vars.example` to `.dev.vars`. Then run `bun install`.

Read the issue's comments before starting: the previous issue's run leaves notes there for this one.

## 0. Build with Codex

Run Codex in this checkout, in the background, with its report going to your scratchpad. Don't edit files while it runs. The scratchpad can hold reports from earlier runs, so delete any old `codex-issue-<N>.md` first, and wait for the Codex process to exit rather than for the report file to appear.

```bash
codex exec -s workspace-write -c sandbox_workspace_write.network_access=true \
  -c "sandbox_workspace_write.writable_roots=[\"$(git rev-parse --path-format=absolute --git-common-dir)\",\"$(git rev-parse --absolute-git-dir)\"]" \
  -o <scratchpad>/codex-issue-<N>.md \
  "Use the issue-implement skill to build issue #<N>." \
  2> <scratchpad>/codex-issue-<N>.log
```

Codex's sandbox can't write to git unless both git directories are writable roots. In a worktree they differ, and Codex needs both to branch and commit. The network is for `gh`, npm and reading the Google Site for content.

You're woken when it exits. If the log says Codex hit a usage limit (`grep -i "usage limit"`), never retry it, and never switch Codex to API-key billing. Commit what it left to the issue's branch, then finish the build yourself, following the `issue-implement` steps, and note the reset time from the log in the PR's **Built with Codex** section. The usage limits above still apply to you. Then go on to the review, reading your own work as critically as Codex's. Otherwise read the report, then:

- `ready`: go on to the review.
- `partial`: review what's there. If it needs the owner, stop. If the rest is just unfinished work, resume Codex once, in the background. The id is on the `session id:` line of the log. Don't use `--last`, which could pick up another Codex session. `resume` doesn't take `-s`, so the sandbox is set with `-c`:

  ```bash
  codex exec resume <session id> -c 'sandbox_mode="workspace-write"' \
    -c sandbox_workspace_write.network_access=true \
    -c "sandbox_workspace_write.writable_roots=[\"$(git rev-parse --path-format=absolute --git-common-dir)\",\"$(git rev-parse --absolute-git-dir)\"]" \
    -o <scratchpad>/codex-issue-<N>.md \
    "Finish issue #<N>: <what's left>. End with the issue-implement report." \
    2>> <scratchpad>/codex-issue-<N>.log
  ```

- `blocked`, or no report: stop.

## 1. Review

1. Read the issue (`gh issue view <N> --comments`), its umbrella issue if any, and Codex's report.
2. Check out the branch and read the whole diff: `git diff origin/main...HEAD` plus any uncommitted changes.
3. Review it against the issue's "done" list, `CLAUDE.md` and the skills for the kind of work (`design-system`, `react-router`). Look hardest at:
   - anything in the issue that's missing or built differently
   - Codex's assumptions: accept each one, fix it, or stop if it's the owner's or the board's call
   - **club facts:** every name, role, date, link and policy matches the issue, the content files or the current Google Site (https://www.mhdgc.org) word for word, and nothing is made up
   - **prerendering:** pages still prerender (`bun run build` lists each one), page content is in the HTML rather than fetched in an effect, and nothing new makes page views run the Worker
   - **the Worker:** `/api/*` handlers validate input, return JSON errors, never leak upstream errors or secrets, and have tests; secrets are never in `VITE_*` variables
   - **headers:** any new third-party origin (embed, image, script) has its CSP entry
   - accessibility per the `design-system` checklist, and a story for each meaningful state
4. Make the fixes yourself, as separate commits from Codex's.
5. Run `bun run format:check`, `bun run lint`, `bun run typecheck`, `bun run test` and `bun run build`. For a change to pages or the Worker, also run `bun run preview` and check the changed pages and status codes with `curl` or the browser.

Stop and ask the owner, rather than guess, when the issue needs a value, rule or club fact they haven't given, or when Codex's report is `blocked`.

## 2. Open the PR

Follow the `pr-new` skill. It pushes, links the issue with `Closes #N` and requests the `@claude` review. Add a **Built with Codex** section to the description: Codex's assumptions, and what you changed in review.

## 3. Handle the review

1. Wait for the `@claude` workflow run and CI. In the desktop app, bind the PR with the PR tools and let Auto-fix wake you. Otherwise, run `gh pr checks <N> --watch` in the background.
2. Follow `pr-feedback` in auto mode (`pr-feedback <N> auto`).
3. If that pushed fixes that change behavior, comment `@claude review the latest changes` and handle that review the same way. Request at most two re-reviews after the first review. If items are still open after the second, list them and stop.

## 4. Merge

Merge only when all of these hold:

- CI passes on the latest commit.
- No review item is left unanswered.
- `gh pr view <N> --json mergeable,mergeStateStatus` shows it's mergeable and up to date with `main`. If it's behind, merge `origin/main` into the branch, run the checks and push.

Don't wait for the owner to check the UI. If the PR changes any file in `app/`, list the pages and states worth looking at on the PR's preview URL in the report, so the owner can check them later.

Then `gh pr merge <N> --squash` and `git push origin --delete <branch>`. Don't check out `main`: in a worktree it's checked out elsewhere. Once #4 has landed, merging deploys to production. That's safe to do unattended only until `new.mhdgc.org` goes live (#23); after that, a merge is public, so the pipeline's queue stops before the launch issues.

Run `gh pr merge` and `git push origin --delete` each as its own command, never chained with `&&` or `;`. The owner's permission rules allow them only on their own.

After merging, if the pipeline's queue has a next issue, comment on it with notes for its build: helpers to reuse, hooks left for it, and anything this PR deferred to it.

## Stopping

Whenever you stop, end with a short report the pipeline session can read: `MERGED #<PR>`, or `WAITING` with the exact question or check needed from the owner. For a usage stop, also say where the build stands and what's left.
