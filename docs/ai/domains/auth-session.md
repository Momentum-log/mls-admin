---
doc: DOMAIN-AUTH-SESSION
purpose: "How sign-in, sessions, the cookie, the 401 contract, and Super Admin credential management work on the client — and what breaks if you touch them"
authority: canonical
hosts_rules: []
mirrors_rules: [RULE-ARCH-004, RULE-SEC-002, RULE-ENG-009]
last_reviewed: "2026-09-18"
---

# Domain: Authentication & Session (client side)

> Server contract: `../mls-server/docs/admin/authentication-guide.md` (v6.0.0 admin auth) and `../mls-server/docs/admin.openapi.json`. This document covers only what the client does with that contract. When the two disagree, the server document wins ([RULE-ARCH-004](../RULES.md#rule-arch-004)).

## Files

| File | Role |
|---|---|
| `app/login/page.tsx` | The email-first sign-in page; Zod schemas for email, password, six-digit code; `SessionNotice` |
| `hooks/auth/use-auth.ts` | `useIdentifyAdmin`, `useStaffLogin`, `useRequestOtp`, `useVerifyOtp`, `useVerifyTotp`, `useVerifyBackupCode`, `useLogout`, `useMe`, `getIdentifyErrorMessage` |
| `hooks/auth/use-totp.ts` | `useTotpStatus`, `useStartTotpSetup`, `useConfirmTotpSetup`, `useDisableTotp`, `useRegenerateBackupCodes` |
| `lib/api/auth/index.ts` | The request functions |
| `lib/auth/session.ts` | `getToken`, `setSession`, `touchSession`, `clearSession`, `setSignOutReason`, `peekSignOutReason`, `clearStoredSignOutReason` |
| `lib/api/index.ts` | Interceptors: bearer header; `touchSession()` on success; 401 handling with `CREDENTIAL_ROUTES` exemption |
| `components/auth/session-notice.tsx` | Renders the stashed sign-out reason once on `/login` (`useSyncExternalStore`) |
| `proxy.ts` | Cookie-presence gate for `/dashboard/*` and `/login` |
| `app/dashboard/security/page.tsx` | Super Admin authenticator & sessions management |
| `types/auth.ts` | `AdminIdentity`, `AdminAuthMethod`, `IdentifyErrorReason`, `AdminAuthErrorCode`, `AdminSessionInfo`, TOTP/backup-code shapes |

## The sign-in flow

1. One field: email. `POST /admin/auth/identify` → `{ method: "PASSWORD" }` (staff) or `{ method: "OTP", codeSent: true, expiresInSeconds }` (Super Admin — the code is already on its way).
2. `404 ACCOUNT_NOT_FOUND` and `403 ACCOUNT_INACTIVE` are refused before any credential is collected, each with its own wording. **Do not collapse them** — a deactivated admin must not be sent hunting for a typo.
3. A second lookup inside the send window returns `codeAlreadyPending: true` with `retryAfterSeconds` and `expiresInSeconds`. The page then says "a code is already waiting" rather than "we sent a code", and the resend gate unlocks when the server says so — not after a flat 60 s.
4. Super Admin alternatives: authenticator TOTP (`/admin/auth/totp/verify`), or a single-use backup code (`/admin/auth/backup-code/verify`; case, spacing and dashes ignored; `backupCodesRemaining` surfaced after use). **The authenticator link on the email step bypasses `identify` entirely** — the lookup sends mail on the Super Admin path, and the authenticator exists precisely for when mail is down. Do not route it through the lookup.
5. A successful credential response carries `accessToken` and `session: { idleTimeoutSeconds }` → `setSession(token, session)`.

## Sessions and the cookie

- The server keeps **one session per admin**, revocable, with a **one-hour sliding idle timeout**: every authenticated request pushes the deadline back.
- The `accessToken` cookie mirrors that. `setSession` stamps it with the server's idle window + 120 s grace (the server rewrites its own deadline at most once a minute, so the effective window is up to 1h59s). `touchSession()` re-stamps on each successful response, throttled to once per minute. `sameSite: "strict"`; `secure` when the page is HTTPS.
- **Do not reintroduce a fixed-lifetime cookie.** 1.4.0's one-hour fixed cookie would have signed out an actively working admin on the hour ([ADR-005](../decisions/ADR-005-server-backed-sliding-session-cookie.md)).
- The idle window is remembered in `localStorage` (`mls.admin.idleTimeoutSeconds`) so later touches know the value; the sign-out reason in `sessionStorage` (`mls.admin.signOutReason`).
- The token is **readable by JavaScript** (non-`httpOnly`). This is a known limitation; the proper fix — a server-set `httpOnly` cookie — is deferred and tracked in [NOTES N-003](../NOTES.md#n-003). Do not "fix" it client-side; it cannot be.

## The 401 contract

Every authenticated failure carries `reason` ∈ `SESSION_SUPERSEDED | SESSION_REVOKED | SESSION_EXPIRED | NO_TOKEN | INVALID_TOKEN | LEGACY_TOKEN` (and, for one release, the same value in `code`; branch on `reason ?? code`).

- The interceptor, on a 401 **not** from a credential route and **not** already on `/login`: `setSignOutReason({ code, message })`, `clearSession()`, `window.location.href = "/login"`.
- `SessionNotice` reads the reason once and styles `SESSION_SUPERSEDED` as a warning with the server's own message — it is how an admin notices a sign-in they did not make.
- **Credential routes are exempt** (`CREDENTIAL_ROUTES` in `lib/api/index.ts`): a 401 from `/otp/verify` means "wrong code" and belongs to the form. Redirecting would wipe a half-finished flow. If you add a new sign-in route, add it to that list.

## Logout

`POST /admin/auth/logout` revokes the session immediately; `?all=true` ends every session for the account. Local teardown (`clearSession`, redirect) runs on `onSettled`, so a failed call cannot leave the admin holding a token they meant to drop.

## Super Admin authenticator management (`/dashboard/security`)

- Enrol: `useStartTotpSetup` → QR rendered client-side with `react-qr-code` plus the base32 key for manual entry → `useConfirmTotpSetup` with a live code → **ten backup codes shown exactly once**; only hashes exist server-side.
- Regenerating the set and removing the authenticator both require a *current* code — a stolen session alone cannot strip or replace the second factor. The removal dialog says plainly that it leaves the emailed code as the only way in.
- The page self-guards on Super Admin (it is in `UNGUARDED` in `permission-guard.tsx`); it is not a permission.
- The profile drawer's Security tab branches on account type: Super Admin sees a "Sign-in Method" panel pointing here; staff see the change-password form.

## Gotchas

- **Password rotation is gone.** 1.2.2's Weekly Reset Key scheme was removed in 1.7.0 for good reason (it accepted a key derived from `JWT_SECRET` on a public endpoint). `docs/admin-workflow.md` and `docs/prd/prd-super-admin-password-rotation.md` still describe it — they are historical.
- `proxy.ts` accepts either an `accessToken` or a `token` cookie. Only `accessToken` is ever set. The alternate name is a widening left from earlier code; do not rely on it.
- `useMe` is the single source of the current admin (`role`, `permissions`, `isSuperAdmin` derivation lives in `usePermissions`). Do not fetch `/admin/auth/me` anywhere else.
- Nothing here is a security boundary. The server enforces every session and permission rule independently ([RULE-SEC-002](../RULES.md#rule-sec-002)).
