---
doc: ARCHITECTURE
purpose: "The structure that actually exists: shape, boundaries, request pipeline, auth and session model, routing, environment, deployment"
authority: canonical
hosts_rules: [RULE-ARCH-001, RULE-ARCH-002, RULE-ARCH-004]
mirrors_rules: [RULE-ARCH-003, RULE-ARCH-005, RULE-SEC-002]
last_reviewed: "2026-10-14"
---

# Architecture — MLS Admin

> Describes the repository as it is on 2026-09-18 (v1.7.0). Not a history; not a file inventory. For *why* a boundary exists, follow the ADR links. For what to do inside a boundary, see the domain docs.

---

## 1. Shape

`mls-admin` is a **client-side single-page application** built with Next.js 16 App Router and deployed on Vercel. It contains **no server-side logic of its own**: no route handlers under `app/api/`, no server actions, no server components that fetch, no database. Every page is `"use client"`. Every byte of data comes from Axios calls to a separate backend ([ADR-001](decisions/ADR-001-client-only-spa-no-server-code.md), [RULE-ARCH-001](RULES.md#rule-arch-001)).

The one piece of Next.js server-side code is `proxy.ts` (the Next.js 16 replacement for `middleware.ts`), which does a cookie-presence check and redirects. It performs no data access.

```text
Browser ──▶ Next.js static/SSR shell (Vercel) ──▶ React SPA
                                                    │
                                                    │ Axios, Bearer token from cookie
                                                    ▼
                                   mls-server (Express + Prisma + PostgreSQL)
                                   NEXT_PUBLIC_API_URL = https://<host>/api
```

## 2. The backend boundary

- The backend is the sibling repository **`../mls-server`**. In development it runs on `http://localhost:8000`; `NEXT_PUBLIC_API_URL` is `http://localhost:8000/api`.
- **The server contract is the source of truth for every endpoint, payload, envelope, permission and error code** ([RULE-ARCH-004](RULES.md#rule-arch-004)): `../mls-server/docs/admin.openapi.json` (admin API), `../mls-server/docs/admin/authentication-guide.md` (v6 admin auth), `../mls-server/openapi.json` (customer API). The copy at `docs/admin/admin.openapi.json` in this repo is a **snapshot from 2026-08-09** and is behind the server's; treat it as historical.
- Every admin path carries its own `/admin` prefix (`/admin/users`, `/admin/auth/identify`). The base URL ends at `/api`. This was fixed in 1.4.0 after half the paths were prefixed and half were not.
- The backend is not always running. `curl localhost:8000/api/admin/auth/me` → `401` means up; a connection error or `500` means down (dead DB has happened). Check before diagnosing a client bug.
- Release coupling: 1.7.0 of this dashboard requires `mls-server` ≥ 6.0.0. Breaking server dependencies are declared in the changelog preamble.

## 3. Request pipeline

```text
component / page
   │  calls
   ▼
hooks/<feature>/use-<feature>.ts        TanStack Query; toasts; cache invalidation
   │  calls
   ▼
lib/api/<feature>/index.ts              pure request functions; strips secrets
   │  uses                               │  collections pass through
   ▼                                     ▼
lib/api/index.ts  (apiClient)          lib/api/_shared/envelope.ts
   • baseURL from env                    • 4 response envelopes → one shape
   • Authorization: Bearer <cookie>      • 2 pagination styles → { page, limit, total, totalPages }
   • on success: touchSession()
   • on 401 (non-credential route): stash reason, clearSession(), → /login
   • rewrites error.message to the server's wording
```

- Errors are read through `lib/api-error.ts` (`ApiErrorBody` = `{ error?, code?, details?, message?, reason?, required? }`).
- Envelope normalisation exists because the server answers in four shapes and paginates two ways ([ADR-006](decisions/ADR-006-response-envelope-normalisation.md)). Hooks and pages see `Paged<T>` only.
- The API client lives under `lib/api/`, **not** a root `api/` — Vercel treats any root `api/` as serverless functions and the Hobby plan's 12-function limit failed deployments ([ADR-002](decisions/ADR-002-api-client-under-lib-not-root-api.md), [RULE-ARCH-002](RULES.md#rule-arch-002)).

Detail: [domains/api-client.md](domains/api-client.md).

## 4. Authentication and session

- **Sign-in is email-first**: `POST /admin/auth/identify` answers with the method for that address — `PASSWORD` (staff) or `OTP` (Super Admin, code already sent) — or refuses with `404 ACCOUNT_NOT_FOUND` / `403 ACCOUNT_INACTIVE`. Super Admin has no password: emailed OTP, authenticator TOTP, or single-use backup code. `app/login/page.tsx` + `hooks/auth/use-auth.ts` + `hooks/auth/use-totp.ts`.
- **Sessions are server-backed**, one per admin, with a **one-hour sliding idle timeout**. `lib/auth/session.ts` mirrors this: the `accessToken` cookie's expiry is re-stamped on each successful response (throttled to once a minute, +120 s grace), `sameSite=strict`, `secure` over HTTPS. The token is readable by JavaScript — a known limitation, deferred (NOTES N-003).
- **The 401 contract**: every authenticated failure carries `reason` ∈ `SESSION_SUPERSEDED | SESSION_REVOKED | SESSION_EXPIRED | NO_TOKEN | INVALID_TOKEN | LEGACY_TOKEN`. The interceptor stashes it in `sessionStorage`; `components/auth/session-notice.tsx` explains it once on the login page.
- **Logout** is a real request (`POST /admin/auth/logout`, `?all=true` for everywhere); local teardown runs on `onSettled` regardless.
- `proxy.ts` matcher: `/dashboard/:path*` and `/login`. No cookie → `/login`; cookie on `/login` → `/dashboard`. It checks presence only.
- `/dashboard/security` is authenticator management for the Super Admin (enrol, confirm, backup codes shown once, regenerate/remove with a current code, sign out everywhere).

Detail: [domains/auth-session.md](domains/auth-session.md). Contract: `../mls-server/docs/admin/authentication-guide.md`.

## 5. Authorisation (RBAC)

- Permissions arrive on `/admin/auth/me` as `permissions: string[]` (parsed defensively — the server column is JSON).
- `hooks/use-permissions.ts` mirrors the server's `RbacService.hasPermission` exactly: granted by `*`, exact match, or `<resource>:*`. Super Admin is identified by the `*` wildcard, not the role name ([ADR-004](decisions/ADR-004-permission-mirroring-and-wildcard-superadmin.md)).
- Three UX layers, none of them security ([RULE-SEC-002](RULES.md#rule-sec-002)): `components/permission-guard.tsx` (per-route, longest-match, supports multi-permission routes), `components/admin-sidebar.tsx` (locked entries visible with a tooltip), `components/auth/can.tsx` (per-control, hide or disable).
- The permission catalogue the UI offers when editing roles is `docs/admin/permissions.ts`. The server's catalogue is authoritative; the two have drifted before (`inquiries:*` was missing, `system:security` never existed).

Detail: [domains/rbac-permissions.md](domains/rbac-permissions.md).

## 6. Routes and modules

| Route | Module | Guard |
|---|---|---|
| `/login` | Email-first sign-in, OTP/TOTP/backup-code, session notice | public (redirects if cookie) |
| `/dashboard` | Overview stats | `dashboard:read` |
| `/dashboard/users`, `/users/[id]`, `/users/[id]/shipments`, `/users/[id]/estimates` | User moderation, per-user shipments & estimates | `user:read` |
| `/dashboard/address-requests` | Address verification requests | `user:read` |
| `/dashboard/shipments`, `/shipments/new` | Shipment lifecycle, status override, bypass payment, proxy creation wizard | `user:read` + `shipment:read` |
| `/dashboard/multi-leg` | Hub-routed shipments queue; confirm arrival; create leg 2 (409 re-pricing decision) | `shipment:read` |
| `/dashboard/collections` | DHL first-mile collections; hub handoff (courier booking or service point) | `shipment:read` |
| `/dashboard/cancellations` | Customer cancellation requests: approve or reject | `shipment:read` |
| `/dashboard/business-upgrades` | Business account requests: NIP check, approve or reject | `user:read` |
| `/dashboard/invoices` | Invoices, detail sheet with payments, CSV export | `shipment:read` |
| `/dashboard/refunds` | Refund queue: gateway refund, retry on failure, manual payout | `shipment:read` |
| `/dashboard/tax-rules` | VAT rules per route and customer type | `shipment:read` |
| `/dashboard/inquiries` | Partner enquiries and their status | `inquiries:read` |
| `/dashboard/settings` | Commission safety net, DHL, invoice window, payment reminders (per-card permissions) | `dashboard:read` |
| `/dashboard/emails` | Database email templates and a one-off sender | `email:read` |
| `/dashboard/activity-logs` | Audit log for staff and customers | `staff:read` |
| `/dashboard/leads` | Marketing leads / shipping estimates | `user:read` + `leads:read` |
| `/dashboard/carriers` | Carrier CRUD, per-carrier commissions, thresholds, global commission sheet | `carrier:read` |
| `/dashboard/hub` | Hub routing master switch, compete-best-price, sorting-centre CRUD | `staff:read` |
| `/dashboard/staff` | Staff and roles (RBAC administration) | `staff:read` |
| `/dashboard/security` | Super Admin authenticator & sessions | Super Admin (self-guarded) |
| `/dashboard/denied` | Access denied | none |
| Admin profile drawer (any route) | Profile, password change (staff only), activity logs, docs viewer, version footer | authenticated |

Every route in `permission-guard.tsx` has a page (since 1.8.0).

Sidebar grouping: Operations / Finance / Growth / Configuration / System.

## 7. Cross-cutting modules

| Module | Responsibility |
|---|---|
| `lib/shipment-status.ts` | The 15-value shipment status model, labels, variants, which statuses the override modal may offer (multi-leg states hidden for single-leg shipments) |
| `lib/rbac.ts` | `SUPERUSER_WILDCARD`, `SUPER_ADMIN_ROLE_NAME` and when each may be used |
| `lib/api-error.ts` | Error-envelope readers |
| `lib/auth/session.ts` | Cookie, idle window, sign-out reason |
| `utils/estimate-shipment-correlation.ts` | Links estimates to the shipments they produced — by `estimateId` when present, by address/service/time heuristic otherwise |
| `utils/format-*.ts` | `pl-PL` currency, date, phone formatting |
| `components/providers.tsx` | `QueryClient` + `react-hot-toast` `Toaster` |
| `docs/admin/permissions.ts` | Permission catalogue offered by the role editor |

## 8. Environment and deployment

- **Env vars** (names only; values never documented): `NEXT_PUBLIC_API_URL` (ends in `/api`), `SUPER_ADMIN_EMAIL`, `ALLOWED_ORIGINS`. `.env*` is gitignored. `NEXT_PUBLIC_*` values are **inlined at build time**.
- **Deployment:** Vercel, zero-config Next.js preset. `vercel.json` sets `buildCommand: npm run build`, `installCommand: npm install` and carries no `builds`/`functions` block. `.vercelignore` excludes `docs`, `*.md`, `.env*`. Owner intends to move Vercel to Bun (NOTES N-007, deferred).
- **Local:** `bun run dev` on `:3000` (the owner's own instance, always running — [VERIFICATION.md §4](VERIFICATION.md#4-environment-rules)). `.claude/launch.json` describes it for the Claude desktop preview.
- **Git:** branch `dev` for work; `main` for releases; remotes `mls` (org) and `origin` (personal). PRs have historically gone `thekiwidev/dev → main`. Agents never operate Git ([ADR-003](decisions/ADR-003-dual-git-remotes-and-no-autonomous-git.md)).
- **No CI.** No tests. Verification is local and manual (VERIFICATION.md).

## 9. Structural constraints (do not violate)

1. No server code in this repository — no route handlers, server actions, DB access ([ADR-001](decisions/ADR-001-client-only-spa-no-server-code.md)).
2. No root `api/` directory ([ADR-002](decisions/ADR-002-api-client-under-lib-not-root-api.md)).
3. Layering `types → lib/api → hooks → components` ([ENGINEERING.md §2](ENGINEERING.md#2-project-structure-and-layering)).
4. Permission logic mirrors the server; Super Admin = `*` ([ADR-004](decisions/ADR-004-permission-mirroring-and-wildcard-superadmin.md)).
5. Session behaviour follows the server's idle model; do not reintroduce a fixed-lifetime cookie ([ADR-005](decisions/ADR-005-server-backed-sliding-session-cookie.md)).
6. Every collection response is normalised in `lib/api`, never in a hook or page ([ADR-006](decisions/ADR-006-response-envelope-normalisation.md)).
7. The server contract outranks any UI assumption ([RULE-ARCH-004](RULES.md#rule-arch-004)).

## 10. Known structural risks (recorded, not fixed)

From the 2026-08-09 capability audit, still open on 2026-09-18 — details and status in [NOTES.md](NOTES.md):

- No error boundaries; a render-time throw below `PermissionGuard` white-screens the dashboard (N-004).
- No tests, no CI (N-006).
- List views over-fetch for correlation where `estimateId` is absent (N-008).
