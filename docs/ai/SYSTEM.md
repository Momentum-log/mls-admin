---
initializer_version: "v2 (content md5 4ded9bf71857d3f5821c502469cd1102)"
initializer_source: "ai-project-agent-system-initializer-v2.md (owner-supplied, 2026-09-18)"
generated_at: "2026-09-18"
last_upgraded_at: null
last_amended_at: null
canonical_core: "docs/ai/AGENT-CORE.md"
package_manager: "bun"
mode_history:
  - { date: "2026-09-18", mode: "ADOPT", note: "initial adoption, Tier 0 + 1 + targeted Tier 2; brownfield v1.7.0; legacy .agent/rules mined and archived" }
agents:
  - { name: "AGENTS.md",                       link: "adapter", reason: "owner chose adapter files with relative links over symlinks (portability); matches ../mls-server" }
  - { name: "CLAUDE.md",                       link: "adapter" }
  - { name: "GEMINI.md",                       link: "adapter" }
  - { name: ".agent/rules/instruction.md",     link: "adapter", reason: "Antigravity rules directory; trigger: always_on; pre-existing file rewritten, original archived" }
  - { name: ".agent/rules/api-integration-guide.md", link: "adapter", reason: "trigger: model_decision; points at workflows/API-INTEGRATION-WORKFLOW.md; original archived" }
  - { name: ".github/copilot-instructions.md", link: "adapter", reason: "paths relative to .github/" }
modules:
  present:
    - AGENT-CORE
    - INDEX
    - SYSTEM
    - RULES
    - CONSTITUTION
    - WORKFLOW
    - VERIFICATION
    - ARCHITECTURE
    - ENGINEERING
    - MEMORY
    - HANDOFF
    - NOTES
    - CHANGELOG            # pre-existing changelog.md, integrated not replaced
    - workflows/INDEX
    - workflows/PRD-WORKFLOW
    - workflows/API-INTEGRATION-WORKFLOW
    - decisions/INDEX + ADR-001…ADR-006 (retro)
    - domains/INDEX
    - domains/auth-session
    - domains/rbac-permissions
    - domains/api-client
    - plans/INDEX
    - plans/active/PLAN-forward-declared-dashboard-routes
    - archive/legacy-agent-instruction
    - archive/legacy-api-integration-guide
  pruned:
    - { module: "domains/users.md",            reason: "behaviour legible from hooks/users, types/user.ts and the PRDs; no non-obvious constraints yet" }
    - { module: "domains/shipments.md",        reason: "as above; candidate if the leg-2 re-pricing / override rules accumulate more traps" }
    - { module: "domains/carriers.md",         reason: "as above; candidate when the three-write save (N-005) is addressed" }
    - { module: "domains/leads.md",            reason: "as above" }
    - { module: "domains/hub-multi-leg.md",    reason: "as above; changelog 1.5.0 documents the rules adequately for now" }
    - { module: "plans/completed/",            reason: "directory exists, empty; nothing completed under the new system yet" }
    - { module: "UPGRADES.md",                 reason: "created lazily on first upgrade" }
    - { module: "AMENDMENTS.md",               reason: "created lazily on first amendment" }
    - { module: "CI / hooks enforcement",      reason: "no CI exists (N-006); gates are manual until the owner adds a runner" }
  not_applicable:
    - { module: "domains/worker.md",   reason: "no worker/queue; pure client SPA" }
    - { module: "domains/api.md (server-side)", reason: "backend lives in ../mls-server with its own system" }
    - { module: "domains/mobile.md / desktop.md / cli.md", reason: "web-only admin dashboard" }
    - { module: "domains/payments.md", reason: "payments are server-side; the client only bypasses/records" }
    - { module: "migration validation gate", reason: "no database in this repository" }
verification_commands:
  typecheck: "bunx tsc --noEmit"
  lint: "bun run lint"
  build: "bun run build   # coordinate with owner; writes .next/ under the running dev server"
  test: null              # no test runner exists (N-006)
  runtime: "owner's running `bun run dev` on http://localhost:3000; manual check per VERIFICATION.md §3"
