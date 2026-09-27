---
doc: NOTES
purpose: "Observations that are not yet durable architecture or current-state facts: open defects, deferred concerns, deliberate non-fixes, convention conflicts, stale-documentation findings"
authority: canonical
hosts_rules: []
mirrors_rules: []
last_reviewed: "2026-09-18"
---

# Notes — MLS Admin

> Each note has an ID, a date, a status, and enough context to act on it without this conversation. Statuses: `open` · `deferred` (with a revisit trigger) · `non-fix` (deliberate, with reason) · `legacy` (do not extend) · `resolved` (kept briefly, then removed). Promote a note to `MEMORY.md` when it becomes a durable gotcha, or to an ADR when it becomes a decision. Notes are not a changelog.

---

## Open defects and risks (from the 2026-08-09 audit, re-verified 2026-09-18)

### N-001
**2026-08-09 · open · Medium** — Staff detail "Recent Activity" is a permanent spinner.
`components/staff/staff-detail-sheet.tsx` (~line 129) renders an infinite `animate-spin` with "We are preparing the audit infrastructure…". Nothing is fetched; it never resolves. `[verified 2026-09-18: string still present]`. Fix: honest empty state until an activity-log endpoint is consumed (see plan item 4). Audit ref: D-09.

### N-002
**2026-08-09 · open · Medium** — `force` flag accepted then discarded in two delete handlers.
`app/dashboard/staff/roles-table.tsx` `handleDelete(force)` and `components/carriers/carrier-detail-sheet.tsx` `handleDelete(force)` both ignore `force`. Neither dialog sets `enableForce`, so behaviour is currently correct — but the signatures invite a future caller to enable the toggle and assume it works. `[verified 2026-09-18: both signatures unchanged]`. Fix when either file is touched: drop the parameter or honour it. Audit ref: D-10.

### N-003
**2026-08-09 · deferred · High** — Session token is a JavaScript-readable cookie.
1.4.0/1.7.0 fixed lifetime, `sameSite=strict`, `secure`; the token is still not `httpOnly` because a client cannot set that. The proper fix is a server-set `httpOnly` cookie and dropping client-side token handling — a `../mls-server` change first. Revisit trigger: when the server offers cookie-based admin auth. Audit ref: D-07; [ADR-005](decisions/ADR-005-server-backed-sliding-session-cookie.md).

### N-004
**2026-08-09 · open · Medium** — No error boundaries.
No `error.tsx` / `global-error.tsx` anywhere under `app/`. A render-time throw below `PermissionGuard` white-screens the dashboard. `[verified 2026-09-18]`. Fix: per-segment `error.tsx` starting with `app/dashboard/`. Audit ref: R-05.

### N-005
**2026-08-09 · open · Medium** — Carrier save is three sequential non-atomic writes.
Profile → commissions → thresholds with no rollback; a mid-sequence failure leaves a mixed state and the toast names only the failing step. Proper fix is a single server endpoint (server task) or a client-side compensating rollback. Audit ref: R-02.

### N-006
**2026-08-09 · deferred · High** — No tests, no CI.
No runner, no test files, no `.github/`. Verification is manual ([VERIFICATION.md §2–3](VERIFICATION.md)). Audit's first targets when the owner authorises: `utils/estimate-shipment-correlation.ts`, the commission/threshold fallback hierarchy, `hooks/use-permissions.ts`. Revisit trigger: owner request. Audit ref: R-06.

### N-007
**2026-09-18 · deferred · Low** — Deployment and launch config use npm; owner wants Bun everywhere.
`vercel.json` (`npm run build` / `npm install`) and `.claude/launch.json` (`npm run dev`). `[owner: 2026-09-18]` ruled this should be Bun. Changing `vercel.json` is deployment config — a separate owner-approved maintenance task with a deploy check, not a side effect. Until then agents use Bun locally and do not edit these files.

### N-008
**2026-08-09 · open · Low** — List views over-fetch for estimate↔shipment correlation.
Where a shipment has no `estimateId`, `utils/estimate-shipment-correlation.ts` falls back to the address/service/time heuristic, and the leads/shipments pages pull large pages to feed it. Since 1.4.0 the wizard sends `estimateId`, so the heuristic only serves older rows. Revisit trigger: when old rows are no longer relevant, remove the fallback and the wide fetches. Audit ref: R-01.

