---
doc: VERIFICATION
purpose: "The completion gates: the repository's real commands, manual verification in the running app, environment rules, and the prohibition on weakening gates"
authority: canonical
hosts_rules: [RULE-VERIF-001, RULE-VERIF-002, RULE-VERIF-003, RULE-VERIF-004]
mirrors_rules: [RULE-ENG-001, RULE-DOC-003, RULE-GIT-001]
last_reviewed: "2026-09-18"
---

# Verification — MLS Admin

> A task is done when these gates pass with their real output shown. Not before.

---

## 1. Mandatory gates

Run with **Bun** ([RULE-ENG-001](RULES.md#rule-eng-001)). These are the commands the repository actually defines; do not substitute others.

| Gate | Command | Must |
|---|---|---|
| Typecheck | `bunx tsc --noEmit` | exit 0, zero errors |
| Lint | `bun run lint` | zero errors; zero **new** warnings in touched files |
| Build (when touching config, routing, `proxy.ts`, or anything that could break the production bundle) | `bun run build` | exit 0 — **coordinate with the owner first**: it writes to `.next/` while the owner's dev server is using it (§4) |
| Runtime | the owner's running dev server on `http://localhost:3000` | the changed screen renders and behaves as intended (§3) |

`package.json` defines exactly four scripts: `dev`, `build`, `start`, `lint`. There is no `test`, `type-check`, `lint:fix`, or `preview` script, whatever `README.md` currently says. Do not invent one; if a script is needed, that is a package-manifest change for the owner to approve.

### 1.1 Zero unused code in touched files

Files you modified must have no unused imports, variables, or exports ([RULE-VERIF-003](RULES.md#rule-verif-003)). The capability audit found dead constants, unused icon imports and an unused dependency; the lint config warns on these, and a warning you introduced counts as a failure.

---

## 2. Tests

There is **no test runner, no test file, and no CI** in this repository as of 2026-09-18. This is recorded as deferred work ([MEMORY.md](../../MEMORY.md), [NOTES.md N-006](NOTES.md#n-006)), not as a reason to skip verification.

Consequences for agents:

- "Tests pass" is never a valid verification claim here.
- The regression check for a bug fix is a **documented manual reproduction**: what you did, what happened before, what happens after (§3).
- Do not add a test runner as part of an unrelated task. Adding one is an owner-approved maintenance task with its own plan; the audit's suggested first targets are `utils/estimate-shipment-correlation.ts`, the commission/threshold fallback logic, and `hooks/use-permissions.ts`.

---

## 3. Manual verification in the running app

Because there are no automated behavioural tests, every UI or data-flow change is verified in the browser against the owner's running instance.

1. Confirm the backend is up before blaming the client: `curl -s -o /dev/null -w '%{http_code}' http://localhost:8000/api/admin/auth/me` should return `401` (not a connection error, not `500`). If it is down, the state is `BLOCKED — backend unavailable`; say so.
2. Open the affected route on `http://localhost:3000`. Turbopack HMR picks up source changes; a full reload is rarely needed.
3. Exercise the changed behaviour — the happy path and the failure path the change touches. Watch the console and the network tab for the actual request path, payload, and response envelope.
4. For a bug fix, perform the reproduction steps that failed before and confirm they now pass.
5. For a permission-related change, verify as a non-super-admin role where possible; the super-admin wildcard hides gating bugs.
6. Record what was checked, in the final report's Verification block, specifically enough that another agent could repeat it.

A screenshot or a described sequence is evidence. "Should work" is not.

---

## 4. Environment rules

These are hard rules because violating them has already cost the owner time.

- **The owner runs their own `next dev` on `:3000`.** It holds the Turbopack build lock; a second instance cannot start. Never start one. Never kill theirs.
- **Never create, edit, or delete `.env*` files while that server is running** ([RULE-VERIF-004](RULES.md#rule-verif-004)). `NEXT_PUBLIC_*` values are inlined into compiled chunks at build time, and Turbopack's dev cache in `.next/dev/` only rebuilds a chunk when its *source* changes — an env change does not invalidate already-compiled output. A temporary `.env.local` will keep affecting the served app long after the file is deleted. If an env change is unavoidable, it is `BLOCKED — env change required under running dev server`: tell the owner, and give them `rm -rf .next && bun run dev`.
- **Do not point the app at a mock backend** without asking. If a mock is genuinely needed, it runs in a separate worktree with its own `.next`.
- `bun run build` writes to `.next/` and can disrupt the running dev server. Ask before running it.
- Required env: `NEXT_PUBLIC_API_URL` (must end in `/api` — every admin path carries its own `/admin`), `SUPER_ADMIN_EMAIL`, `ALLOWED_ORIGINS`. Values are never written into documentation.

---

## 5. Never weaken a gate

Never, to make work appear complete:

- add `@ts-ignore`, `@ts-expect-error`, or cast to `any`;
- disable or downgrade a lint rule, inline or in `eslint.config.mjs`;
- relax `tsconfig.json` strictness;
- comment out a failing check;
- narrow the manual verification to avoid the failing path;
- describe a failed or skipped gate as passed.

If a gate cannot pass within the approved scope, the state is `BLOCKED — verification failure`. Report it with the real output ([RULE-VERIF-002](RULES.md#rule-verif-002)).

---

## 6. Completion gate

Verification is complete only when all of the following are true and reported:

- [ ] `bunx tsc --noEmit` — output shown, exit 0
- [ ] `bun run lint` — output shown, no errors, no new warnings
- [ ] Manual check in the running app — described specifically (§3)
- [ ] Backend contract respected — request paths, payloads and envelopes match `../mls-server/docs/admin.openapi.json` or the pasted contract
- [ ] Touched files have zero unused code
- [ ] Version triple agrees if any of the three was changed ([WORKFLOW.md §7.4](WORKFLOW.md#74-version-reconciliation))
- [ ] Documentation reconciliation performed and reported per layer ([WORKFLOW.md §7](WORKFLOW.md#7-documentation-impact-review-and-reconciliation))
- [ ] No unauthorised Git operation performed ([RULE-GIT-001](RULES.md#rule-git-001))
