---
doc: DECISIONS-INDEX
purpose: "Register of accepted architecture decisions; the list an agent checks before proposing a structural change"
authority: reference
hosts_rules: []
mirrors_rules: []
last_reviewed: "2026-09-18"
---

# Architecture Decision Records

All six were recorded retroactively on 2026-09-18 during adoption of the AI operating system. Each states what is `[verified]` from the code and changelog and what is `[inferred]`; none invents deliberations that did not happen. A decision stands until a new ADR, approved by the owner, marks it `Superseded by ADR-XXX`. ADRs are never edited in place to reverse them.

| ADR | Decision | Status |
|---|---|---|
| [ADR-001](ADR-001-client-only-spa-no-server-code.md) | The dashboard is a pure client of `mls-server`; no server code lives here | Accepted (retro) |
| [ADR-002](ADR-002-api-client-under-lib-not-root-api.md) | The API client lives under `lib/api/`; a root `api/` directory must never exist (Vercel function limit) | Accepted (retro) |
| [ADR-003](ADR-003-dual-git-remotes-and-no-autonomous-git.md) | Two remotes (`mls` org, `origin` personal); Git is operated only by the owner | Accepted (retro) |
| [ADR-004](ADR-004-permission-mirroring-and-wildcard-superadmin.md) | Client permission logic mirrors the server's `RbacService`; Super Admin is the `*` wildcard, not the role name | Accepted (retro) |
| [ADR-005](ADR-005-server-backed-sliding-session-cookie.md) | The cookie follows the server's sliding idle session; no fixed-lifetime cookies | Accepted (retro) |
| [ADR-006](ADR-006-response-envelope-normalisation.md) | Collection responses are normalised once in `lib/api` via `envelope.ts` | Accepted (retro) |

## When to add an ADR

Only when a decision materially shapes structure, is effectively fixed, could plausibly be re-proposed, and would be expensive to reverse ([WORKFLOW.md §7.7](../WORKFLOW.md#77-adr-discipline)). Number sequentially; never reuse a number. Format: `ADR-NNN-short-kebab-title.md` with `Status / Date / Decision / Context / Rationale / Options considered / Consequences / Related`.

Candidates deliberately **not** written today (insufficient evidence of a fixed decision, or too small): the Zustand-installed-but-unused state, the heuristic estimate↔shipment correlation (transitional by design), the sidebar grouping, the three-write carrier save (a known risk, not a decision).
