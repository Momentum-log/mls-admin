---
doc: MEMORY
purpose: "What is true about mls-admin right now. Rewritten when reality changes; never a diary"
authority: canonical
hosts_rules: []
mirrors_rules: [RULE-DOC-004, RULE-ARCH-001, RULE-ARCH-004, RULE-VERIF-004]
last_reviewed: "2026-09-18"
---

# Project Memory — MLS Admin

> Current state only. If a statement here stops being true, change it in the same task that made it false ([WORKFLOW.md §7.5](docs/ai/WORKFLOW.md#75-memory-reconciliation)). History lives in `changelog.md`; reasons live in `docs/ai/decisions/`; in-flight work lives in `docs/ai/HANDOFF.md`. Never store secrets here.

---

## 1. Current position

- **Product:** Momentum Logistics Service (MLS) — the admin dashboard for a logistics business operating in Poland. Users are MLS staff and the Super Administrator.
- **Version:** `1.7.0` ("Passwordless Super Admin, Server-Backed Sessions & Email-First Sign-in", 2026-09-18). `package.json`, the profile-drawer footer and `changelog.md` agree.
- **Requires:** `mls-server` ≥ 6.0.0 (the identify / OTP / TOTP / backup-code / logout routes).
- **Branch:** `dev` (tracking `mls/dev`, `origin/dev`); `main` is the release branch. Working tree: clean of application changes; contains the uncommitted AI operating system added 2026-09-18.
- **Active work:** none (`docs/ai/HANDOFF.md` = `IDLE`).
- **AI system:** adopted 2026-09-18 (`docs/ai/SYSTEM.md`). Open confirmations are listed there.

## 2. Fixed decisions

| Decision | Where |
|---|---|
| Pure client SPA — no route handlers, server actions, or DB here | [ADR-001](docs/ai/decisions/ADR-001-client-only-spa-no-server-code.md) |
| API client at `lib/api/`; never a root `api/` (Vercel function limit) | [ADR-002](docs/ai/decisions/ADR-002-api-client-under-lib-not-root-api.md) |
| Two remotes; Git operated only by the owner | [ADR-003](docs/ai/decisions/ADR-003-dual-git-remotes-and-no-autonomous-git.md) |
| Permission checks mirror the server's `RbacService`; Super Admin = `*` wildcard | [ADR-004](docs/ai/decisions/ADR-004-permission-mirroring-and-wildcard-superadmin.md) |
| Cookie mirrors the server's sliding one-hour idle session | [ADR-005](docs/ai/decisions/ADR-005-server-backed-sliding-session-cookie.md) |
| Collection responses normalised once in `lib/api/_shared/envelope.ts` | [ADR-006](docs/ai/decisions/ADR-006-response-envelope-normalisation.md) |
| Bun for all local package/script operations | [ENGINEERING.md §1](docs/ai/ENGINEERING.md#1-toolchain) |
| New forms use Zod; new UI uses `globals.css` tokens; kebab-case files; legacy migrated when touched | [ENGINEERING.md §9](docs/ai/ENGINEERING.md#9-legacy-patterns-and-migration-policy) |
| Every new product capability needs an owner-approved PRD **and** tasks file | [workflows/PRD-WORKFLOW.md](docs/ai/workflows/PRD-WORKFLOW.md) |
| Changelog: `## [x.y.z] - date - title` per release from 1.7.0 on; SemVer; symptom/cause/fix for bugs | [WORKFLOW.md §7.3](docs/ai/WORKFLOW.md#73-changelog-rules) |

## 3. Architecture (summary — detail in [ARCHITECTURE.md](docs/ai/ARCHITECTURE.md))

- **Stack:** Next.js 16.1.6 App Router · React 19.2.3 · TypeScript 5 strict · Tailwind 4 + shadcn/ui (new-york, `radix-ui`, `lucide-react`) · TanStack Query 5 · Axios · react-hook-form + Zod · react-hot-toast · date-fns · framer-motion · js-cookie · react-qr-code. `zustand` is installed and unused.
- **Layering:** `types → lib/api → hooks → components/app`. Components never touch Axios. Hooks own toasts and cache invalidation.
- **Backend:** `../mls-server` (Express + Prisma + PostgreSQL). Dev: `http://localhost:8000/api`. Contract: `../mls-server/docs/admin.openapi.json` + `docs/admin/authentication-guide.md`. Every admin path carries its own `/admin`.
- **Auth:** email-first `identify`; staff = password; Super Admin = emailed OTP / TOTP / backup code (no password). One session per admin, one-hour sliding idle; cookie `accessToken` re-stamped per response (`lib/auth/session.ts`). 401 `reason` contract → `SessionNotice` on `/login`. Logout is a real revoking request.
- **RBAC:** `usePermissions` (wildcard / exact / `resource:*`); `PermissionGuard` per route (longest match, multi-permission); sidebar tooltips; `<Can>` per control. All UX — server enforces.
- **Routing:** `proxy.ts` (Next 16, replaces `middleware.ts`) gates `/dashboard/*` and `/login` on cookie presence.
- **Deployment:** Vercel, zero-config; `vercel.json` still says npm (deferred: N-007). `.vercelignore` drops `docs`, `*.md`, `.env*`.

## 4. Features (what works today)

| Module | State |
|---|---|
| Sign-in (email-first, OTP / TOTP / backup code, throttled-lookup messaging, session notice) | Complete (1.7.0) |
| Super Admin authenticator management + sessions (`/dashboard/security`) | Complete (1.7.0) |
| Dashboard overview stats | Complete |
| Users: list/filter, detail, per-user shipments & estimates, moderation incl. un-ban / restore, verify | Complete (un-ban 1.6.0) |
| Address verification requests | Complete |
| Shipments: list with status filter, detail sheet, 15-status override model, bypass payment, proxy creation wizard (sends `currency`/`actualPrice`/`carrierSlug`/`estimateId`), bulk delete | Complete |
| Hub & Routing (`/dashboard/hub`): master switch, compete-best-price, sorting-centre CRUD, honest no-op warnings, env-fallback banner | Complete (1.5.0) |
| Multi-Leg Ops (`/dashboard/multi-leg`): queue, confirm arrival, create leg 2 with 409 re-pricing decision, centre-printed-label warning | Complete (1.5.0) |
| Marketing leads / estimates | Complete |
| Carriers: CRUD, per-carrier commissions & thresholds, global commission sheet, health monitoring | Complete; save is 3 non-atomic writes (N-005) |
| Staff & roles (RBAC admin), permission selector | Complete; "Recent Activity" is a fake spinner (N-001) |
| Admin profile drawer: details, password change (staff), activity logs, docs viewer, version footer | Complete |
| **Not built** — `/dashboard/settings`, `emails`, `inquiries`, `activity-logs`, `invoices`, `refunds`, `tax-rules` (guard entries exist, no page) | Backlog: [PLAN-forward-declared-dashboard-routes](docs/ai/plans/active/PLAN-forward-declared-dashboard-routes.md) |
| **Removed** — password rotation (1.7.0) | Do not reintroduce |

## 5. Environment

- **Run:** `bun install`, `bun run dev` → `http://localhost:3000`. **The owner keeps their own `next dev` running on `:3000`** — it holds the Turbopack lock; agents never start a second one or kill it.
- **Env (names only):** `NEXT_PUBLIC_API_URL` (ends in `/api`), `SUPER_ADMIN_EMAIL`, `ALLOWED_ORIGINS`. `.env*` gitignored. `NEXT_PUBLIC_*` inlined at build time.
- **Verify:** `bunx tsc --noEmit` · `bun run lint` · manual check in the running app. No tests, no CI.
- **Backend up?** `curl -s -o /dev/null -w '%{http_code}' http://localhost:8000/api/admin/auth/me` → `401`.
- **Agent entry points:** `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `.github/copilot-instructions.md`, `.agent/rules/instruction.md` → all adapters to `docs/ai/AGENT-CORE.md`.

## 6. Gotchas

- **Never edit `.env*` under the running dev server.** Inlined `NEXT_PUBLIC_*` survives in `.next/dev/` chunks after the file is gone; recovery is `rm -rf .next && bun run dev`. ([VERIFICATION.md §4](docs/ai/VERIFICATION.md#4-environment-rules))
- **`mls-server` is often down** in dev (dead DB has happened). Check before diagnosing the client.
- **Hooks after early returns crash pages** ("Rendered more hooks than during the previous render") — hoist them.
- **`/dashboard/settings` is gated on `staff:write`** — the server gates even the GET on write.
- **Multi-permission routes:** `/dashboard/shipments` = `user:read` + `shipment:read`; `/dashboard/leads` = `user:read` + `leads:read`.
- **Credential routes are exempt from the 401 redirect** (`CREDENTIAL_ROUTES` in `lib/api/index.ts`); add new sign-in routes there.
- **The authenticator link bypasses `identify`** on purpose — do not route it through the email lookup.
- **Backup codes are shown exactly once**; TOTP removal/regeneration needs a current code.
- **Four response envelopes, two paginations** — always through `envelope.ts`; new collection keys go in `COLLECTION_KEYS`.
- **Strip secrets in `lib/api`** — the multi-leg endpoint spreads carrier `apiKey`/`apiSecret`.
- **Send `currency` with every price** or EUR books as PLN.
- **`ShippingRate` field names come from the schema** (`carrierPrice`/`actualPrice`/`deliveryDescription`), not from the UI.
- **Vercel deploys any root `api/` as functions** — never create one.
- **Permission catalogue drifts** from the server's; `system:security` never existed; check both when adding a permission.
- **Version triple** (`package.json`, drawer footer, changelog) drifts if you bump only one.

## 7. Deferred work

- Server-set `httpOnly` cookie (N-003) — needs `mls-server`.
- Error boundaries (N-004). Atomic carrier save (N-005). Test suite + CI (N-006).
- Bun on Vercel / launch config (N-007).
- Remove heuristic correlation fallback once old rows are irrelevant (N-008). Remove `zustand` (N-009).
- Seven forward-declared routes + audit's endpoint adoptions ([plan](docs/ai/plans/active/PLAN-forward-declared-dashboard-routes.md)).
- README rewrite (N-016); refresh or retire `docs/admin/admin.openapi.json` snapshot (N-018).
- Domain docs pruned at adoption (SYSTEM.md → `modules.pruned`).

## 8. Deviations (code vs its own conventions — tolerated, migrate when touched)

- Forms without Zod except login (C-01). ≈170 raw Tailwind palette classes (C-02). PascalCase files in `components/admin-profile/` (C-03). `###` changelog headings ≤ 1.6.2 — history, never rewritten (C-04). Policy: [ENGINEERING.md §9](docs/ai/ENGINEERING.md#9-legacy-patterns-and-migration-policy).
- `proxy.ts` accepts a `token` cookie nothing sets (N-010). A `@deprecated` alias in `types/user.ts` (N-011).

## 9. Open questions

Mirrored from `docs/ai/SYSTEM.md → open_confirmations`:

1. Q-01 — Refresh `docs/admin/admin.openapi.json` from the server, or replace it with a pointer?
2. Q-02 — Should `README.md` be rewritten now (documentation-only task) or left until a release?
3. Q-03 — Does `/dashboard/settings` still have a purpose post-1.7.0?
4. Q-04 — Should this adoption get a `changelog.md` entry (e.g. as part of the next release) — the convention excludes pure doc changes, but the operating rules for contributors changed.
