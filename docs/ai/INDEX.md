---
doc: INDEX
purpose: "Navigation map: what each document is for, when to load it, and where existing repository documentation fits"
authority: reference
hosts_rules: []
mirrors_rules: [RULE-CORE-001]
last_reviewed: "2026-09-18"
---

# AI Documentation Index — MLS Admin

> The map, not the territory. It tells you what each document means and when to read it. It does not restate them.

---

## 1. The operating system (`docs/ai/`)

| Document | Responsibility | Load |
|---|---|---|
| [AGENT-CORE.md](AGENT-CORE.md) | Universal rules, startup protocol, source-of-truth hierarchy, hard stops, autonomy boundaries, key realities | **Always, first** |
| [../../MEMORY.md](../../MEMORY.md) | What is true right now — version, decisions, features, environment, gotchas, deferred work, open questions | **Always** |
| [HANDOFF.md](HANDOFF.md) | The baton: in-flight work and the next action, or `IDLE` | **Always** |
| [CONSTITUTION.md](CONSTITUTION.md) | Enduring engineering principles | **Always** |
| [WORKFLOW.md](WORKFLOW.md) | Task classification, state machine and gates, output and command protocols, plan template, documentation reconciliation, completion sequence, final report format | **Always, before acting** |
| [INDEX.md](INDEX.md) | This map | **Always** |
| [ARCHITECTURE.md](ARCHITECTURE.md) | The structure that exists: shape, backend boundary, request pipeline, auth, RBAC, routes, env, deployment, constraints | Multi-module tasks; anything touching structure |
| [ENGINEERING.md](ENGINEERING.md) | Code standards that actually apply, and the legacy-migration policy | Before writing or refactoring code |
| [VERIFICATION.md](VERIFICATION.md) | The real gates, manual verification, environment rules, no-weakening clause | Before claiming completion; before running commands |
| [NOTES.md](NOTES.md) | Open defects, deferred concerns, non-fixes, convention conflicts, stale-doc findings | During investigation; before touching a listed file |
| [SYSTEM.md](SYSTEM.md) | Manifest of this AI system: version, modules present/pruned, customizations, open confirmations, how to upgrade/amend | When upgrading, amending, auditing, or extending the system |
| [RULES.md](RULES.md) | Registry of every enforced rule: canonical home, mirrors, proof surface | When changing any rule (cascade lookup); during audit |
| [workflows/INDEX.md](workflows/INDEX.md) | Reusable procedures: [PRD-WORKFLOW](workflows/PRD-WORKFLOW.md), [API-INTEGRATION-WORKFLOW](workflows/API-INTEGRATION-WORKFLOW.md) | New capability → PRD; any backend call → API workflow |
| [decisions/INDEX.md](decisions/INDEX.md) | [ADR-001](decisions/ADR-001-client-only-spa-no-server-code.md) pure client · [ADR-002](decisions/ADR-002-api-client-under-lib-not-root-api.md) `lib/api` not root `api/` · [ADR-003](decisions/ADR-003-dual-git-remotes-and-no-autonomous-git.md) remotes & Git · [ADR-004](decisions/ADR-004-permission-mirroring-and-wildcard-superadmin.md) permissions mirror server · [ADR-005](decisions/ADR-005-server-backed-sliding-session-cookie.md) sliding session cookie · [ADR-006](decisions/ADR-006-response-envelope-normalisation.md) envelope normalisation — all retro-recorded | Before proposing a structural change |
| [domains/INDEX.md](domains/INDEX.md) | [auth-session](domains/auth-session.md), [rbac-permissions](domains/rbac-permissions.md), [api-client](domains/api-client.md) | When touching those areas |
| [plans/INDEX.md](plans/INDEX.md) | Non-feature plans: [PLAN-forward-declared-dashboard-routes](plans/active/PLAN-forward-declared-dashboard-routes.md) (proposed backlog) | When picking up backlog work |
| `archive/` | **Historical, non-authoritative.** [legacy-agent-instruction.md](archive/legacy-agent-instruction.md) (the pre-adoption `.agent/rules/instruction.md`) and [legacy-api-integration-guide.md](archive/legacy-api-integration-guide.md) (pre-adoption API guide with stale `@/api` paths), both verbatim with provenance headers | Provenance only — never as current rules |

**Current state** lives in `MEMORY.md` + `HANDOFF.md`. **History** lives in `changelog.md`. **Why** lives in `decisions/`. **What to do** lives in `WORKFLOW.md`. **How to write it** lives in `ENGINEERING.md`. **How to prove it** lives in `VERIFICATION.md`.

---

## 2. Agent entry points (root)

