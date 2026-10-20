---
doc: AGENT-CORE
purpose: "Canonical operating rules for every AI agent in mls-admin: startup, source-of-truth hierarchy, hard stops, autonomy boundaries, and where everything else lives"
authority: canonical
hosts_rules: [RULE-CORE-001, RULE-CORE-002, RULE-CORE-003, RULE-CORE-004, RULE-GIT-001, RULE-AUTON-001, RULE-AUTON-002, RULE-AUTON-003, RULE-AGENT-001]
mirrors_rules: [RULE-YAGNI-001, RULE-YAGNI-002, RULE-WF-001, RULE-DOC-001, RULE-VERIF-001]
last_reviewed: "2026-09-18"
---

# Agent Core Instructions — MLS Admin

> Canonical source of truth for every AI coding agent working in the `mls-admin` repository — Codex, Claude Code, Gemini / Google Antigravity, GitHub Copilot, or any other.
> `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `.github/copilot-instructions.md` and `.agent/rules/instruction.md` are thin adapters that point here. They carry no rules of their own.

The repository is the durable source of truth. Nothing in this system depends on one model's private memory or on a previous chat transcript.

---

## 1. Universal startup protocol

Before answering a project question, planning, editing a file, or running a command, load context in this order:

1. **This file** — baseline rules and hard stops.
2. **[MEMORY.md](../../MEMORY.md)** — what is true about the project *right now*: version, architecture, features, environment, gotchas, deferred work.
3. **[docs/ai/HANDOFF.md](HANDOFF.md)** — whether a previous agent left work in flight, and what the next action is. If it says `IDLE`, move on.
4. **[docs/ai/CONSTITUTION.md](CONSTITUTION.md)** — the enduring engineering principles.
5. **[docs/ai/WORKFLOW.md](WORKFLOW.md)** — task classification, the state machine and its gates, output and command protocols, documentation reconciliation.
6. **[docs/ai/INDEX.md](INDEX.md)** — the map. Use it to find the task-specific documents below.

Then, **as the task requires**, load:

7. The authoritative product source — the relevant PRD in `docs/prd/` or `docs/admin/`, and the server contract in `../mls-server/docs/admin.openapi.json`.
8. The active plan or tasks file (`docs/tasks/`, `docs/ai/plans/active/`).
9. Relevant ADRs (`docs/ai/decisions/`).
10. [ARCHITECTURE.md](ARCHITECTURE.md), [ENGINEERING.md](ENGINEERING.md), and the relevant domain document (`docs/ai/domains/`).
11. [NOTES.md](NOTES.md) entries concerning the area.
12. Relevant `changelog.md` entries when regression history matters.
13. **The actual code, types, hooks and configuration** that implement the behaviour. Never modify what you have not read.

Do not read the whole repository or the whole changelog for every task. Load what the task needs.

If a required source cannot be found, search the repository before asking the owner. If it genuinely does not exist, do not invent it.

---

## 2. Source-of-truth hierarchy

When documents or instructions conflict, resolve in this order:

1. **Explicit owner instruction** in the current task.
2. **Product requirements** — PRDs in `docs/prd/` and `docs/admin/`, and the server contract (`../mls-server/docs/admin.openapi.json`, or the contract the owner pastes). This dashboard is a pure client; the server defines what exists.
3. **Active plan / tasks file** and its acceptance criteria.
4. **Accepted ADRs** in `docs/ai/decisions/`.
5. **Current project memory** — `MEMORY.md`.
6. **Engineering and workflow rules** — `ENGINEERING.md`, `WORKFLOW.md`, `VERIFICATION.md`.
7. **Current notes** — `NOTES.md`.
8. **Historical changelog** — `changelog.md`.
9. **Agent assumptions** — never act on these; verify against code or ask.

When two documents conflict: do not silently pick one. Name the conflict, check whether the hierarchy resolves it, and if it does not, ask the owner. After resolution, update the canonical document so the conflict does not recur.

For **what is currently true** about the code, the code itself outranks every document. For **what should be true** — intent, prohibitions, priorities — the owner outranks the code.

---

## 3. Hard stops

### 3.1 Zero autonomous Git operations

The owner exclusively controls Git history. Agents **must never**:

- create or switch branches;
- stage changes (`git add`) for convenience;
- commit or amend;
- reset, rebase, merge, cherry-pick, squash, or otherwise rewrite history;
- push, force-push, tag, release, or publish to any remote.

Agents may inspect freely — `git status`, `git diff`, `git log`, `git show`. When work is complete and verified, say that it is **ready for the owner to review and commit**, and ask whether the owner wants a Git operation performed. Never phrase an unapproved Git operation as though it already happened. An explicit authorisation applies only to the exact class of operation and the current interaction.

Two remotes exist: `mls` (`Momentum-log/mls-admin`, the organisation repository) and `origin` (`thekiwidev/mls-admin`, personal backup). Which one receives a push is always the owner's call.

### 3.2 Analysis-only by default

When the owner asks to **review, audit, investigate, find out what is wrong, or explain**: do not edit any file and do not apply patches. Report the problem, the root cause, the exact file paths, and how to fix it. Editing begins only on explicit authorisation ("fix it", "implement the plan", "go ahead").

### 3.3 Explicit permission and the Pre-Edit Summary

Before modifying any file under an authorised task, present the Pre-Edit Summary (or the terse PROBLEM / COST / FIX block for a targeted fix) defined in [WORKFLOW.md §5](WORKFLOW.md#5-output-and-command-protocols), and stop for approval where the state machine requires it. Do not begin editing while a required gate is open.

### 3.4 Command disclosure

No terminal command is run silently. Every command is disclosed — command, purpose, scope, risk — before it runs, in the format in [WORKFLOW.md §5.2](WORKFLOW.md#52-terminal-command-protocol). Package installs and out-of-scope actions have their own request blocks.

### 3.5 Never guess repository facts

Do not invent architecture, paths, commands, field names, endpoints, conventions, product behaviour, or decisions. Inspect the code, the lockfile, the config, and the server contract. Where the repository establishes a fact, do not ask the owner to repeat it. Where it does not, ask.

### 3.6 Never store secrets

No tokens, credentials, connection strings, or real environment values in any document, memory, note, plan, or handoff — even ones already present in the working tree. `.env` is gitignored and stays that way. If you find a committed secret, report it as a finding.

---

## 4. Autonomy boundaries

Act autonomously on routine implementation **inside an approved plan**. Stop and ask before:

- changing product behaviour that the PRD or contract does not define;
- overriding an accepted ADR or a fixed technology choice;
- resolving a product decision the owner has not made (in a PRD or otherwise);
- accepting a significant trade-off the documentation does not resolve;
- adding, removing, or upgrading a dependency;
- any Git operation (§3.1);
- any destructive data operation against the backend — this dashboard's mutations (ban, delete, bypass payment, override status, regenerate backup codes) act on real records;
- modifying `.env*` files at all while the owner's dev server is running (see [VERIFICATION.md §4](VERIFICATION.md#4-environment-rules));
- deleting or materially rewriting existing documentation;
- spending money or calling paid services.

Do not ask permission for what the repository's rules or an approved plan already authorise.

---

## 5. YAGNI and reuse — summary

The full principles are in [CONSTITUTION.md](CONSTITUTION.md). In one line each: build only what the current task requires; search `components/`, `hooks/`, `lib/`, `utils/`, `types/` before creating anything; make the smallest change that is correct; do not add abstractions, layers, config, or dependencies for a future that has not arrived.

---

## 6. Documentation duties — summary

Documentation is part of implementation, not a postscript. Every task ends with the Documentation Impact Review in [WORKFLOW.md §7](WORKFLOW.md#7-documentation-impact-review-and-reconciliation): inspect the actual diff, then update every affected layer — changelog, memory, handoff, notes, ADRs, architecture, engineering, domain docs, plan/tasks status — and state per layer what was done. A passing typecheck is not evidence that the documentation is current.

---

## 7. Definition of done — summary

A task is complete only when every gate in [VERIFICATION.md](VERIFICATION.md) has passed with its real output shown, the documentation reconciliation has been performed and reported, the handoff is updated or cleared, and the final report ([WORKFLOW.md §9](WORKFLOW.md#9-final-report-format)) has been produced — ending with the statement that no unauthorised Git operation occurred and that the working tree is ready for owner review and commit.

---

## 8. Key repository realities

Load-bearing facts an agent must not get wrong. Detail lives in [MEMORY.md](../../MEMORY.md) and [ARCHITECTURE.md](ARCHITECTURE.md).

- **Product:** Momentum Logistics Service (MLS) — admin dashboard for a Polish logistics business. Locale `pl-PL`, currency PLN, timezone CET/CEST. Codebase language is English.
- **Stack:** Next.js 16 App Router, React 19, TypeScript strict, Tailwind 4, shadcn/ui, TanStack Query 5, Axios, react-hook-form + Zod, react-hot-toast. **Bun** for all package and script operations.
- **Shape:** a pure client-side SPA. No route handlers, no server actions, no server-side data fetching. Every page is `"use client"`; every byte of data comes from `lib/api` → `NEXT_PUBLIC_API_URL`. Never add a root-level `api/` directory ([ADR-001](decisions/ADR-001-client-only-spa-no-server-code.md), [ADR-002](decisions/ADR-002-api-client-under-lib-not-root-api.md)).
- **Backend:** the sibling repository `../mls-server` (Express + Prisma + PostgreSQL), served on `:8000` in development. Its `docs/admin.openapi.json` and `docs/admin/authentication-guide.md` are the contract. It is not always running; check it before assuming a client bug.
- **Auth:** email-first sign-in; passwordless Super Admin (OTP / TOTP / backup codes); one server-backed session per admin with a one-hour *sliding* idle timeout mirrored by the cookie in `lib/auth/session.ts`. Client permission checks are UX, not security — the server enforces independently.
- **Verification:** `bunx tsc --noEmit`, `bun run lint`, and a check in the running app. There are no tests and no CI today.
- **Owner's dev server:** the owner keeps their own `next dev` running on `:3000`. It holds the Turbopack build lock, and `NEXT_PUBLIC_*` values are inlined into cached chunks — never touch env files under it.
