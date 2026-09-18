---
doc: DOMAIN-RBAC-PERMISSIONS
purpose: "How permission checks work on the client, the three UX gating layers, how they mirror the server, and the traps"
authority: canonical
hosts_rules: [RULE-SEC-002]
mirrors_rules: [RULE-ARCH-003]
last_reviewed: "2026-09-18"
---

# Domain: RBAC & Permissions (client side)

> The server's `RbacService` and the `requirePermission` middleware are the authority. This document describes how the client mirrors them so that what an admin is *shown* matches what they can *do*. Divergence means controls that 403 on click, or controls hidden from someone entitled to use them.

## Files

| File | Role |
|---|---|
| `hooks/use-permissions.ts` | `hasPermission`, `hasAnyPermission`, `hasAllPermissions`, `isSuperAdmin`, `permissions`, `role` |
| `lib/rbac.ts` | `SUPERUSER_WILDCARD` (`"*"`), `SUPER_ADMIN_ROLE_NAME` (`"Super Admin"`) |
| `components/permission-guard.tsx` | Per-route gate inside the dashboard layout; `routePermissions` map; `UNGUARDED` list |
| `components/admin-sidebar.tsx` | Locked entries stay visible with a tooltip naming the missing permission |
| `components/auth/can.tsx` | `<Can permission | permissions | superAdmin mode="hide" | "disable">` per-control gate |
| `components/ui/permission-selector.tsx` | Multi-select used by the role editor |
| `docs/admin/permissions.ts` | The catalogue the role editor offers (grouped `{ id, name, description }`) |
| `app/dashboard/staff/roles-table.tsx`, `staff-table.tsx` | Role and staff CRUD |

## The permission model

- Permission IDs are `<resource>:<action>` — `user:read`, `shipment:write`, `carrier:read`, `staff:write`, `leads:read`, `dashboard:read`, `email:read`, `inquiries:write`, and so on.
- A permission is granted by **any** of: the `*` wildcard, an exact match, or a `<resource>:*` wildcard. This mirrors the server exactly; before 1.6.0 only exact matches were understood, so a role holding `shipment:*` was shown nothing.
- **Super Admin is identified by holding `*`**, never by role name ([ADR-004](../decisions/ADR-004-permission-mirroring-and-wildcard-superadmin.md)). Renaming the role once revoked super-admin access *and* unlocked the staff rows the same string comparison protected. `SUPER_ADMIN_ROLE_NAME` exists only to guard the role *record* (hide its edit/delete controls; protect staff assigned to it) — the server refuses to rename or delete that role by name, so the client matches there for consistency. The name is also a fallback for `isSuperAdmin` **only** when `permissions` is empty (a session whose permissions failed to load).
- `permissions` is parsed defensively. The server column is Prisma `Json`; a role stored as a stringified array would otherwise make `.includes()` do substring matching and silently grant permissions never assigned.

## The three gating layers

1. **Route** — `PermissionGuard` wraps every dashboard page. `routePermissions` maps a route prefix to one permission or an array (array = all required, matching routes where the server chains two `requirePermission` calls: `/dashboard/shipments` needs `user:read` **and** `shipment:read`; `/dashboard/leads` needs `user:read` **and** `leads:read`). **Longest match wins** so `/dashboard` cannot shadow a more specific entry. Unauthorised → `/dashboard/denied`. `UNGUARDED` = `/dashboard/denied`, `/dashboard/security` (self-guards on Super Admin).
2. **Navigation** — the sidebar greys out and tooltips what the admin cannot open, rather than hiding it, so staff ask for access instead of assuming the feature is missing.
3. **Control** — `<Can>` around individual buttons and menu items. **Prefer `mode="disable"` for destructive actions** for the same reason.

None of these is a security boundary ([RULE-SEC-002](../RULES.md#rule-sec-002)). The server enforces on every request.

## Traps

- **`/dashboard/settings` is gated on `staff:write`** — not a typo; the server gates even the GET on a write permission.
- The catalogue in `docs/admin/permissions.ts` and the server's catalogue drift. `inquiries:*` was missing until 1.6.0; `system:security` was referenced by the sidebar for months but never existed (it "worked" only because it always evaluated false). When the server adds a permission group, add it to the catalogue **and** check `routePermissions`.
- Adding a route: add it to `routePermissions` with the permission(s) the server's middleware actually chains for that endpoint group — read `../mls-server` route definitions, do not guess. Seven routes are pre-declared without pages (see [plans/active](../plans/active/PLAN-forward-declared-dashboard-routes.md)).
- The permission guard runs client-side after `useMe` resolves; while `isLoading` it renders a spinner, not the page. Do not render permission-dependent data before `isLoading` is false.
- When verifying a permission change, test as a **non**-super-admin role. The wildcard hides every gating bug.