### N-009
**2026-08-09 · open · Low** — Unused-code drift.
`zustand` is a dependency with zero imports `[verified 2026-09-18]`. The audit also listed dead constants and unused icon imports in `app/dashboard/shipments/page.tsx` and the dashboard page; some were cleaned in later releases — re-check with `bun run lint` before acting. Removing `zustand` is a dependency change (owner approval). Audit ref: D-11.

### N-010
**2026-09-18 · open · Low** — `proxy.ts` accepts a `token` cookie nobody sets.
`request.cookies.get("accessToken") || request.cookies.get("token")`. Only `accessToken` is ever written. Harmless widening; remove when `proxy.ts` is next touched.

### N-011
**2026-09-18 · open · Low** — `types/user.ts` carries a `@deprecated` alias.
Line ~51: `/** @deprecated Use UpdateUserStatusPayload. */`. Remove once no consumer imports the old name.

---

## Convention conflicts (owner-ruled 2026-09-18 — policy lives in [ENGINEERING.md §9](ENGINEERING.md#9-legacy-patterns-and-migration-policy))

### N-012 (C-01)
**legacy · migrate when touched** — Forms without Zod. Every form except `app/login/page.tsx` uses plain state. Locations: staff/role dialogs, carrier sheet editors, shipment wizard, address-request actions, profile password change.

### N-013 (C-02)
**legacy · migrate when touched** — Raw Tailwind palette classes (≈170). Heaviest: `app/login/page.tsx` (43), `app/dashboard/security/page.tsx` (21), `components/shipments/estimate-detail-sheet.tsx` (18), `shipment-detail-sheet.tsx` (11). Status-badge colours may need new semantic tokens in `globals.css` first — propose them in the plan of the task that migrates the first badge.

### N-014 (C-03)
**legacy · rename when touched** — PascalCase files in `components/admin-profile/` (`ActivityLogs`, `AdminProfileDrawer`, `DocsViewer`, `PasswordChange`, `ProfileDetails`). Renaming one means updating every importer in the same change.

### N-015 (C-04)
**non-fix · history** — `###` version headings for entries ≤ 1.6.2 in `changelog.md`. New entries use `##`. Old ones are never rewritten.

---

## Stale documentation (content drift — recorded, not corrected; correction is a separate owner-approved task)

### N-016
**2026-09-18 · open** — `README.md` is materially stale: "Multi-List Service" (it is Momentum Logistics Service), Next.js 14+ / React 18+ (16.1.6 / 19.2.3), root `api/` and `middleware.ts` (now `lib/api/` and `proxy.ts`), scripts that do not exist (`lint:fix`, `type-check`, `test`, `preview`), env var names that do not match (`NEXT_PUBLIC_API_BASE_URL`, `DATABASE_URL`…), "Next.js API Routes" backend (there are none), Docker/contributing sections describing a workflow not in use. Proposed: a documentation-only task to rewrite it from `ARCHITECTURE.md` and `VERIFICATION.md`.

### N-017
**2026-09-18 · open** — `docs/admin-workflow.md` describes daily Super Admin password rotation and "Developer Mode". Rotation was removed in 1.7.0; Developer Mode is not exposed in this client. Historical; marked so in `INDEX.md`.

### N-018
**2026-09-18 · open** — `docs/admin/admin.openapi.json` is a 2026-08-09 snapshot (41 KB); `../mls-server/docs/admin.openapi.json` is 2026-09-18 (60 KB) and differs. Build against the server's copy. Owner decision: refresh the snapshot, or delete it in favour of a pointer.

### N-019
**2026-09-18 · open** — `docs/prd/prd-super-admin-password-rotation.md` and the 1.2.2 changelog entry describe a removed feature. Correct as history; do not implement from them.

---

## Environment gotchas (also in `MEMORY.md`)

### N-020
**2026-09-18 · durable** — Never touch `.env*` under the owner's running dev server; `NEXT_PUBLIC_*` is inlined into Turbopack's cached chunks and outlives the file. Recovery: `rm -rf .next && bun run dev`. Canonical: [VERIFICATION.md §4](VERIFICATION.md#4-environment-rules).

### N-021
**2026-09-18 · durable** — `mls-server` on `:8000` is not always up; it has been down or 500ing (dead DB) for most of a session. `curl localhost:8000/api/admin/auth/me` → `401` means up.
