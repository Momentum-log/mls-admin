---
doc: ADR-003
purpose: "Two remotes (org + personal); Git is operated only by the owner"
authority: canonical
hosts_rules: []
mirrors_rules: [RULE-GIT-001]
last_reviewed: "2026-09-18"
---

# ADR-003 — Dual Git remotes and zero autonomous Git operations

**Status:** Accepted (recorded retroactively, 2026-09-18)
**Date:** Remotes in force since the repository was pushed; the no-autonomous-Git rule is an owner policy confirmed 2026-09-18 and already in force in `../mls-server` (its ADR-003)

## Decision

1. The repository has two remotes: `mls` (`https://github.com/Momentum-log/mls-admin.git`, the organisation repository) and `origin` (`https://github.com/thekiwidev/mls-admin.git`, the owner's personal backup). Work happens on `dev`; `main` is the release branch.
2. No AI agent creates or switches branches, stages, commits, amends, rebases, merges, cherry-picks, resets, tags, releases, or pushes. Agents inspect Git and report readiness; the owner performs every operation. Canonical rule: [RULE-GIT-001](../RULES.md#rule-git-001) in [AGENT-CORE.md §3.1](../AGENT-CORE.md#31-zero-autonomous-git-operations).

## Context

`[verified: git remote -v, git branch -a, git log]` — both remotes track `dev` and `main`; historical PRs merged `thekiwidev/dev → main`. `[owner: 2026-09-18]` — the owner chose to carry `../mls-server`'s Git policy into this repository unchanged.

## Rationale

`[owner: 2026-09-18]` — the owner controls which remote receives which work and when releases happen; an agent cannot know whether a push should go to the org remote or the personal one, and a mistaken push to the org remote is visible to the team.

## Options considered

Not recorded for the remotes. For the Git policy: an agent-may-commit-on-approval variant was not chosen; the owner performs the operation themself.

## Consequences

- Every final report ends with the Git line ([WORKFLOW.md §9](../WORKFLOW.md#9-final-report-format)).
- `HANDOFF.md` records the branch read-only.
- Agents never `git add` "to be helpful".

## Related

[AGENT-CORE.md §3.1](../AGENT-CORE.md#31-zero-autonomous-git-operations), [CONSTITUTION.md §12](../CONSTITUTION.md)
