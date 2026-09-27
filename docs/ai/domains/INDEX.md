---
doc: DOMAINS-INDEX
purpose: "Which domain document to read for which area, and why each exists"
authority: reference
hosts_rules: []
mirrors_rules: []
last_reviewed: "2026-09-18"
---

# Domain Documents

Domain docs exist only for areas where an agent cannot cheaply learn the constraints by reading the code — where a wrong assumption has already caused, or would cause, a real defect. They describe boundaries, contracts, and traps; they are not directory listings.

| Domain | Read when | Why it exists |
|---|---|---|
| [auth-session.md](auth-session.md) | Touching sign-in, the cookie, `lib/auth/session.ts`, the 401 interceptor, `/dashboard/security`, or the profile drawer's Security tab | Sliding idle sessions, the credential-route exemption, the authenticator bypass, and the one-time backup codes are all easy to break subtly |
| [rbac-permissions.md](rbac-permissions.md) | Adding a route, a sidebar entry, a destructive control, or touching roles/staff | The wildcard-vs-name identity trap, multi-permission routes, catalogue drift, and "settings needs staff:write" have each shipped a bug |
| [api-client.md](api-client.md) | Adding or changing any backend call, or debugging a request | Four envelopes, two paginations, the `/admin` prefix rule, secrets in responses, and the Vercel root-`api/` trap |

Not present, deliberately (see `SYSTEM.md → modules.pruned`): per-feature docs for users, shipments, carriers, leads, hub/multi-leg. Their behaviour is legible from the hooks, the types, and the PRDs in `docs/prd/`. Create one only when an area accumulates constraints the code does not make obvious — the leg-2 re-pricing decision and the carrier three-write save are the two most likely candidates.