All are thin adapters to `AGENT-CORE.md` with relative links. None carries rules of its own ([RULE-AGENT-001](RULES.md#rule-agent-001)).

| File | Agent |
|---|---|
| `AGENTS.md` | Codex and any `AGENTS.md`-consuming agent |
| `CLAUDE.md` | Claude Code |
| `GEMINI.md` | Gemini / Google Antigravity (root) |
| `.agent/rules/instruction.md` | Antigravity rules directory (`trigger: always_on`) |
| `.agent/rules/api-integration-guide.md` | Antigravity (`trigger: model_decision`) → points at the API workflow |
| `.github/copilot-instructions.md` | GitHub Copilot |

---

## 3. Existing repository documentation (indexed, not moved)

Authoritative unless marked. Dates are last Git modification.

### Product requirements — `docs/prd/` and friends
The PRD workflow's artifacts. Each defines a feature as it was specified; the code and changelog record what shipped.

| File | Feature | Note |
|---|---|---|
| `docs/prd/prd-admin-basic-setup.md` | Foundation, auth, users, shipments, leads | Feb 2026; auth section superseded by v6 (see `domains/auth-session.md`) |
| `docs/prd/prd-admin-address-requests-management.md` | Address requests | |
| `docs/prd/prd-admin-dashboard-redesign.md`, `prd-dashboard-polish-admin-features.md` | Dashboard | |
| `docs/prd/prd-admin-dynamic-carriers.md`, `docs/admin/prd-dynamic-active-carriers.md` | Carriers | |
| `docs/prd/prd-carrier-commission-management.md`, `prd-commission-and-admin-profile.md` | Commissions, profile | |
| `docs/prd/prd-admin-profile-documentation.md` | Profile drawer + docs viewer | |
| `docs/prd/prd-admin-rbac-management-ui.md`, `docs/admin/prd-admin-rbac-management.md` | RBAC UI | |
| `docs/prd/prd-login-toast-redesign.md` | Login + toasts | Login since redesigned again (1.7.0) |
| `docs/prd/prd-user-details-shipments-estimates.md` | User sub-pages | |
| `docs/prd-admin-user-resources-v2.md`, `docs/prd-staff-and-carrier-management.md` | Users v2, staff & carriers | |
| `docs/prd/prd-super-admin-password-rotation.md` | Password rotation | **Historical** — feature removed in 1.7.0 (N-019) |

### Task lists — `docs/tasks/`, `docs/admin/tasks-*.md`
Shipped feature checklists (0.4.0 – 1.3.0). Format reference for new tasks files: [workflows/PRD-WORKFLOW.md](workflows/PRD-WORKFLOW.md).

### Feature and integration guides — `docs/admin/`, `docs/*.md`
| File | Note |
|---|---|
| `docs/admin/rbac-guide.md`, `rbac-client-integration-guide.md`, `role-management-guide.md`, `staff-management-guide.md`, `user-management-guide.md`, `shipment-management-guide.md`, `marketing-leads-guide.md`, `admin-comprehensive-guide.md` | Feb 2026 feature guides; behaviour largely current, auth sections predate v6 |
| `docs/admin/environment-setup-guide.md` | `SUPER_ADMIN_EMAIL` per environment — current |
| `docs/admin/permissions.ts` | The permission catalogue the role editor offers — **live code-adjacent data**, keep in step with the server |
| `docs/admin/admin.openapi.json` | **Snapshot 2026-08-09** — superseded by `../mls-server/docs/admin.openapi.json` (N-018) |
| `docs/commission-management-guide.md`, `commission-system-guide.md`, `commission-payu-activity-guide.md` | Commission model; PayU activity |
| `docs/admin-client-integration-guide.md`, `client-integration-guide-v2.md`, `address-verification-client-integration-guide.md`, `client-side-user-resources-implementation.md` | Client-integration notes from the server side (Feb 2026); paths reference root `api/` — read as history |
| `docs/admin-comprehensive-spec.md`, `docs/admin-implementation-guide.md` | Original spec / implementation guide (Feb 2026) |
| `docs/admin-workflow.md` | **Historical** — describes daily password rotation and Developer Mode (N-017) |
| `docs/react-hot-toast-docs.md` | Vendored library notes |

### Reviews — `docs/review/`
| File | Note |
|---|---|
| `docs/review/admin-capability-audit-2026-08-09.md` | Full capability audit, 12 defects, 6 risks, 4-phase roadmap. Much of Phase 0–1 shipped in 1.4.0–1.7.0; remaining items are in `NOTES.md` and the routes plan. **Its §6 endpoint table is the best map of server capabilities not yet consumed.** |
| `docs/review/code-cleanup-2026-02-24-admin-dashboard-cleanup-1.md` | Feb 2026 cleanup review |

### Root
| File | Note |
|---|---|
| `changelog.md` | The release history, 0.1.0 → 1.7.0. Style rules: [WORKFLOW.md §7.3](WORKFLOW.md#73-changelog-rules) |
| `README.md` | **Partially stale** (N-016) — trust `ARCHITECTURE.md` and `VERIFICATION.md` where they differ |
| `.claude/launch.json` | Claude desktop preview config (npm; N-007) |

### Sibling repository — `../mls-server`
The backend, with its own AI system (`../mls-server/docs/ai/`). Read there, never edit from here:
`docs/admin.openapi.json` (admin contract) · `docs/admin/authentication-guide.md` (v6 auth) · `openapi.json` (customer API) · `docs/ai/domains/auth.md` (server-side session model).
