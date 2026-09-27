---
doc: HANDOFF
purpose: "The baton: what is in flight right now and what the next agent must do first. IDLE when nothing is"
authority: canonical
hosts_rules: []
mirrors_rules: [RULE-DOC-005, RULE-GIT-001]
last_reviewed: "2026-09-18"
---

# Handoff — MLS Admin

**Status:** `IDLE` — no application work is in flight.

**Last session:** 2026-09-18 — adoption of the AI operating system (documentation only; no application code changed). See `docs/ai/SYSTEM.md` for what was created and the open confirmation queue.

**Current branch (read-only):** `dev`, tracking `mls/dev` and `origin/dev`. Working tree was clean before adoption; after adoption it contains only the new/modified documentation files listed in `SYSTEM.md → Adoption summary`. The owner has not committed them.

**Next action for any agent:** none pending. Start from [AGENT-CORE.md §1](AGENT-CORE.md#1-universal-startup-protocol). If the owner wants to act on the adoption report, the open items are in `SYSTEM.md → open_confirmations` and `NOTES.md` N-016…N-019.

---

## Template (use when work is in flight — replace everything above the rule)

```markdown
**Status:** `ACTIVE` | `BLOCKED — <reason from WORKFLOW.md §3.2>`
**Task:** <one line>
**Classification:** <class>
**Objective:** <what done looks like>
**Current branch (read-only; never create/switch):** <branch>
**Work completed:** <bullets, with file paths>
**Files changed:** <exact list, including docs>
**Verification so far:** <gates run, results; manual checks done>
**Remaining work:** <ordered>
**Known issues:** <anything discovered and not yet fixed — also add to NOTES.md>
**Open recorded items:** <NOTES IDs / tasks-file items still open from this work>
**Owner decisions needed:** <numbered>
**Next action:** <the very first thing the next agent does>
```

A new agent must be able to continue from this file alone. When the work completes, restore `IDLE` and remove stale instructions — do not leave a finished task looking active.
