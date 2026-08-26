# MLS Admin Dashboard — Capability Audit & Forward Plan

**Date:** 2026-08-09
**Branch:** `dev` @ `fc2213e`
**App version:** `package.json` says `0.5.1`; `changelog.md` says `1.3.0` (see Defect D-12)
**Scope:** Everything the admin dashboard can currently do — authentication, authorization, every module, every mutation, every business rule encoded in the client — plus verified defects and a forward roadmap.

---

## 1. Executive summary

The admin dashboard is a **Next.js 16 App Router client-side SPA** that is a pure consumer of a separate Express/Postgres backend. It holds no server-side logic of its own: there are no Route Handlers, no Server Actions, no server-side data fetching. Every page is `"use client"`, every byte of data comes from `axios` → `NEXT_PUBLIC_API_URL`.

**What works today:** 9 functional screens covering user moderation, address verification, full shipment lifecycle control (including creating shipments on a user's behalf), marketing-lead management, carrier + commission configuration, staff/role RBAC administration, super-admin credential rotation, and a self-service admin profile.

**The three things that matter most:**

1. **Authorization is read-only theatre.** The permission catalog defines `user:write`, `shipment:write`, `carrier:write`, `staff:write`, `leads:write` — and **not one of them is checked anywhere in the application**. Any staff member who can *view* a page can ban users, delete shipments, bypass payments, and rewrite commission rates. The only real enforcement is whatever the backend does. (Defect D-01.)
2. **Two admin flows are wired to endpoints that don't match the API contract**, and one flow silently does nothing. Bulk delete, force delete, and "Create & Bypass Payment" are all affected. (Defects D-02, D-03, D-04.)
3. **Two pages crash on load** due to a React Rules-of-Hooks violation that ESLint would have caught — except ESLint itself is broken in this repo and cannot run. (Defects D-05, D-06.)

---

## 2. Architecture & request pipeline

```
Browser
  └─ Next.js middleware.ts        ← cookie presence check only
     └─ app/dashboard/layout.tsx
        ├─ AdminSidebar           ← RBAC link visibility
        ├─ AdminTopbar            ← profile drawer, logout
        └─ PermissionGuard        ← RBAC route redirect
           └─ page.tsx ("use client")
              └─ hooks/**         ← TanStack Query
                 └─ api/**        ← pure axios functions
                    └─ api/index.ts (apiClient)
                       └─ NEXT_PUBLIC_API_URL  (external Express API)
```

**Layer discipline** ([`.agent/rules/api-integration-guide.md`](.agent/rules/api-integration-guide.md)) is followed consistently: `types/` → `api/` → `hooks/` → page. Components never call axios directly. The one exception is [`app/dashboard/address-requests/page.tsx:196`](app/dashboard/address-requests/page.tsx:196), which imports `getAddressRequestProofFile` directly to stream a blob — justified, since a binary download doesn't fit the query cache.

### The API client ([`api/index.ts`](api/index.ts))

| Behaviour | Implementation |
|---|---|
| Base URL | `process.env.NEXT_PUBLIC_API_URL` |
| Auth header | Request interceptor reads `accessToken` cookie → `Authorization: Bearer <token>` |
| Credentials | `withCredentials: true` (cookies also sent) |
| Error normalisation | Response interceptor rewrites `error.message` from `data.details ?? data.message ?? data.error` |
| 401 handling | Clears `accessToken` cookie, hard `window.location.href = "/login"` |

The 401 handler deliberately clears the cookie *before* redirecting to avoid a redirect loop with the middleware — a correct and non-obvious detail.

### Client state

TanStack Query with a 60s default `staleTime` and `retry: 1` ([`components/providers.tsx`](components/providers.tsx)). No Zustand store is actually used despite `zustand` being a dependency. All mutations invalidate by query key and surface `react-hot-toast` feedback from inside the hook, not the component.

---

## 3. Authentication

### 3.1 The login flow

| Step | Detail |
|---|---|
| Screen | [`app/login/page.tsx`](app/login/page.tsx) — split-screen, `react-hook-form` + `zod` |
| Validation | Email format + non-empty password. Client-side only. |
| Request | `POST /auth/login` → `{ admin, token }` |
| Token storage | `Cookies.set("accessToken", token, { expires: 7 })` — **7-day non-httpOnly cookie** |
| Cache seed | `queryClient.setQueryData(["me"], data.admin)` |
| Redirect | `router.push("/dashboard")` |

There is **no self-service registration** — the login page explicitly states admins must have been emailed credentials. There is **no forgot-password flow**: the "Forgot password?" button at [`app/login/page.tsx:243`](app/login/page.tsx:243) is a `<button type="button">` with no `onClick`. It is decorative.

### 3.2 Session model

- **Single opaque bearer token**, no refresh token, no silent renewal. When the token expires the user is bounced to login mid-action.
- Cookie is set by JavaScript, so it is **readable by any script on the origin** — no `httpOnly`, no `secure`, no `sameSite`. See Defect D-07.
- `useMe()` (`GET /auth/me`) with `retry: false` and a 5-minute `staleTime` is the single source of identity, role, and permissions.
- Logout (`POST /auth/logout`) uses `onSettled`, so the client-side session is destroyed even if the server call fails — the right call for a logout button.

### 3.3 Route protection ([`middleware.ts`](middleware.ts))

```ts
matcher: ["/dashboard/:path*", "/login"]
```

- No token + protected route → redirect `/login`
- Token + `/login` → redirect `/dashboard`
- Accepts **either** `accessToken` **or** `token` cookie names

This is a **presence check, not a validity check**. The middleware never decodes or verifies the JWT. Any non-empty cookie named `accessToken` grants entry to the dashboard shell; the app then renders and every API call 401s, dumping the user back to login. It's a UX guard, not a security boundary — acceptable given the backend is the real authority, but worth naming explicitly.

### 3.4 Emergency credential recovery

A **Super Admin password rotation** mechanism exists in two places:

| Location | Access |
|---|---|
| [`app/login/page.tsx`](app/login/page.tsx) — "Rotate Super Admin Access" dialog | **Public, unauthenticated** |
| [`app/dashboard/security/page.tsx`](app/dashboard/security/page.tsx) | Super Admin only |

Both call `POST /security/rotate` with an **8-character Weekly Reset Key** (auto-uppercased, max length 8, masked by default with a reveal toggle). Both are gated behind a `ConfirmDialog` warning that all active Super Admin sessions terminate immediately and new credentials go to the registered email. The page copy states the backend also rotates automatically every 24 hours.

The public endpoint is the deliberate design (it's the "locked out of everything" escape hatch), and its only protection is the secrecy and entropy of the 8-character key. There is **no client-side rate limiting or attempt throttling** — this must be enforced server-side.

---

## 4. Authorization (RBAC)

### 4.1 The permission model

Three enforcement layers exist. Only two do anything.

**Layer 1 — `usePermissions()` ([`hooks/use-permissions.ts`](hooks/use-permissions.ts))**

```ts
if (user?.role === "Super Admin") return true;   // string-equality god mode
return user?.permissions?.includes(permissionId) ?? false;
```

Exposes `hasPermission`, `hasAnyPermission`, `hasAllPermissions`. The Super Admin bypass is a **hardcoded string comparison against the role name** — renaming the role in the database silently revokes all super-admin access in the UI.

**Layer 2 — Sidebar visibility ([`components/admin-sidebar.tsx`](components/admin-sidebar.tsx))**

Unauthorized links are greyed out, given a padlock icon, `href="#"`, and a `preventDefault` click handler. Cosmetic — it hides doors, it doesn't lock them.

**Layer 3 — `PermissionGuard` ([`components/permission-guard.tsx`](components/permission-guard.tsx))**

Redirects to `/dashboard/denied` on direct URL access. Route map:

| Route | Required permission | Notes |
|---|---|---|
| `/dashboard/users` | `user:read` | |
| `/dashboard/address-requests` | `user:read` | Reuses the user permission |
| `/dashboard/staff` | `staff:read` | |
| `/dashboard/shipments` | `shipment:read` | |
| `/dashboard/leads` | `leads:read` | |
| `/dashboard/carriers` | `carrier:read` | |
| `/dashboard/settings` | `email:read` | **Route does not exist** |
| `/dashboard` (root) | — | **Unguarded** |
| `/dashboard/security` | — | Unguarded here; page self-guards on `role === "Super Admin"` |

### 4.2 The permission catalog

Fetched live from `GET /staff/roles/permissions`; a static mirror lives at [`docs/admin/permissions.ts`](docs/admin/permissions.ts). Seven groups, fourteen permissions — a `:read`/`:write` pair for Users, Shipments, Staff, Carriers, Leads, Emails, plus a lone `dashboard:read`.

The sidebar references **`system:security`**, which does not exist in the catalog. Because it can never be granted, `hasPermission("system:security")` is always `false` for non-Super-Admins — which happens to produce the intended behaviour, but by accident rather than design.

### 4.3 The critical gap

> **No `:write` permission is enforced anywhere in the application.**

Verified by exhaustive grep: the only consumers of `*:write` strings are [`components/admin-profile/DocsViewer.tsx`](components/admin-profile/DocsViewer.tsx), which uses them to decide which *help articles* to show. Every destructive control — Ban User, Delete User, Delete Shipment, Bulk Delete, Override Status, Bypass Payment, Update Commissions, Create/Delete Role, Suspend Staff, Approve/Reject Address — renders unconditionally for anyone holding the matching `:read` permission.

A "Support Agent" role granted `user:read` + `shipment:read` for a helpdesk can, today, permanently delete every user and shipment in the system through the UI. Whether the request succeeds depends entirely on backend middleware this repo cannot see.

---

## 5. Capability inventory

### 5.1 Dashboard overview — `/dashboard`

**Read-only.** No mutations.

- Five stat cards from `GET /dashboard/stats` (5-min `staleTime`): **Revenue** (multi-currency map, `LMP` currency filtered out), Total Users, Total Shipments, Marketing Leads, Active Shipments.
- Three "recent activity" panels, each capped at 5 rows: latest shipments (tracking #, user, price, date), latest leads (name/guest, route, converted badge), latest signups (name, email, userCode).
- Currency rendering is locale-aware: `pl-PL` for PLN, `en-IE` otherwise.
- Copy-to-clipboard on tracking numbers and user codes.

### 5.2 Users — `/dashboard/users`

**List:** paginated (10/20/30/50 per page), 500 ms debounced search, status filter (`ALL`/`ACTIVE`/`FLAGGED`/`WARNED`/`BANNED`). Columns: name (links to detail), email + verification badge, userCode, joined, last login, last active.

**Actions available (all behind `ConfirmDialog`):**

| Action | Endpoint | Business rule |
|---|---|---|
| Manual Verify | `POST /users/{id}/verify` | Copy states "cannot be undone" |
| Ban User | `PUT /users/{id}/status` | **Hardcoded to `{ status: "BANNED", banType: "FULL" }`** |
| Delete User | `DELETE /users/{id}` | Warns all shipments/estimates are lost |

**What the backend supports but the UI cannot do:**
- Set `FLAGGED` or `WARNED` status — the filter offers them, the actions don't set them.
- **Un-ban / restore a user to `ACTIVE`.** `BanUserPayload` is typed `status: "BANNED"` only. Banning is a one-way door in this UI.
- Issue a `PARTIAL` ban — the type allows it, no control exposes it.
- Bulk-delete users, or force/cascade-delete. `bulkDeleteUsers` and `forceDeleteUser` exist in [`api/users/index.ts`](api/users/index.ts) but have **no hook and no UI**.

**User detail — `/dashboard/users/[id]`** (keyed by `userCode`, resolved via a `useUsers({ search: userCode, limit: 1 })` lookup):
Profile card (identity, verification, phone verification, ban type, joined/last-active/last-login), "Verify User" button when unverified, "Create Shipment" deep-link that pre-selects the user, plus 5-row Recent Shipments and Recent Estimates panels with drill-down sheets.

**Sub-pages:** `/dashboard/users/[id]/shipments` and `/dashboard/users/[id]/estimates` — paginated (10/page) full lists with a compact `UserInfoHeader`. **Both currently crash — see D-05.**

### 5.3 Address verification requests — `/dashboard/address-requests`

Full review workflow, and the most defensively written module in the codebase (it tolerates three different response envelope shapes from the API).

- **List:** paginated, status filter (`ALL`/`PENDING`/`APPROVED`/`REJECTED`), manual Refresh button.
- **Detail sheet:** request snapshot, submitted vs. current active address, decision timeline (uses server `timeline` if present, otherwise synthesises a two-event fallback from `createdAt`/`reviewedAt`).
- **Proof file:** `GET /address-requests/{id}/proof-file` streamed as a blob → `URL.createObjectURL` → opened in a new tab, with popup-blocker detection and a 60-second `revokeObjectURL` cleanup. Careful work.
- **Decisions:** Approve (notes optional) / Reject (**notes required**, enforced client-side at [`app/dashboard/address-requests/page.tsx:213`](app/dashboard/address-requests/page.tsx:213)). Buttons only render when `status === "PENDING"`.

### 5.4 Shipments — `/dashboard/shipments`

The most powerful module.

**List:** paginated (10/20/30/50), 500 ms debounced search across tracking number / user name / email / userCode. Columns: tracking # (copyable), user + userCode, route, shipment status, payment status, date. Row click opens the detail sheet; multi-select checkboxes drive a floating `BulkDeleteBar`.

**Detail sheet ([`components/shipments/shipment-detail-sheet.tsx`](components/shipments/shipment-detail-sheet.tsx))** shows status/payment/manual-override badges, **source-estimate correlation**, both tracking numbers, both addresses with contacts, package weight/dimensions, carrier price vs. actual price, user block, timestamps, and a "View Shipping Label" link when `labelUrl` exists.

**Admin actions:**

| Action | Endpoint | Business rules encoded in the UI |
|---|---|---|
| **Manual status override** | `PUT /shipments/{id}/manual-status` | 7 statuses (`CREATED`→`FAILED`) each with a description. Always sends `manualOverride: true`. Toggle **Carrier Tracking Sync** (when off, carrier webhooks are ignored). Toggle **Notify User** (email on/off, defaults on). Destructive warning banner for `CANCELLED`/`FAILED`. Submit disabled unless the status actually changed. |
| **Bypass payment** | `POST /shipments/{id}/bypass-payment` | Requires a manual transaction ID; optional notes. Button only renders when `paymentStatus !== "PAID"`. |
| **Delete** | `DELETE /shipments/{id}?force=` | `ConfirmDialog` with a **Force Mode** switch that cascades past terminal-status checks. |
| **Bulk delete** | `POST /shipments/bulk-delete` | Same force toggle, applied to the selection. |

**Creating a shipment on behalf of a user — `/dashboard/shipments/new`**

A 5-step wizard with per-step validation gates:

1. **Select User** — debounced search over `/users`; accepts `?userCode=` to pre-select and jump straight to step 2.
2. **Addresses** — pickup (defaults `countryCode: "PL"`) + dropoff. Gate: street1, city, state, postalCode, countryCode required on both.
3. **Package** — weight (KG/LB) + L×W×H (CM/IN). Gate: all four values > 0.
4. **Rates** — `POST /shipping/estimates` (the *same* endpoint the public website uses) returns live carrier rates; admin picks one. Failure offers "Edit Addresses".
5. **Confirm** — review, then `POST /shipments/proxy`.

**Payload gaps at step 5.** The API's `ProxyShipment` schema accepts `rate.actualPrice`, `rate.currency`, and `estimateId`. The client sends **only** `serviceType`, `serviceName`, and `carrierPrice`:

- **`currency` is never sent** — the schema defaults to PLN. An admin who selects a EUR-denominated rate creates a PLN-priced shipment. (Defect D-08.)
- **`estimateId` is never sent** — which is precisely why [`utils/estimate-shipment-correlation.ts`](utils/estimate-shipment-correlation.ts) has to exist.

### 5.5 The estimate ↔ shipment correlation engine

Because shipments aren't reliably linked to the estimate that produced them, [`utils/estimate-shipment-correlation.ts`](utils/estimate-shipment-correlation.ts) reconstructs the link heuristically:

1. **Direct link first** — match on `shipment.estimateId === estimate.id`.
2. **Fallback fuzzy match** — all of: shipment created at/after the estimate, pickup city+country match, dropoff city+country match, and the shipment's `serviceType` appears among the estimate's offered rates. Ties broken by temporal proximity.

This is honest, well-documented code doing a job the data model should be doing. It powers the "Source Estimate" panel, the "Conversion" column, and the `ConversionBadge`. It is also inherently lossy: two shipments on the same route with the same service on the same day are indistinguishable.

Its cost is visible in the queries: the leads page fetches a **200-row shipment pool** purely for correlation ([`app/dashboard/leads/page.tsx:106`](app/dashboard/leads/page.tsx:106)), and the shipments page fires a **100-row lead fetch per selected row**.

### 5.6 Marketing leads / shipping estimates — `/dashboard/leads`

**List:** paginated, debounced search over email / phone / name / guest ID. Distinguishes authenticated users (name + userCode) from guests (`GUEST` badge + email, or truncated guest ID). Shows route, weight, best rate, conversion badge, date.

**Detail sheet:** full rate breakdown, linked-shipment panel, and a dedicated guest-contact block with one-click copy — the lead-gen use case is clearly understood here.

**Actions:** Delete a single lead (`DELETE /leads/{id}`) behind a `ConfirmDialog`.

**Unused capability:** `bulkDeleteLeads` exists in [`api/leads/index.ts`](api/leads/index.ts) with no hook and no UI. Backend filters `converted`, `isGuest`, `startDate`, `endDate` are typed in `LeadFilter` but no control sets them.

### 5.7 Carriers & commissions — `/dashboard/carriers`

**List** with proactive health monitoring — two banner conditions:
- *System Warning*: no carrier is both active and has a slug → "Users will not be able to get shipping estimates."
- *Configuration Error*: N carriers are missing a programmatic slug.

**Carrier CRUD** via a tabbed sheet:

*Integration Details tab* — name, **programmatic slug** (dropdown of `fedex`/`dhl`/`inpost` from [`api/carriers/constants.ts`](api/carriers/constants.ts), plus "Other / Custom"), base URL, API key, API secret, active toggle.

Business rules enforced client-side:
- Custom slugs are auto-lowercased and kebab-cased on input.
- **A custom slug must contain the carrier name** — submit is blocked otherwise ([`components/carriers/carrier-detail-sheet.tsx:429`](components/carriers/carrier-detail-sheet.tsx:429)).
- **Secrets are write-only**: fields render empty with an "Unchanged" placeholder in edit mode and are only included in the payload when non-empty, so saving never blanks a stored key. Correct design.
- Deletion warns it will be blocked server-side if active shipments exist.

*Commissions tab* — two stacked editors:

**A. Four-stage commission rates** (`PUT /carriers/update-carrier-commissions/{id}`), one per route class:

| Stage | Route | Allowed currency (UI) |
|---|---|---|
| Local | PL → PL | PLN, EUR |
| Export | PL → World | EUR |
| Import | World → PL | EUR |
| International | World → World | EUR |

Each is `PERCENT` or `FIXED`. Switching to `FIXED` auto-defaults currency to PLN for Local, EUR otherwise. Switching to `PERCENT` deletes the currency field.

**B. Minimum-threshold safety nets** (`PUT /settings/commission/{carrierId}`) — a three-tier fallback hierarchy:

```
Global Safety Net   (PUT /settings/global-commission)
   ↓ overridden by
Carrier Fallback    (per-carrier default)
   ↓ overridden by
Route-Specific      (per carrier × per route class)
```

Each tier stores a min rate threshold + flat commission in **PLN**, with an `isEurManual` switch that disables automatic PLN→EUR conversion and reveals manual EUR fields. That's 5 global fields + 25 per-carrier fields.

**Save orchestration:** [`carrier-detail-sheet.tsx`](components/carriers/carrier-detail-sheet.tsx) fires **three sequential `mutateAsync` calls** on save (profile → commissions → thresholds), or four on create. These are not transactional — a failure at step 2 leaves the carrier profile updated with stale commissions. (Risk R-02.)

### 5.8 Staff & roles (RBAC administration) — `/dashboard/staff`

Two tabs.

**Staff Members tab** — table of adminCode, name, email, role, active/suspended, last active.

| Action | Endpoint |
|---|---|
| Create staff | `POST /staff/create-new-staff` |
| Change role | `PUT /staff/assign-staff-role/{id}` (with **Notify** email toggle) |
| Suspend | `PUT /staff/suspend-staff/{id}` |
| Enable | `PUT /staff/enable-staff/{id}` |
| Delete | `DELETE /staff/delete-staff/{id}` |

**Inline role creation** is the standout feature: when adding staff, a switch flips the "Initial Role" dropdown into a full role builder (name + `PermissionSelector`), creating the role and the staff member in one call via the `inlineRole` payload field.

**Business rule:** `isProtected(s) => s.role.name === "Super Admin"` — the entire actions dropdown is hidden for Super Admins. Same string-matching fragility as the permission bypass. Note this protects the *role*, not *self*: an admin can suspend or delete their own account if they aren't a Super Admin.

**Role Management tab** — full CRUD over roles with the grouped `PermissionSelector` (per-group select-all/deselect-all, descriptions on every permission). The "Super Admin" role row hides its actions menu, and its name field is disabled even if the dialog is forced open. Deletion copy warns it will fail if staff are assigned.

**Staff detail sheet** shows identity, access status, and granted permissions. Its **"Recent Activity" tab is a permanent fake loading spinner** with placeholder copy — see D-09.

### 5.9 Security — `/dashboard/security`

Super-Admin-only (self-guarded, not in the `PermissionGuard` map). Explains the rotation policy (automatic every 24h, manual via the 8-char Weekly Reset Key emailed Mondays), takes the key, and fires `POST /security/rotate` behind a `ConfirmDialog`. A decorative "AUDIT_LEVEL: HIGH" panel at the bottom is static markup, not live data.

### 5.10 Admin self-service profile

Opened from the topbar avatar → `AdminProfileDrawer`, three tabs:

- **Profile** — name, email (explicitly read-only: "Email modifications are disabled"), role.
- **Security** — change own password (`PUT /staff/me/password`), min 8 characters, client-validated.
- **Activity** — own audit log (`GET /staff/me/activity`), paginated with accumulate-on-"Load More", expandable JSON detail per entry, defensive timestamp parsing that falls back to "Unknown time" on invalid dates.

Below the tabs, `DocsViewer` renders **permission-aware documentation** — seven accordion sections that hide themselves if the viewer lacks the relevant permission. Notably, this is the *only* place `:write` permissions are consulted.

---

## 6. Complete API surface

38 distinct endpoints are wired. `†` = implemented in `api/` but **unreachable from the UI** (no hook or no control).

| Domain | Method + Path | UI entry point |
|---|---|---|
| Auth | `POST /auth/login` | Login page |
| | `POST /auth/logout` | Topbar dropdown |
| | `GET /auth/me` | Global (`useMe`) |
| Dashboard | `GET /dashboard/stats` | Dashboard cards |
| Users | `GET /users` | Users list, user detail, wizard step 1 |
| | `PUT /users/{id}/status` | Ban User |
| | `POST /users/{id}/verify` | Manual Verify |
| | `DELETE /users/{id}` | Delete User |
| | `POST /admin/users/{id}/cascade` | **†** no hook |
| | `POST /admin/users/bulk-delete` | **†** no hook |
| Address | `GET /address-requests` | List |
| | `GET /address-requests/{id}` | Detail sheet |
| | `GET /address-requests/{id}/proof-file` | View Proof |
| | `POST /address-requests/{id}/approve` | Approve |
| | `POST /address-requests/{id}/reject` | Reject |
| Shipments | `GET /shipments` | List, user sub-pages, correlation pool |
| | `POST /shipments/proxy` | Create wizard |
| | `POST /shipments/{id}/bypass-payment` | Bypass modal |
| | `PUT /shipments/{id}/manual-status` | Override modal |
| | `DELETE /shipments/{id}` | Delete (non-force) |
| | `DELETE /admin/shipments/{id}` | Delete (force path) |
| | `POST /admin/shipments/bulk-delete` | BulkDeleteBar |
| Shipping | `POST /shipping/estimates` | Wizard step 4 |
| Leads | `GET /leads` | List, user sub-pages, correlation |
| | `DELETE /leads/{id}` | Delete Lead |
| | `POST /admin/leads/bulk-delete` | **†** no hook |
| Carriers | `GET /carriers/get-all-carriers` | List |
| | `GET /carriers/get-single-carrier/{id}` | **†** unused export |
| | `POST /carriers/create-new-carrier` | Add Carrier |
| | `PUT /carriers/update-carrier/{id}` | Save Changes |
| | `PUT /carriers/update-carrier-commissions/{id}` | Commissions tab |
| | `DELETE /carriers/delete-carrier/{id}` | Delete |
| Settings | `GET/PUT /settings/global-commission` | Global Safety Net sheet |
| | `GET/PUT /settings/commission/{carrierId}` | Threshold editor |
| Staff | `GET /staff/get-all-roles` | Roles tab, role dropdowns |
| | `POST /staff/create-new-role` | Create Role |
| | `PUT /staff/update-role/{id}` | Edit Role |
| | `DELETE /staff/delete-role/{id}` | Delete Role |
| | `GET /staff/roles/permissions` | PermissionSelector |
| | `GET /staff/get-all-staff` | Staff tab |
| | `POST /staff/create-new-staff` | Add Staff |
| | `PUT /staff/assign-staff-role/{id}` | Change Role |
| | `PUT /staff/suspend-staff/{id}` | Suspend |
| | `PUT /staff/enable-staff/{id}` | Enable |
| | `DELETE /staff/delete-staff/{id}` | Delete |
| Profile | `GET /staff/me/profile` | **†** hook exists, drawer uses `useMe` instead |
| | `PUT /staff/me/password` | Password tab |
| | `GET /staff/me/activity` | Activity tab |
| Security | `POST /security/rotate` | Login dialog + Security page |

### Backend endpoints with **no** client implementation at all

From [`docs/admin/admin.openapi.json`](docs/admin/admin.openapi.json):

| Endpoint | What's missing |
|---|---|
| `GET /shipments/{id}` | Single-shipment fetch **with audit logs**. The UI passes list rows into the detail sheet instead, so it never sees per-shipment audit history. |
| `POST /shipments/{id}/complete` | One-click "Mark as Completed" + notify. Admins must use the generic override modal. |
| `GET /users/{identifier}` | Single-user fetch. The UI does `useUsers({ search: userCode, limit: 1 })` and filters client-side. |
| `GET/POST /emails/templates` | **Entire email-template module missing.** `email:read`/`email:write` permissions exist, `PermissionGuard` maps `/dashboard/settings`, but the route was never built. |
| `GET/PUT /settings` | System settings incl. `passwordRotationFrequency` (HOURLY/DAILY/WEEKLY/MONTHLY). Not exposed. |
| `POST /developer-mode` | Not exposed. |

---

## 7. Verified defects

Ranked by blast radius. Everything below was confirmed by reading the code, not inferred.

### D-01 — No write-permission enforcement anywhere · **Critical**
`user:write`, `shipment:write`, `carrier:write`, `staff:write`, `leads:write`, `email:write` are defined in the catalog and checked **zero** times outside `DocsViewer`'s help-article visibility. A role with only `:read` permissions renders every destructive control. **Failure:** a support-tier admin granted `shipment:read` opens `/dashboard/shipments`, selects all rows, and bulk-deletes with Force Mode on. The UI presents no barrier.

### D-02 — Bulk delete and force delete use a doubled `/admin` path segment · **Critical**
[`api/shipments/index.ts`](api/shipments/index.ts) calls both `/shipments/${id}` **and** `/admin/shipments/${id}` for the same resource. Same pattern in [`api/users/index.ts`](api/users/index.ts) (`/admin/users/{id}/cascade`, `/admin/users/bulk-delete`) and [`api/leads/index.ts`](api/leads/index.ts) (`/admin/leads/bulk-delete`). The OpenAPI spec declares base `/api/admin` with paths `/shipments/bulk-delete`, `/users/{id}/cascade`, `/leads/bulk-delete` — no second `admin` segment. If `NEXT_PUBLIC_API_URL` ends in `/api/admin`, these resolve to `/api/admin/admin/...`. **Failure:** an admin selects 20 shipments, confirms bulk delete, sees a 404 toast — while single delete on the same page works, making it look like a data problem rather than a routing bug. Resolve against the deployed `NEXT_PUBLIC_API_URL` before changing anything; the internal inconsistency is the tell either way.

### D-03 — "Create & Bypass Payment" silently does not bypass payment · **High**
[`app/dashboard/shipments/new/page.tsx:159`](app/dashboard/shipments/new/page.tsx:159): `handleCreate(bypass: boolean)` never reads `bypass`. Both buttons run identical code; `POST /shipments/{id}/bypass-payment` is never called. The `createMode` state declared at line 106 is set nowhere and read nowhere. **Failure:** admin creates a shipment for a prepaid corporate client via "Create & Bypass", sees a success toast and a redirect, and the shipment sits in `PENDING` payment — silently unfulfilled.

### D-04 — Safe-delete user path may not match the API contract · **High**
The client calls `DELETE /users/{id}`. The OpenAPI spec documents safe delete as `DELETE /users/{id}/verify` (an odd path, but explicitly summarised "Safe Delete User — deletes a user only if they have no active/in-transit shipments"). Needs confirmation against the live backend; if the spec is current, the Delete User action in the users table is dead.

### D-05 — Rules-of-Hooks violation crashes two pages · **High**
[`app/dashboard/users/[id]/shipments/page.tsx:107`](app/dashboard/users/[id]/shipments/page.tsx:107) and [`app/dashboard/users/[id]/estimates/page.tsx:110`](app/dashboard/users/[id]/estimates/page.tsx:110) both call `useMemo` **after** two early returns (`if (userLoading)`, `if (!user)`). First render (loading) skips the hook; second render (loaded) calls it. **Failure:** React throws *"Rendered more hooks than during the previous render"* the instant the user query resolves — so the "See All" pages for a user's shipments and estimates white-screen every time. Fix: hoist both `useMemo` calls above the early returns.

### D-06 — ESLint cannot run · **High**
`bun run lint` dies with `ERR_PACKAGE_PATH_NOT_EXPORTED: './v4/core' is not defined by "exports" in zod/package.json`. `zod` is pinned to `3.24.1` while `eslint-config-next@16.1.6` resolves zod v4 internals. **Consequence:** `react-hooks/rules-of-hooks` never ran, which is exactly why D-05 shipped. The pre-commit checklist in [`.agent/rules/instruction.md`](.agent/rules/instruction.md) mandates a lint pass that is currently impossible. (`bunx tsc --noEmit` does pass cleanly.)

### D-07 — Session token stored in a JavaScript-readable cookie · **High**
`Cookies.set("accessToken", token, { expires: 7 })` — no `httpOnly` (impossible from JS), no `secure`, no `sameSite`, 7-day lifetime, no refresh/rotation. Any XSS on the origin exfiltrates a week-long admin session. The middleware also accepts a bare `token` cookie as an alternative name, widening the surface. Proper fix: have the backend set an `httpOnly; Secure; SameSite=Strict` cookie and drop client-side token handling entirely.

### D-08 — Proxy shipment drops rate currency and estimate linkage · **Medium**
The wizard sends only `serviceType`, `serviceName`, `carrierPrice`, omitting `actualPrice`, `currency` (schema default: PLN), and `estimateId`. **Failure:** an admin selects a €45.00 international rate; the shipment is created as 45.00 **PLN** — roughly a 4× under-charge. The missing `estimateId` is also the root cause of the heuristic correlation engine's existence.

### D-09 — Staff detail "Recent Activity" is a permanent fake spinner · **Medium**
[`components/staff/staff-detail-sheet.tsx:120`](components/staff/staff-detail-sheet.tsx:120) renders an infinite `animate-spin` with "We are preparing the audit infrastructure…". It never loads because nothing is fetched. An admin auditing a staff member waits on a spinner that will never resolve. Replace with an explicit empty state until the endpoint exists.

### D-10 — Force flag accepted then discarded in two dialogs · **Medium**
[`app/dashboard/staff/roles-table.tsx:95`](app/dashboard/staff/roles-table.tsx:95) — `handleDelete(force: boolean)` ignores `force`. [`components/carriers/carrier-detail-sheet.tsx:230`](components/carriers/carrier-detail-sheet.tsx:230) — same. Neither dialog sets `enableForce`, so no toggle is shown today and behaviour is currently correct; but the signatures invite a future caller to enable the toggle and assume it works.

### D-11 — Unused-code drift · **Low**
Dead constants (`DEFAULT_PAGE_SIZE`/`PAGE_SIZE` in [`app/dashboard/shipments/page.tsx:54`](app/dashboard/shipments/page.tsx:54), both unused since `limit` is state), unused imports (`Copy`, `TrendingDown`, `UserPlus`, `Truck`, `format` in the dashboard; `Globe` in the carrier sheet), an unused `zustand` dependency, and an unused `getSingleCarrier` export.

### D-12 — Version numbers disagree three ways · **Low**
`package.json` = `0.5.1`; `AdminProfileDrawer` footer = `v0.5.1`; `changelog.md` latest entry = `1.3.0`. The changelog has been maintained while `package.json` has not, despite the SemVer rule in the project instructions.

---

## 8. Structural risks (not bugs, but they will bite)

**R-01 — Every list view refetches full pages for correlation.** The leads page pulls 200 shipments on mount; the shipments page pulls 100 leads per row selection. At a few thousand records this is a slow page; at a hundred thousand it's a timeout. The fix isn't caching — it's populating `estimateId` at creation time (D-08) so correlation becomes a join.

**R-02 — Carrier save is three non-atomic writes.** Profile → commissions → thresholds, sequentially, with no rollback. A mid-sequence failure leaves the carrier in a mixed state and the toast tells the admin only about the step that failed.

**R-03 — Client-side pagination lies on two pages.** The user shipments/estimates sub-pages compute "next enabled" from `shipments.length < PAGE_SIZE` rather than `pagination.totalPages`, so a final page with exactly 10 rows offers a Next button into an empty page.

**R-04 — Role and permission checks are string comparisons.** `role === "Super Admin"` appears in `usePermissions`, the security page, `staff-table`, and `roles-table`. Renaming that role in the database breaks super-admin access and simultaneously *unlocks* the protected staff rows.

**R-05 — No error boundaries.** A render-time throw anywhere below `PermissionGuard` white-screens the dashboard with no recovery path.

**R-06 — No tests of any kind.** No runner, no test files, no CI config in the repo.

---

## 9. Where it needs to go

### Phase 0 — Stop the bleeding (days)

1. Fix D-05 — hoist the two `useMemo` calls. Two crashed pages, five-minute fix.
2. Fix D-06 — align `zod`/`eslint-config-next` so lint runs, then add `bun run lint && bunx tsc --noEmit` to CI. This is the change that prevents the next D-05.
3. Resolve D-02 — verify the deployed `NEXT_PUBLIC_API_URL` and normalise every path to one prefix convention.
4. Fix D-03 — call `bypassPayment` after `createProxyShipment` succeeds, or remove the button.
5. Fix D-08 — send `currency`, `actualPrice`, and `estimateId` on proxy creation.
6. Replace D-09's fake spinner with an honest empty state.

### Phase 1 — Make authorization real (1–2 weeks)

1. **Gate every mutation on its `:write` permission.** Build a `<Can permission="shipment:write">` wrapper and a `usePermissionGuardedMutation` hook; wire them through every action menu, modal, and destructive button.
2. **Replace string-matched roles with a capability flag.** Have `/auth/me` return `isSuperAdmin: boolean` and delete the four `=== "Super Admin"` comparisons.
3. **Move the token to an `httpOnly; Secure; SameSite` cookie** set by the backend, and add refresh-token rotation so sessions don't hard-expire mid-edit.
4. **Add `system:security` to the permission catalog** so the sidebar entry references something real.
5. **Add self-protection rules**: an admin cannot suspend, delete, or demote their own account.

### Phase 2 — Close the capability gaps (2–4 weeks)

1. **User moderation is half-built.** Ship un-ban / restore-to-`ACTIVE`, `FLAGGED` and `WARNED` transitions, and `PARTIAL` bans. Right now banning is irreversible from the UI — that alone justifies the work.
2. **Wire the three orphaned bulk/force endpoints** (`bulkDeleteUsers`, `forceDeleteUser`, `bulkDeleteLeads`) with the `BulkDeleteBar` already built for shipments.
3. **Build the email-template module** at `/dashboard/settings` — the permission, the guard entry, and the backend endpoints all exist; only the page is missing.
4. **Expose system settings**, starting with `passwordRotationFrequency`.
5. **Adopt `GET /shipments/{id}`** in the detail sheet to surface per-shipment audit logs, and add the one-click `POST /shipments/{id}/complete`.
6. **Surface the filters the backend already supports**: shipment status + date range; lead `converted`/`isGuest` + date range.

### Phase 3 — Operational maturity (ongoing)

1. **Replace heuristic correlation with the real foreign key** once `estimateId` is populated, and delete the 200-row correlation fetches with it.
2. **Make carrier save transactional** — one endpoint accepting profile + commissions + thresholds, or a client-side rollback.
3. **Add error boundaries** per route segment.
4. **Add a test suite.** Start with the pure logic that already exists and is worth protecting: `estimate-shipment-correlation`, the commission/threshold fallback hierarchy, and `usePermissions`.
5. **Build the staff activity log view** the detail sheet already promises, and consider a global audit-trail page — every mutation in this app is high-consequence and currently only self-auditable.
6. **Reconcile versioning** — bring `package.json`, the drawer footer, and `changelog.md` back into agreement, ideally from one source.

---

## 10. Bottom line

The dashboard covers a genuinely broad operational surface — user moderation, address verification, full shipment lifecycle control including proxy creation, marketing-lead management, a three-tier commission engine, and self-service RBAC administration. The layering discipline is consistent, the commission model is thoughtfully built, and the address-request module is defensively written.

The gap is not features. It is that **the authorization model is designed but not implemented**, and that a broken lint setup let two page-crashing bugs and three misrouted endpoints ship unnoticed. Phase 0 and Phase 1 together are roughly two to three weeks, and they convert this from a capable prototype into something safe to hand to non-founder staff.
