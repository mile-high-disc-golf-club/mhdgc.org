---
name: pipeline
description: Coordinate the Phase 0 to 3 issues one at a time, starting a fresh session per issue in which Codex builds it and Claude reviews and merges it. Use when the owner runs /pipeline or asks to start or resume the Codex pipeline.
argument-hint: '[issue number to stop after]'
---

Coordinate the queue below, one issue at a time. Each issue gets its own session, so this one stays small: don't read code, run Codex or review here. If an argument is given, stop after that issue.

## Queue

In order:

- **Phase 0:** #2, #3, #4
- **Phase 1:** #5, #6, #7, #8
- **Phase 2:** #9, #10, #11, #12, #13, #14, #15
- **Phase 3:** #18, #19

Not in the queue, because they aren't code: #16 (the board makes the calendars public) and #17 (the owner's decision on the Events layout). #18 and #19 depend on them, so their runs stop `blocked` until both are closed. Phase 4 (#20–#24) and Post-MVP are also left out: once `new.mhdgc.org` is live, a merge is public, so the owner runs those by hand.

## Before the first issue

Check these, and stop and tell the owner if any fails:

- #1 is closed: the scaffold is on `main` (`gh issue view 1 --json state`).
- The `@claude` review can run: `gh secret list` shows `CLAUDE_CODE_OAUTH_TOKEN`, and the Claude GitHub App is installed on the `mile-high-disc-golf-club` organization. Only the owner can add these: they run `claude setup-token`, then `gh secret set CLAUDE_CODE_OAUTH_TOKEN`, and install the app from https://github.com/apps/claude. Never ask for or handle the token yourself.
- `codex login status` shows Codex is signed in.

Before #4, also check `gh secret list` shows `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. Without them, the first deploy on `main` fails. The owner creates the token in the club's Cloudflare account and adds both secrets.

## Starting

The owner wants this session reachable from their phone and the Mac kept awake. At the start of a run:

1. Turn on Remote Control for this session.
2. Request keep-awake until the session goes idle.

3. Read the plan usage with the app's usage tool and note extra usage's `spent` amount. Give that baseline to every issue session. If extra usage is turned on, warn the owner that a skill can only stop between steps, and that turning it off in their Claude settings is the only sure way to never spend it.

These, starting sessions and archiving them use the desktop app's tools. If one isn't available, or is refused, skip it and say so in the report.

**Issue runners.** Prefer a session per issue (below). While the owner is on Remote Control, the app only starts sessions from a message typed in the desktop app. When it refuses a session, or there are no session tools, run each issue in a background agent instead: the Agent tool with worktree isolation, given the same brief and background as the session would get. Agents can't be opened or steered by the owner, so they never ask mid-run: they stop with `WAITING`, and you start a new agent with the owner's answer, quoting it, or resume the same one with SendMessage. A notice that an agent is waiting on its own background work isn't its report: keep waiting.

## Each issue

1. **Check usage.** Stop if extra usage's `spent` is above the baseline, the 5-hour limit is at 80% or more, or any weekly limit is at 85% or more. The owner never wants extra usage or credits spent automatically, and the 80% line leaves room for one issue to finish, since issue sessions stop themselves at 90%.
2. **Find the next issue.** It's the first one in the queue that's still open (`gh issue view <N> --json state`). Each issue builds on the one before it, so never skip one that's stuck.
3. **Start its runner.** A fresh session (or agent, see above) in its own worktree, cut from the latest `origin/main`, with:
   - title: `#<N> <issue title>`
   - brief: "Run the `review-and-ship` skill for issue #<N>. The extra usage baseline is $<spent>. End with its report."
   - background: that this is one step of the pipeline, which goes one issue at a time and relies on GitHub for state; that the owner may be away and replies through this pipeline session; that the owner wants PRs merged without them and skips all visual checks until Phase 2 is done, checking pages later on PR preview URLs; and the current plan usage, if the 5-hour limit is already past 50%.
4. **Wait.** You're woken when the runner ends its turn. Don't poll it. To see progress when the owner asks, check the issue's branch and PR on GitHub.
5. **Check its report against GitHub.**
   - Issue closed and its PR merged: archive the issue's session, remove the runner's worktree, then go to the next issue. From the main checkout, find the worktree with `git worktree list`. If `git -C <path> status -s` is empty, run `git worktree remove <path>` and then `git branch -D <branch>`, each as its own command. If it has uncommitted changes, leave it and mention it in the next report. Agent worktrees aren't removed automatically, so this step matters most for them.
   - `WAITING`, or anything else: stop (below).

If the app stops waking you, stop and tell the owner to reply "continue".

An issue can turn out to need work from an earlier issue that was closed before it was finished. Check the claim on `main`, tell the owner, and let them choose: reopen the earlier issue and finish it first, or build this one without it.

## Stopping

Stop when the queue is done, an issue session is waiting on the owner, or a usage limit is near. Send a push notification and report:

- what merged since the last stop, with PR links
- what's waiting, the exact question or check, and a link to that issue's session
- for a usage stop: which limit (Claude or Codex) and when it resets

Don't schedule a wake-up for the reset. The owner says "continue" when they're ready.

When the owner answers here, send the answer to that issue's session, quoting their words, and wait for it again. "Continue" means to check GitHub and carry on from the first open issue.