customizations:
  - id: CUST-001
    rule: RULE-AGENT-001
    deviation: "Adapter files instead of symlinks for all entry points"
    reason: "owner choice 2026-09-18; portability across tools/OS; consistency with ../mls-server"
    protected: true
  - id: CUST-002
    rule: [RULE-AUTON-001, RULE-AUTON-002, RULE-AUTON-004, RULE-AUTON-005, RULE-AUTON-006, RULE-WF-008, RULE-VERIF-003]
    deviation: "mls-server's owner protocols carried in: analysis-only default, Pre-Edit Summary, terminal command disclosure, package-install and scope-check blocks, PROBLEM/COST/FIX ⇄ DONE/OUTCOME terse output, zero-unused-code gate"
    reason: "owner choice 2026-09-18 — same operating feel across both repositories"
    protected: true
  - id: CUST-003
    rule: RULE-WF-003
    deviation: "PRD gate has no small-feature exemption: every new capability needs PRD + tasks file, both owner-approved; artifacts live in the pre-existing docs/prd/ and docs/tasks/ trees, not under docs/ai/"
    reason: "owner ruling 2026-09-18; preserves the repository's existing PRD convention"
    protected: true
  - id: CUST-004
    rule: RULE-DOC-002
    deviation: "Changelog keeps the project's existing style (bold Added/Changed/Fixed bullets, Breaking (deployment) preamble, historical-accuracy Notes); heading level is `##` from 1.7.0 forward while ≤1.6.2 keep `###`"
    reason: "27 releases of history; owner ruling 2026-09-18 on heading level"
    protected: true
  - id: CUST-005
    rule: [RULE-ENG-005, RULE-ENG-006, RULE-ENG-007]
    deviation: "Legacy-migration policy: new code complies; existing files migrate only when a task already touches them; no drive-by migrations"
    reason: "owner ruling 2026-09-18 on convention conflicts C-01, C-02, C-03"
    protected: true
  - id: CUST-006
    rule: RULE-VERIF-004
    deviation: "Environment rule specific to this owner's setup: never modify .env* under their always-running dev server; never start a second instance"
    reason: "owner feedback from a prior session; NEXT_PUBLIC_* inlining into Turbopack cache caused a 37-minute confusion"
    protected: true
  - id: CUST-007
    rule: RULE-VERIF-001
    deviation: "No test gate; regression checks are documented manual reproductions"
    reason: "no test runner exists; adding one is an owner-approved maintenance task (N-006), not a default"
    protected: false
open_confirmations:
  - { id: Q-01, question: "Refresh docs/admin/admin.openapi.json from ../mls-server (2026-09-18 version), or replace the snapshot with a pointer?", blocking: "INDEX.md §3 freshness note; NOTES N-018" }
  - { id: Q-02, question: "Rewrite README.md now as a documentation-only task, or defer to the next release?", blocking: "NOTES N-016; README currently marked partially stale" }
  - { id: Q-03, question: "Does /dashboard/settings still have a purpose after password rotation was removed in 1.7.0?", blocking: "plans/active/PLAN-forward-declared-dashboard-routes item 1" }
  - { id: Q-04, question: "Should this adoption receive a changelog.md entry (the convention excludes pure doc changes, but contributor operating rules changed)?", blocking: "nothing; recorded for the owner's next release decision" }
---

# System Manifest — MLS Admin AI Operating System

> This document describes the **AI system itself**, not the product. Project knowledge lives in `MEMORY.md`, `ARCHITECTURE.md`, and the domain documents. If this manifest and the repository disagree, the repository wins and the manifest is corrected.

---

## What this system is

A repository-native, agent-agnostic operating system generated by the AI Project Agent System Initializer v2 in **ADOPT** mode on 2026-09-18. It lets any coding agent — Codex, Claude Code, Gemini / Antigravity, GitHub Copilot, or another — enter `mls-admin`, read the entry point plus the current-state and workflow documents, and continue correctly without the previous agent's conversation.

Canonical core: `docs/ai/AGENT-CORE.md`. Six adapters point at it (see frontmatter `agents`).

## Adoption summary

**Mode evidence:** real application code (Next.js 16 SPA, v1.7.0, ~30 commits since 2026-02-13); no canonical AI core; two hand-written Antigravity rule files in `.agent/rules/`; the sibling `../mls-server` already running a v1 of this system (no manifest/registry), whose owner protocols were carried in at the owner's request.

**Tier:** 0 + 1 + targeted Tier 2 (three risk-area domain docs, six retro-ADRs, two workflows, one backlog plan).

**Derived facts** were confirmed by the owner on 2026-09-18 (package manager, stack, pure-client shape, real commands, absence of tests/CI, dual remotes, PRD convention). Facts in the generated documents are `[verified]` from the repository unless tagged `[inferred]` or `[owner: date]` inline.

**Convention conflicts** C-01 (Zod), C-02 (colour tokens), C-03 (file naming), C-04 (changelog heading) were ruled by the owner; policy in `ENGINEERING.md §9`, locations in `NOTES.md` N-012…N-015.

**Migration ledger** (nothing deleted):

