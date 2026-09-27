---
doc: DOMAIN-API-CLIENT
purpose: "The Axios client, envelope normalisation, error helpers, path conventions, and the traps around talking to mls-server"
authority: canonical
hosts_rules: [RULE-SEC-003]
mirrors_rules: [RULE-ARCH-002, RULE-ARCH-004, RULE-ARCH-005, RULE-ENG-008, RULE-ENG-009]
last_reviewed: "2026-09-18"
---

# Domain: API Client

> How every request leaves this app and how every response comes back. Procedure for adding an endpoint: [workflows/API-INTEGRATION-WORKFLOW.md](../workflows/API-INTEGRATION-WORKFLOW.md).

## Files

| File | Role |
|---|---|
| `lib/api/index.ts` | `apiClient` — base URL, bearer header, session touch, 401 handling, error-message rewrite |
| `lib/api/_shared/envelope.ts` | `normalisePagination`, collection unwrapping across the four envelopes |
| `lib/api-error.ts` | `isApiError`, `getApiErrorBody`, `getApiErrorDetails`, `hasStatus`, `getApiErrorMessage` |
| `types/api.ts` | `ApiErrorBody`, `Pagination`, `Paged<T>` |
| `lib/api/<feature>/index.ts` | One folder per backend feature: `auth`, `users`, `staff`, `shipments`, `shipping`, `leads`, `carriers` (+ `constants.ts`), `dashboard`, `profile`, `settings`, `admin/address-requests`, `admin/hub`, `admin/multi-leg` |

## Base URL and paths

- `baseURL = process.env.NEXT_PUBLIC_API_URL`, which **must end in `/api`** (`http://localhost:8000/api` locally). Inlined at build time — see [VERIFICATION.md §4](../VERIFICATION.md#4-environment-rules) before touching env.
- **Every admin path carries its own `/admin` prefix** in the request function: `apiClient.get("/admin/users")`. Never set the base to `/api/admin`. 1.4.0 fixed a state where half the paths were prefixed and half were not, so one half always 404'd.
- `withCredentials: true` and `Content-Type: application/json` are set once.

## Interceptors

- **Request:** attaches `Authorization: Bearer <accessToken cookie>` when present.
- **Response (success):** `touchSession()` — slides the cookie because the request also slid the server's idle deadline.
- **Response (error):** rewrites `error.message` to `data.details || data.message || data.error` when that is a string, so callers and toasts show the server's wording. Then, for a 401 off a credential route while not on `/login`: stash `reason`, clear session, hard-redirect to `/login`. See [domains/auth-session.md](auth-session.md).

## Envelopes

The server answers in **four shapes** and paginates **two ways** ([ADR-006](../decisions/ADR-006-response-envelope-normalisation.md)):

```text
1. { status: "success", ...payload }      sendSuccess spreads plain objects
2. { data, pagination }                   raw res.json
3. [ ... ]                                a bare array
4. { success: true, data }                reminder settings

pagination: { page, limit, total, totalPages }  or  { limit, offset, total }
```

`lib/api/_shared/envelope.ts` funnels all of them into `Paged<T> = { data: T[], pagination: { page, limit, total, totalPages } }`. Collection keys it knows: `data, users, shipments, leads, logs, requests, templates, invoices, inquiries, rules`. If a new endpoint hangs its collection off a new key, **add it there** — do not special-case it in a hook. Offset-style pagination has its page derived; a `limit` of zero is guarded.

Every `lib/api` function that returns a collection passes it through here ([RULE-ARCH-005](../RULES.md#rule-arch-005)). Hooks and pages never see a raw envelope.

## Errors

`ApiErrorBody = { error?, code?, details?: string | object, message?, reason?, required? }`.

- `details` is usually a string; a few endpoints return an object — most importantly `create-leg-two`'s 409, which carries `quotedPrice` and `livePrice`. Read it with `getApiErrorDetails`.
- `required` appears on a 403 from the permission middleware: the permission that was missing.
- `reason` is the machine-readable auth cause; the v6 contract sends it in `code` too for one release.
- Use `getApiErrorMessage(error, fallback)` for toasts; `hasStatus(error, 409)` for branching. Never `catch (error: any)` ([RULE-ENG-009](../RULES.md#rule-eng-009)) — 28 hand-rolled chains were replaced in 1.4.0.

## Secrets in responses

Some server rows spread through to responses with fields the browser must never hold. The multi-leg detail endpoint returned the full carrier row **including `apiKey` / `apiSecret`**; `lib/api/admin/multi-leg/index.ts` strips them before returning. That is the rule: **strip at the `lib/api` layer** ([RULE-SEC-003](../RULES.md#rule-sec-003)) — it is the last place before data lands in component state and React Query's cache. When you consume a new endpoint, read its response schema for anything of that kind.

## Contract discipline

- The contract is `../mls-server/docs/admin.openapi.json` and the owner's pasted contracts ([RULE-ARCH-004](../RULES.md#rule-arch-004)). The copy at `docs/admin/admin.openapi.json` is an August snapshot; do not build against it.
- Field-name mismatches have shipped before: `ShippingRate` declared `price`/`estimatedDays` while the API returned `carrierPrice`/`actualPrice`/`deliveryDescription`, so the rate list rendered blank. Read the schema; do not infer types from the UI.
- Always send `currency`, `actualPrice`, `carrierSlug` (not a display name) and `estimateId` when creating a shipment — omitting `currency` once booked EUR rates as PLN.
- The owner typically describes a server change verbally and pastes the finalised contract afterwards. Build against the verbal description with a clearly marked provisional layer; replace it when the contract lands.

## Why `lib/api` and not `api/`

Vercel's zero-config detection treats any **root-level** `api/` directory as serverless-function source, independent of the Next.js preset, and turns every non-underscore-prefixed file into a function. The 16 client modules blew the Hobby plan's 12-function ceiling at "Deploying outputs…" while the build itself passed. Moved in 1.6.2; nothing else changed ([ADR-002](../decisions/ADR-002-api-client-under-lib-not-root-api.md), [RULE-ARCH-002](../RULES.md#rule-arch-002)). Do not recreate `api/` at the root for any reason.
