# Claude Code Instructions — MLS Admin

This repository uses a centralized, repository-native AI operating system that is agent-agnostic. The **canonical source of truth** for all operating rules, engineering standards, and architecture is:

👉 **[docs/ai/AGENT-CORE.md](docs/ai/AGENT-CORE.md)**

This file is an adapter. It carries no rules of its own; if anything here disagrees with `docs/ai/AGENT-CORE.md`, the canonical file wins.

---

## Mandatory startup sequence

Before planning, modifying files, running commands, or answering project questions, load context in this exact order:

1. **[docs/ai/AGENT-CORE.md](docs/ai/AGENT-CORE.md)** — universal rules, hard stops, autonomy boundaries.
2. **[MEMORY.md](MEMORY.md)** — what is true right now (v1.7.0, architecture, features, environment, gotchas).
3. **[docs/ai/HANDOFF.md](docs/ai/HANDOFF.md)** — in-flight work and the next action, or `IDLE`.
4. **[docs/ai/CONSTITUTION.md](docs/ai/CONSTITUTION.md)** — enduring engineering principles.
5. **[docs/ai/WORKFLOW.md](docs/ai/WORKFLOW.md)** — task classification, state machine and gates, output and command protocols, documentation reconciliation.
6. **[docs/ai/INDEX.md](docs/ai/INDEX.md)** — the map to domain docs, ADRs, workflows, plans, and existing repository documentation.

Then load task-specific documents and the actual code, per AGENT-CORE §1.

---

## Critical rules digest (canonical text lives in AGENT-CORE)

- **Zero autonomous Git operations** — never branch, stage, commit, amend, rebase, merge, tag, or push. Report "ready for owner review and commit." (RULE-GIT-001)
- **Analysis-only by default** — review/audit/investigate requests edit nothing. (RULE-AUTON-001)
- **Pre-Edit Summary before editing; silence during; final report after.** (RULE-AUTON-002, RULE-WF-008)
- **Every command is disclosed before it runs.** (RULE-AUTON-004)
- **Pure client SPA** — no server code here; the backend is `../mls-server` and its contract is the source of truth. Never create a root `api/`. (RULE-ARCH-001, -002, -004)
- **Bun** for everything local; verify with `bunx tsc --noEmit`, `bun run lint`, and a check in the owner's running app on `:3000`. (RULE-ENG-001, RULE-VERIF-001)
- **Never touch `.env*` while the owner's dev server is running.** (RULE-VERIF-004)
- **New product capability ⇒ owner-approved PRD + tasks file first.** (RULE-WF-003)
- **Documentation is reconciled per layer before a task is complete.** (RULE-DOC-001)

Rule IDs resolve in [docs/ai/RULES.md](docs/ai/RULES.md).
