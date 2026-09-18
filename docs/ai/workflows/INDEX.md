---
doc: WORKFLOWS-INDEX
purpose: "Catalogue of reusable, project-specific workflows that the general WORKFLOW.md delegates to"
authority: reference
hosts_rules: []
mirrors_rules: []
last_reviewed: "2026-09-18"
---

# Workflow Library

Project-specific procedures that [WORKFLOW.md](../WORKFLOW.md) delegates to. Read the one your task needs; none are mandatory at startup.

| Workflow | Read when | Origin |
|---|---|---|
| [PRD-WORKFLOW.md](PRD-WORKFLOW.md) | The task is classified as a **new product capability**. Defines the `docs/prd/` → `docs/tasks/` two-gate process. | Existing repository convention, documented 2026-09-18 |
| [API-INTEGRATION-WORKFLOW.md](API-INTEGRATION-WORKFLOW.md) | You are adding or changing any call to the backend: the mandatory types → `lib/api` → hook → component layering. | Relocated from `.agent/rules/api-integration-guide.md` on 2026-09-18, paths corrected |

Add a workflow here only when a procedure is genuinely reusable across tasks and cannot be expressed as a rule in `ENGINEERING.md` or a gate in `WORKFLOW.md`.
