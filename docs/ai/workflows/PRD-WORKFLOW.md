---
doc: PRD-WORKFLOW
purpose: "How a new product capability is defined and approved before implementation: docs/prd/prd-<feature>.md → owner approval → docs/tasks/tasks-<feature>.md → owner approval"
authority: canonical
hosts_rules: [RULE-WF-003]
mirrors_rules: [RULE-AUTON-003, RULE-DOC-001]
last_reviewed: "2026-09-18"
origin: "Documents the convention already in use in docs/prd/ (12 PRDs) and docs/tasks/ (5 task files) as of 2026-09-18; strictness confirmed by owner 2026-09-18"
---

# PRD → Tasks Workflow

This repository defines product work in two owner-approved documents before any implementation begins. The convention predates the AI operating system — `docs/prd/` holds twelve PRDs and `docs/tasks/` five task lists — and this document records it so every agent follows the same process. It does not invent a new one.

**Owner ruling (2026-09-18):** every new product capability — a new screen, user flow, dashboard module, or endpoint group — requires a PRD and a tasks file, each approved by the owner, before implementation. Enhancements, bug fixes and refactors use the lighter implementation plan in [WORKFLOW.md §6](../WORKFLOW.md#6-planning-protocol) instead.

---

## When this workflow applies

The general workflow ([WORKFLOW.md §2](../WORKFLOW.md#2-task-intake-and-classification)) classifies every request. This workflow is invoked when the classification is **New product capability**. It is not invoked for:

- an enhancement to an existing screen that does not introduce a new product concept;
- a bug fix;
- a refactor;
- maintenance, dependency or configuration work;
- documentation-only work.

If an agent believes a request classified as an enhancement is actually a new capability in disguise, it says so and asks the owner which gate applies rather than picking the lighter one.

---

## Stage 1 — Discovery

Before drafting, the agent:

1. Reads any existing PRD that touches the same area (`docs/prd/`, `docs/admin/prd-*.md`, `docs/prd-*.md`) so the new document extends rather than contradicts it.
2. Reads the relevant server contract — `../mls-server/docs/admin.openapi.json` or the contract the owner pastes — because this dashboard is a pure client and cannot define endpoints itself ([ADR-001](../decisions/ADR-001-client-only-spa-no-server-code.md)).
3. Checks `docs/review/admin-capability-audit-2026-08-09.md` §6 for endpoints that exist on the server but have no client yet; a "new" feature is often one of these.
4. Asks the owner the questions the code cannot answer: who uses it, what it must not do, which permission gates it, what "done" looks like. Do not fill product decisions silently.

The owner typically describes server changes verbally first and pastes the finalized contract afterwards. Build the PRD against the verbal description with the contract section clearly marked provisional, then replace it when the contract lands.

---

## Stage 2 — The PRD (`docs/prd/prd-<feature>.md`)

File name: `docs/prd/prd-<kebab-case-feature>.md`.

Structure — mirror the existing PRDs (see `docs/prd/prd-admin-basic-setup.md` for the reference shape):

```markdown
# PRD: <Feature title>

## 1. Introduction / Overview
## 2. Goals
## 3. User Stories
## 4. Features / Tasks        # grouped, coded items: e.g. AT01, AT02 …
## 5. Non-Goals
## 6. Technical Considerations  # endpoints, permissions, types, existing code to reuse
## 7. Success Metrics / Acceptance Criteria
## 8. Open Questions
```

Feature items carry a short group code plus number (`IN01`, `AT03`, `SM02`) so the tasks file and the changelog can reference them.

**Gate: owner PRD approval.** The agent presents the PRD and stops. It does not draft tasks until the owner approves or amends the PRD.

---

## Stage 3 — The tasks file (`docs/tasks/tasks-<feature>.md`)

File name: `docs/tasks/tasks-<same-kebab-case-feature>.md`.

Structure — mirror the existing task files (see `docs/tasks/tasks-admin-rbac-management-ui.md`):

```markdown
# Tasks: <Feature title>

## Relevant Files
- `path/to/file.ts` - what it is / (New) if to be created

### Notes
- constraints, reuse pointers, design-system reminders

## Instructions for Completing Tasks
**IMPORTANT:** As you complete each task, check it off in this file by changing `- [ ]` to `- [x]`.

## Tasks
### <Group>
- [ ] XX00: Parent task
  - [ ] XX01: Sub-task
  - [ ] XX02: Sub-task
```

Rules for the tasks file:

- Every task maps to a PRD item code.
- "Relevant Files" lists real paths — verify each exists or mark it `(New)`.
- Sub-tasks are small enough to verify individually.
- Include the verification tasks (typecheck, lint, manual check in the running app) as explicit items.
- Include the documentation tasks (changelog entry, memory update, domain doc update if applicable) as explicit items — they are part of the work, not an afterthought.

**Gate: owner tasks approval.** The agent presents the tasks file and stops. Implementation begins only after approval.

---

## Stage 4 — Execution and status

- The tasks file is the live plan. The agent checks items off as their acceptance is *verified*, not when the code is written.
- If implementation reveals the plan was wrong, the agent records the deviation in the tasks file and in the final report; it does not silently do something different.
- On completion, the tasks file stays in `docs/tasks/` as history. Do not delete it. If the owner later wants completed task files moved, that is a separate, owner-requested task.

---

## Relationship to the rest of the system

| Document | Role in this workflow |
|---|---|
| `docs/ai/WORKFLOW.md` | Decides *whether* this workflow applies (classification) and owns the state machine around it |
| `docs/ai/plans/` | For non-feature multi-step work (refactors, migrations, deferred backlogs). A feature's plan **is** its tasks file; do not duplicate it under `plans/` |
| `docs/prd/`, `docs/tasks/` | Where the artifacts of this workflow live |
| `changelog.md` | Records the shipped feature, referencing PRD item codes where useful |
| `MEMORY.md` | Updated when the shipped feature changes current-state knowledge |
