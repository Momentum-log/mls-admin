---
doc: PLANS-INDEX
purpose: "Where multi-step non-feature plans live and what is active"
authority: reference
hosts_rules: []
mirrors_rules: []
last_reviewed: "2026-09-18"
---

# Plans

Feature work is planned in `docs/tasks/tasks-<feature>.md` (see [workflows/PRD-WORKFLOW.md](../workflows/PRD-WORKFLOW.md)); those files are **not** duplicated here. This directory holds plans that are not a single feature: backlogs, refactors, migrations, multi-session maintenance.

## Active

| Plan | Status | Summary |
|---|---|---|
| [active/PLAN-forward-declared-dashboard-routes.md](active/PLAN-forward-declared-dashboard-routes.md) | PROPOSED (backlog, not started) | Seven guarded routes with no page; server endpoints with no client. Owner picks order; each item then goes through the PRD workflow. |

## Completed

None yet. Move a plan here when every item is verified and its documentation reconciled. Keep it only if the history is useful; otherwise the changelog entry suffices.

## Existing task files (feature history, in `docs/tasks/`)

`tasks-admin-profile-documentation.md`, `tasks-admin-rbac-management-ui.md`, `tasks-carrier-commission-management.md`, `tasks-dashboard-polish-admin-features.md`, `tasks-user-details-shipments-estimates.md` — plus `docs/admin/tasks-admin-rbac.md`, `docs/admin/tasks-dynamic-active-carriers.md`. All are shipped work (0.4.0 – 1.3.0); their checkboxes reflect the state at the time.

## Plan format

Objective · Scope · Non-goals · Dependencies · Ordered tasks · Acceptance criteria · Verification · Owner decisions required. Frontmatter `status:` ∈ `proposed | active | blocked | completed`. Do not create a plan for a one-line change.
