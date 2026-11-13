---
name: pr-new
description: Open a GitHub PR for the current branch. Use when the user runs /pr-new or asks to open/create a PR.
argument-hint: '[base branch or extra notes]'
---

Open a pull request for the current branch. Arguments: `$ARGUMENTS` (optional). If the first word names an existing remote branch (`git ls-remote --heads origin <word>`), it is the base; everything else is notes to include in the description. The base defaults to `main`; `<base>` below means that branch.

## Steps

1. **Check the branch.** If on `main`, stop and ask which branch to create. Invoking this skill authorizes committing work relevant to the current task on a feature branch (including an issue-specific branch), without asking again. Inspect all staged, unstaged and untracked changes first. If unrelated changes are present, show them and ask what to do with them before committing. Never commit directly on `main`.
2. **Check it builds.** Run `bun run format:check`, `bun run lint`, `bun run typecheck` and `bun run test` (skip any script `package.json` doesn't have yet, and say so). If one fails, report the failure and ask before opening the PR anyway.
3. **Push.** `git fetch origin <base>`, then `git push -u origin HEAD`.
4. **Write the title and body** from `git log origin/<base>..HEAD` and `git diff origin/<base>...HEAD`:
   - Title: one imperative sentence, sentence case, no trailing period (e.g. "Cache bun install in CI and time out a hung install").
   - Body: short bullets on what changed and why; call out anything a reviewer must do or know (secrets, migrations, follow-ups). Group with bold headings only when the PR covers several distinct things. Use a table only when it actually clarifies.
   - If the task originates from a GitHub issue, link that issue in the PR description. Use `Closes #N` when the PR fully implements the issue, or `Related to #N` when work remains. Reference any other related PRs/issues as `#N`.
   - End with the attribution line from the current session's instructions, if any.
5. **Create it.** `gh pr create --base <base> --title "..." --body "..."` (use a heredoc for the body).
6. **Request a Claude review.** `gh pr comment <N> --body "@claude review this PR"`. This posts as the user, which is what triggers the `@claude` workflow (`.github/workflows/claude.yml`). It only responds to members of the `mile-high-disc-golf-club` organization, so strangers can't spend the token. If `gh api orgs/mile-high-disc-golf-club/memberships/$(gh api user --jq .login) --jq .state` isn't `active`, skip this step and say so.
7. **Report** the PR URL as a markdown link. If the desktop app's PR tools are available, bind it (`get_status` / `bind_pr`) and offer Auto-fix.
