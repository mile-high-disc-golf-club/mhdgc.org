---
name: done
description: Clean up after a feature's PR has merged to main - the local branch, its worktree, stale refs and the linked issue. Use when the user runs /done or says a PR is merged and asks to clean up.
argument-hint: '[PR numbers or branches...]'
---

Clean up after a merged PR. Arguments: `$ARGUMENTS` (optional). Each argument is a PR number or a branch name, and several can be given at once to clear out stale branches. With none, use the PR for the current branch (`gh pr view --json number`). Run the steps for each one. `<branch>` below is the PR's head branch, or the branch named.

**A branch with no PR** (`gh pr list --state all --head <branch>` is empty) counts as merged only when `git merge-base --is-ancestor <branch> origin/main` succeeds, after `git fetch origin main`. Its commits are then already in `main`. Skip step 9 for it. If that check fails, skip the branch and report it as unmerged.

Run each `git` and `gh` command on its own, never chained with `&&` or `;`. The owner's permission rules allow them only on their own.

## Steps

1. **Confirm it merged.** Run `gh pr view <N> --json state,headRefName,headRefOid,body`. If `state` isn't `MERGED`, skip that branch and say so. Never delete anything for an open or closed-unmerged PR, even if asked.
2. **Find where the branch lives.** `git worktree list` shows whether `<branch>` is checked out in a worktree or in the main checkout. The main checkout is the first entry; run the rest from there. If `git rev-parse --verify --quiet refs/heads/<branch>` prints nothing, there's no local copy (it was merged from elsewhere): skip steps 3, 5 and 6 and carry on with the rest.
3. **Check for unsaved work.** Run `git -C <path> status -s` on wherever the branch is checked out. If anything shows up, skip that branch and show it. Don't discard it. Then check for commits that never reached the PR: if `git rev-parse <branch>` differs from the PR's `headRefOid`, skip the branch and show `git log --oneline <headRefOid>..<branch>`. A branch with no PR has nothing to compare, and the ancestor check above covers it.
4. **Update `main`.** In the main checkout, `git switch main`, then `git pull --ff-only origin main`. If the switch fails because `main` is checked out in another worktree, stop and report it rather than working around it.
5. **Remove the worktree**, if the branch had one: `git worktree remove <path>`. You can't remove the worktree you're running in. If you are, say so and give the owner the command instead.
6. **Delete the local branch:** `git branch -D <branch>`. Squash merges mean `-d` won't see it as merged, but step 1 already confirmed it.
7. **Delete the remote branch** if it still exists: `git ls-remote --heads origin <branch>`, and if that prints a line, `git push origin --delete <branch>`.
8. **Prune:** `git fetch --prune`, then `git worktree prune`.
9. **Close out the issue.** For each issue the PR body references with any of GitHub's closing keywords (close, fix or resolve, in any tense or case), or with `Related to #N`:
   - A closing keyword: if `gh issue view <N> --json state` is still open, close it with `gh issue close <N> --comment "Done in #<PR>."`.
   - `Related to`: leave it open, and mention it in the report.
   - Find any umbrella issue listing it with `gh issue list --state open --search "#<N> in:body"`, then look for `- [ ] #<N>` in each result's body. Tick it: save the body with `gh issue view <umbrella> --json body -q .body`, change it to `- [x] #<N>`, and save it with `gh issue edit <umbrella> --body-file <file>`.
10. **Report** in a few lines what was removed, what was closed or ticked, and anything left (unsaved work, a worktree you couldn't remove, open related issues).