| Existing file | Disposition | Result |
|---|---|---|
| `.agent/rules/instruction.md` | SPLIT + adapter | Rules carried into AGENT-CORE / ENGINEERING / VERIFICATION / WORKFLOW and registered; original verbatim at `docs/ai/archive/legacy-agent-instruction.md`; live file is now an adapter |
| `.agent/rules/api-integration-guide.md` | CANONICALIZE + adapter | `docs/ai/workflows/API-INTEGRATION-WORKFLOW.md` with `@/api` → `@/lib/api` corrected; original verbatim in archive; live file is an adapter |
| `changelog.md` | KEEP | Untouched; style codified in `WORKFLOW.md §7.3` |
| `README.md` | INDEX | Untouched; marked partially stale (N-016); rewrite is Q-02 |
| `docs/prd/`, `docs/tasks/`, `docs/admin/`, `docs/review/`, `docs/*.md` | INDEX | Untouched; catalogued in `INDEX.md §3` with freshness notes; `docs/admin-workflow.md`, `prd-super-admin-password-rotation.md`, `admin.openapi.json` marked historical |
| `.claude/launch.json` | KEEP | Tooling config, not instructions; npm noted in N-007 |
| `.idea/` | KEEP | IDE config; not instructions |

**Files created:** `docs/ai/{AGENT-CORE,INDEX,SYSTEM,RULES,CONSTITUTION,WORKFLOW,ARCHITECTURE,ENGINEERING,VERIFICATION,HANDOFF,NOTES}.md`, `docs/ai/workflows/{INDEX,PRD-WORKFLOW,API-INTEGRATION-WORKFLOW}.md`, `docs/ai/decisions/{INDEX,ADR-001…006}.md`, `docs/ai/domains/{INDEX,auth-session,rbac-permissions,api-client}.md`, `docs/ai/plans/{INDEX,active/PLAN-forward-declared-dashboard-routes}.md`, `docs/ai/archive/{legacy-agent-instruction,legacy-api-integration-guide}.md`, `MEMORY.md`, `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `.github/copilot-instructions.md`.
**Files rewritten as adapters:** `.agent/rules/instruction.md`, `.agent/rules/api-integration-guide.md`.
**Application code changed:** none. **Git operations performed:** none.

## Source-of-truth hierarchy in force

Owner instruction → PRD / server contract → active plan or tasks file → ADRs → `MEMORY.md` → `ENGINEERING.md` / `WORKFLOW.md` / `VERIFICATION.md` → `NOTES.md` → `changelog.md` → assumptions. Canonical statement: `AGENT-CORE.md §2`. For current code facts, the code outranks every document; for intent, the owner outranks the code.

## Module decisions and rationale

See frontmatter `modules`. The pruned per-feature domain docs are the most likely EXTEND candidates: create one when an area accumulates constraints that the hooks, types, and PRDs do not make obvious. `plans/completed/` and the two append-only logs are created on first use. CI enforcement is pruned because no CI exists, not because gates are optional.

## Owner customizations and why they are protected

CUST-001…006 (frontmatter) are deliberate deviations from initializer defaults, each with a reason. An UPGRADE that would revert one must raise a conflict showing both versions; it may not overwrite. CUST-007 (no test gate) is **not** protected: when a test runner arrives, `VERIFICATION.md §2` and `RULES.md RULE-VERIF-001` should be amended to add the gate.

## Outstanding confirmations

Q-01…Q-04 in frontmatter; mirrored in `MEMORY.md §9`. None blocks day-to-day work.

## How to upgrade this system

Supply a newer initializer and ask for **UPGRADE**. The agent reads this manifest as BASE, computes deltas against the new specification, consults `modules.pruned` before proposing any absent module, respects every `protected: true` customization, presents a dry-run delta table, and writes nothing until approved. Content files (`MEMORY.md`, `HANDOFF.md`, `NOTES.md`, `changelog.md`, ADRs, plans, domains, the project statements in `ARCHITECTURE.md`/`ENGINEERING.md`) are never reset. On completion it appends `docs/ai/UPGRADES.md` and updates this manifest last. Running it twice with no change must produce zero modifications.

The sibling `../mls-server` runs a v1 system (no `SYSTEM.md`/`RULES.md`, no task classification or failure states). It would benefit from the same UPGRADE; that is a separate task in that repository.

## How to amend a rule in this system

When the owner states a new or changed rule ("from now on…", "the new workflow is…", "stop doing X"): normalise it to ACTOR / TRIGGER / OBLIGATION / EXCEPTION / PROOF (confirm with the owner if any part is underdetermined; do not invent an exception); classify it to find its single canonical home (`WORKFLOW.md`, `VERIFICATION.md`, `ENGINEERING.md`, `AGENT-CORE.md`, `CONSTITUTION.md`, an ADR, or this manifest); look the rule up in `RULES.md` for its registered mirrors; sweep `docs/ai/` and the root adapters with the *old* rule's vocabulary; amend the canonical home, the registry, every mirror (as a reference, not a restatement), and every executable artifact — checklist, gate, template, report format, `HANDOFF.md` template, decision matrix; check for conflicts with ADRs and protected customizations and stop if one exists; set a forward-only effective date; append `docs/ai/AMENDMENTS.md`; update `last_amended_at`, `mode_history`, and `customizations` here; re-sweep for orphans instructing the old behaviour; report with a traceability table. A prose-only change that leaves the checklist or report format unchanged has not been applied.
