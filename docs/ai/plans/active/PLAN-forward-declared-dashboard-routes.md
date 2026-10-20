---
doc: PLAN-forward-declared-dashboard-routes
purpose: "Backlog of dashboard modules the guard already declares and the server already serves, but which have no page"
authority: reference
hosts_rules: []
mirrors_rules: []
last_reviewed: "2026-10-14"
status: completed
---

# Plan: Forward-declared dashboard routes

**Status:** COMPLETED in 1.8.0 (2026-10-14). The owner asked for every remaining staff screen to be built; all seven routes have pages, plus the shipment history and Mark Completed adoptions. Not adopted: `POST /developer-mode` (removed from the server), `GET /users/{identifier}`, and the bulk-delete wiring. Kept below as the record of the original backlog.

**Original status:** PROPOSED — not started; not owner-prioritised. This is a backlog reconstructed from the code and the 2026-08-09 audit, `[inferred]` as intended work. It becomes active only when the owner picks an item; each item is a **new product capability** and goes through [workflows/PRD-WORKFLOW.md](../../workflows/PRD-WORKFLOW.md) before any implementation.

## Objective

Bring the seven routes that `components/permission-guard.tsx` already gates — and that the server already exposes — to a real page, one at a time, in owner-chosen order.

## Evidence

`[verified: components/permission-guard.tsx]` — `routePermissions` declares `/dashboard/settings` (`staff:write`), `/dashboard/emails` (`email:read`), `/dashboard/inquiries` (`inquiries:read`), `/dashboard/activity-logs` (`staff:read`), `/dashboard/invoices` (`shipment:read`), `/dashboard/refunds` (`shipment:read`), `/dashboard/tax-rules` (`shipment:read`). `[verified: app/dashboard/]` — none has a `page.tsx`. `[verified: lib/api/_shared/envelope.ts]` — `COLLECTION_KEYS` already lists `templates`, `invoices`, `inquiries`, `rules`, `logs`, anticipating them. `[verified: audit §6]` — server endpoints with no client: `GET/POST /emails/templates`, `GET/PUT /settings`, `POST /developer-mode`, `GET /shipments/{id}` (with audit logs), `POST /shipments/{id}/complete`, `GET /users/{identifier}`.

## Scope (candidate items — owner to order)

| # | Route | Server surface (verify against current `admin.openapi.json`) | Notes |
|---|---|---|---|
| 1 | `/dashboard/settings` | `GET/PUT /admin/settings` | Gated on `staff:write` (server gates the GET on write). `passwordRotationFrequency` no longer applies post-1.7.0 — confirm what settings remain |
| 2 | `/dashboard/emails` | `GET/POST /admin/emails/templates` | Permissions `email:read`/`email:write` exist in the catalogue |
| 3 | `/dashboard/inquiries` | `inquiries` collection | `inquiries:*` added to catalogue in 1.6.0 |
| 4 | `/dashboard/activity-logs` | `logs` collection | Would also resolve the staff detail sheet's permanent "preparing the audit infrastructure" spinner (NOTES N-001) |
| 5 | `/dashboard/invoices` | `invoices` collection | Server has Faktura.pl invoicing (see `../mls-server/docs/ai/domains/invoicing-and-tax.md`) |
| 6 | `/dashboard/refunds` | to be confirmed | `REFUNDED` payment status exists in `lib/shipment-status.ts` |
| 7 | `/dashboard/tax-rules` | `rules` collection | Server has a VAT tax engine |

Also from the audit, smaller than a module: adopt `GET /shipments/{id}` in the detail sheet for per-shipment audit logs; add one-click `POST /shipments/{id}/complete`; adopt `GET /users/{identifier}` instead of `useUsers({ search, limit: 1 })`; wire `bulkDeleteUsers` / `forceDeleteUser` / `bulkDeleteLeads` to the existing `BulkDeleteBar`. These are **enhancements** (WORKFLOW §4.3), not new capabilities.

## Non-goals

- Building all seven at once.
- Any server change — this repository consumes; server work is a `../mls-server` task.
- Removing the forward declarations from the guard. They are harmless and document intent.

## Dependencies

- Current server contract for each endpoint group.
- Owner's priority order.
- Sidebar placement (Operations / Growth / Configuration / System) per item.

## Acceptance (per item, defined in its PRD)

Route renders; guarded correctly for a non-super-admin role; every mutation wrapped in `<Can>`; collection normalised via `envelope.ts`; typecheck + lint clean; verified in the running app; changelog entry; `ARCHITECTURE.md §6` route table updated; sidebar entry added.

## Owner decisions required

1. Which item first, if any.
2. Whether `/dashboard/settings` still has a purpose after password rotation was removed.
