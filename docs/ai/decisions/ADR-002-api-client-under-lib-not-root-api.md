---
doc: ADR-002
purpose: "The API client lives at lib/api/; a root-level api/ directory must never exist"
authority: canonical
hosts_rules: [RULE-ARCH-002]
mirrors_rules: []
last_reviewed: "2026-09-18"
---

# ADR-002 — The API client lives under `lib/api/`, never at a root `api/`

**Status:** Accepted (recorded retroactively, 2026-09-18)
**Date:** 2026-08-26 (release 1.6.2); recorded 2026-09-18

## Decision

All request functions and the Axios instance live at `lib/api/`. Imports are `@/lib/api/…`. No `api/` directory exists at the repository root, and none may be created.

## Context

`[verified: changelog 1.6.2, git 243be7c/f576d5b]` — deployments began failing at "Deploying outputs…" with *"No more than 12 Serverless Functions can be added to a Deployment on the Hobby plan."* The build always succeeded. Vercel's zero-config detection treats any root-level `api/` directory as a source of serverless functions **independently of the Next.js preset**, turning every non-underscore-prefixed file into one. The 15 client modules plus `api/carriers/constants.ts` counted 16 against a ceiling of 12 — none of them backend code.

## Rationale

`[verified: changelog 1.6.2]` — relocation beside the other cross-cutting code (`lib/api-error.ts`, `lib/rbac.ts`, `lib/shipment-status.ts`); the `@/*` alias already resolved the new path; `vercel.json` carries no `builds`/`functions` block that would have needed changing.

## Options considered

`[verified: changelog 1.6.2]` — consolidating into a single shared function was rejected: there were no functions to consolidate, and a barrel export over every domain client would have defeated tree-shaking to solve a problem that did not exist.

## Consequences

- 17 consumer imports were repointed; relative imports inside the tree were untouched.
- `.agent/rules/api-integration-guide.md` and `README.md` still show `api/` paths — archived and flagged respectively.
- Any future top-level directory name must be checked against Vercel's conventions before creation.

## Related

[ADR-001](ADR-001-client-only-spa-no-server-code.md), [domains/api-client.md](../domains/api-client.md), [workflows/API-INTEGRATION-WORKFLOW.md](../workflows/API-INTEGRATION-WORKFLOW.md)
