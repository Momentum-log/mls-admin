---
doc: ADR-004
purpose: "Client permission logic mirrors the server's RbacService exactly; Super Admin is identified by the * wildcard, not the role name"
authority: canonical
hosts_rules: [RULE-ARCH-003]
mirrors_rules: [RULE-SEC-002]
last_reviewed: "2026-09-18"
---

# ADR-004 — Permission checks mirror the server; Super Admin is the wildcard

**Status:** Accepted (recorded retroactively, 2026-09-18)
**Date:** 2026-08-11 (release 1.6.0); recorded 2026-09-18

## Decision

1. `hooks/use-permissions.ts` implements exactly the server's `RbacService.hasPermission` semantics: a permission is granted by the `*` wildcard, an exact match, or a `<resource>:*` wildcard. When the server's semantics change, this hook changes in the same release.
2. "Is the current admin a Super Admin" is answered by `permissions.includes("*")`. The role name `"Super Admin"` (`SUPER_ADMIN_ROLE_NAME`) is used only where the role *record* is the subject, and as a fallback for a session whose permissions failed to load.
3. Client checks are a usability boundary, not a security one. The server enforces every permission on every request.

## Context

`[verified: changelog 1.6.0, hooks/use-permissions.ts, lib/rbac.ts]` — before 1.6.0 only exact matches were understood, so a role holding `shipment:*` was shown nothing; Super Admin was identified by role name, so renaming the role would have revoked super-admin access and simultaneously unlocked the staff rows the same comparison protected; `Role.permissions` is a JSON column, so a stringified array would have made `.includes()` do substring matching. `[verified: docs/review/…audit §4.3, D-01]` — the audit found that no `:write` permission was checked anywhere, which motivated `<Can>` and the guard rework.

## Rationale

`[verified: code comments in use-permissions.ts and lib/rbac.ts]` — the client decides what an admin is shown; the server decides what they can do; divergence means controls that 403 on click or controls hidden from someone entitled to use them. Wildcard identity survives a rename; name identity does not.

## Options considered

`[verified: audit §9 Phase 1.2]` — having `/auth/me` return an `isSuperAdmin: boolean` was proposed; the wildcard approach was implemented instead, keeping the client free of a server-side flag. Rationale for choosing it over the flag: not recorded.

## Consequences

- Route guards may require multiple permissions where the server chains guards.
- The permission catalogue (`docs/admin/permissions.ts`) must track the server's; drift has produced dead entries.
- Any server-side change to permission semantics is a client change too — check `../mls-server` `RbacService` when touching this area.

## Related

[domains/rbac-permissions.md](../domains/rbac-permissions.md), [ENGINEERING.md §10](../ENGINEERING.md#10-security-and-data-handling)
