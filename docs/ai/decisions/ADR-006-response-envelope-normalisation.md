---
doc: ADR-006
purpose: "All collection responses are normalised in lib/api through envelope.ts; hooks and pages see one shape"
authority: canonical
hosts_rules: [RULE-ARCH-005]
mirrors_rules: []
last_reviewed: "2026-09-18"
---

# ADR-006 — Response envelopes are normalised once, in `lib/api`

**Status:** Accepted (recorded retroactively, 2026-09-18)
**Date:** 2026-08-10 (release 1.5.0); recorded 2026-09-18

## Decision

The server's four response envelopes and two pagination styles are normalised by `lib/api/_shared/envelope.ts` into `Paged<T> = { data: T[], pagination: { page, limit, total, totalPages } }`. Every `lib/api` function returning a collection passes through it. Hooks and pages never inspect a raw envelope, and pagination controls read `pagination.totalPages`, never row counts.

## Context

`[verified: changelog 1.5.0, lib/api/_shared/envelope.ts, types/api.ts]` — the admin API answers `{ status: "success", ...payload }`, `{ data, pagination }`, a bare array, or `{ success: true, data }` depending on which server module built the handler, and paginates as `{ page, limit, total, totalPages }` or `{ limit, offset, total }`. `[verified: changelog 1.4.0, audit R-03]` — pagination on the user sub-pages advanced past the last page because it inferred "has more" from row count.

## Rationale

`[verified: file header comment in envelope.ts]` — "rather than teach every hook and page about that, the `api/` layer funnels responses through here so everything above sees one shape."

## Options considered

Not recorded. Fixing the server's envelopes at source would be the alternative; it was not chosen for this client, and the server is a separate repository with other consumers.

## Consequences

- A new collection key on the server (`invoices`, `rules`, …) is added to `COLLECTION_KEYS` in `envelope.ts`, not special-cased in a hook.
- `Paged<T>` is the only paginated type hooks should expose.
- If the server ever standardises its envelopes, this module shrinks; nothing above it changes.

## Related

[domains/api-client.md](../domains/api-client.md), [workflows/API-INTEGRATION-WORKFLOW.md](../workflows/API-INTEGRATION-WORKFLOW.md)
