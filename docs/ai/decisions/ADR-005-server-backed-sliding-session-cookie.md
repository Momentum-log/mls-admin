---
doc: ADR-005
purpose: "The session cookie mirrors the server's sliding idle timeout; fixed-lifetime cookies are prohibited"
authority: canonical
hosts_rules: []
mirrors_rules: [RULE-ARCH-004]
last_reviewed: "2026-09-18"
---

# ADR-005 — The cookie follows the server's sliding idle session

**Status:** Accepted (recorded retroactively, 2026-09-18)
**Date:** 2026-09-18 (release 1.7.0); recorded 2026-09-18

## Decision

Admin sessions are server-backed rows with a one-hour **idle** timeout that every authenticated request extends. The `accessToken` cookie mirrors that: `lib/auth/session.ts` stamps it with the server-supplied idle window plus a 120 s grace, and re-stamps it on every successful response, throttled to once a minute. `sameSite=strict`; `secure` on HTTPS. Sign-in routes are exempt from the global 401 redirect. Logout is a real revoking request with local teardown on `onSettled`.

## Context

`[verified: changelog 1.4.0, 1.7.0; lib/auth/session.ts; lib/api/index.ts]` — 1.4.0 had fixed a 7-day cookie that outlived a 1-hour token by 168×, replacing it with a fixed one-hour cookie. When the server moved to idle-based sessions in v6.0.0, a fixed cookie would have signed out an admin working continuously, on the hour, mid-task. The server rewrites its own deadline at most once a minute, so the effective window is up to 1h59s; the grace covers that. The 401 contract (`reason`) lets the login page explain the sign-out — `SESSION_SUPERSEDED` is how an admin notices a sign-in they did not make.

## Rationale

`[verified: comments in lib/auth/session.ts and changelog 1.7.0]` — the client must never disagree with the server about whether a session is alive; a cookie that outlives its session is harmless (the 401 interceptor clears it and explains why), while a cookie that expires early is a usability defect.

## Options considered

`[verified: audit D-07, changelog 1.7.0]` — a server-set `httpOnly; Secure; SameSite=Strict` cookie with rotation was recommended by the audit and remains the better security posture; it was **not** adopted in 1.7.0. Reason not recorded; it requires a server change. Tracked as [NOTES N-003](../NOTES.md#n-003).

## Consequences

- Do not reintroduce a fixed-lifetime cookie, and do not add per-hook 401 redirects.
- New credential routes must be added to `CREDENTIAL_ROUTES`.
- The token is JS-readable until the server-set cookie lands.

## Related

[domains/auth-session.md](../domains/auth-session.md), `../mls-server/docs/admin/authentication-guide.md`
