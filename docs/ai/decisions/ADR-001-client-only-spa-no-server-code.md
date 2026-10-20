---
doc: ADR-001
purpose: "mls-admin is a pure client of mls-server; it contains no server-side logic"
authority: canonical
hosts_rules: [RULE-ARCH-001]
mirrors_rules: []
last_reviewed: "2026-09-18"
---

# ADR-001 — The dashboard is a pure client; no server code lives here

**Status:** Accepted (recorded retroactively, 2026-09-18)
**Date:** In force since the project's first commit (2026-02-13); recorded 2026-09-18

## Decision

`mls-admin` contains no route handlers (`app/api/`), no server actions, no server components that fetch, and no database access. Every page is `"use client"`. All data comes from `lib/api` calls to the separate `mls-server` backend at `NEXT_PUBLIC_API_URL`. The only server-side file is `proxy.ts`, which checks cookie presence and redirects.

## Context

`[verified: app/, lib/api/index.ts, docs/review/admin-capability-audit-2026-08-09.md §2]` — the audit confirmed "there are no Route Handlers, no Server Actions, no server-side data fetching"; the tree has no `app/api/`. The backend, with its Prisma schema, auth, RBAC, carriers, payments and invoicing, is `../mls-server`, which has its own AI operating system and contract documents.

`[verified: changelog 1.6.2]` — the one time a root `api/` directory existed it was the *client*, and Vercel deployed it as serverless functions, which is what ADR-002 addresses.

## Rationale

`[inferred]` — separation of a thin admin UI from a backend shared with the customer app (`../mls-client`) and other consumers; one contract, several clients. Rationale was not recorded at the time; the decision is in force and reversal would be expensive (every hook and type assumes the external contract).

## Options considered

Not recorded.

## Consequences

- The server contract (`../mls-server/docs/admin.openapi.json`) is the source of truth for every endpoint ([RULE-ARCH-004](../RULES.md#rule-arch-004)); the dashboard cannot define behaviour the server does not expose.
- Security is enforced by the server; every client-side gate is UX ([RULE-SEC-002](../RULES.md#rule-sec-002)).
- A "new feature" often means consuming an endpoint that already exists — check the audit's §6 before proposing server work.
- Adding any server code here — a route handler as a proxy, a server action — would violate this decision and requires a superseding ADR approved by the owner.

## Related

[ARCHITECTURE.md §1–2](../ARCHITECTURE.md), [ADR-002](ADR-002-api-client-under-lib-not-root-api.md), [domains/api-client.md](../domains/api-client.md)
