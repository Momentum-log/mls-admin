---
doc: RULES
purpose: "Registry of every rule this system enforces: ID, one-sentence statement, class, canonical home, mirrors, proof surface, status, origin. The cascade lookup for amendments; not a rulebook"
authority: reference
hosts_rules: []
mirrors_rules: []
last_reviewed: "2026-09-18"
---

# Rule Registry — MLS Admin

> An index of rules, not a place where rules are defined. Each entry names exactly one canonical home. Documents listed under **Mirrors** reference or operationalise the rule and must be updated in the same change when it changes. **Enforced by** is the proof surface; `judgment` means there is no mechanical gate.
>
> Invariants (checked in AUDIT): one canonical home per rule · every mirror registered · no duplicated rule bodies · no unregistered rules in generated docs · every active rule has a proof surface or an honest `judgment` · registry and rule land in the same change · superseded rules retained with forward pointers · every origin traceable.
>
> Origins: `init` = initializer default adopted 2026-09-18 · `legacy` = carried from `.agent/rules/instruction.md` or `api-integration-guide.md` (archived) · `mls-server` = carried from the sibling repo's system at the owner's 2026-09-18 ruling · `owner:<date>` = stated by the owner · `ADR-nnn`.

---

## CORE — universal behaviour

### RULE-CORE-001 — Startup context-loading sequence
**Statement:** Before answering, planning, editing, or running a command, load AGENT-CORE → MEMORY → HANDOFF → CONSTITUTION → WORKFLOW → INDEX, then task-specific documents and the actual code.
**Class:** Core · **Canonical home:** `AGENT-CORE.md §1` · **Mirrors:** every entry-point adapter (`AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `.agent/rules/instruction.md`, `.github/copilot-instructions.md`), `INDEX.md §1`, `WORKFLOW.md §1 Orient` · **Enforced by:** judgment; adapters restate the sequence · **Status:** active · **Origin:** init

### RULE-CORE-002 — Source-of-truth hierarchy
**Statement:** Resolve conflicts in the order owner instruction → PRD/server contract → active plan → ADRs → MEMORY → engineering/workflow rules → NOTES → changelog → assumptions, and ask when the hierarchy cannot resolve.
**Class:** Core · **Canonical home:** `AGENT-CORE.md §2` · **Mirrors:** `WORKFLOW.md §3.2` (BLOCKED — documentation conflict) · **Enforced by:** judgment · **Status:** active · **Origin:** init

### RULE-CORE-003 — Never guess repository facts
**Statement:** Do not invent paths, commands, field names, endpoints, conventions, behaviour, or decisions; inspect the repository and the server contract, and ask when neither establishes the fact.
**Class:** Core · **Canonical home:** `AGENT-CORE.md §3.5` · **Mirrors:** `CONSTITUTION.md §11`, `SYSTEM.md` confidence tags · **Enforced by:** judgment; `[inferred]`/`[unconfirmed]` tags in generated docs · **Status:** active · **Origin:** init

### RULE-CORE-004 — Never store secrets
**Statement:** No token, credential, connection string, or real env value appears in any document, memory, note, plan, or handoff.
**Class:** Core / Security · **Canonical home:** `AGENT-CORE.md §3.6` · **Mirrors:** `MEMORY.md` header, `VERIFICATION.md §4`, `ENGINEERING.md §10` · **Enforced by:** judgment; AUDIT grep · **Status:** active · **Origin:** init (also legacy §5)

## GIT

### RULE-GIT-001 — No autonomous Git operations
**Statement:** Never create or switch branches, stage, commit, amend, rebase, merge, cherry-pick, reset, tag, release, or push without the owner's explicit authorisation for that exact operation in the current interaction.
**Class:** Git policy · **Canonical home:** `AGENT-CORE.md §3.1` · **Mirrors:** `CONSTITUTION.md §12`, `WORKFLOW.md §8–9` (Git line), `VERIFICATION.md §6`, `HANDOFF.md` (branch read-only), `ADR-003`, all entry-point adapters · **Enforced by:** final report must state no unauthorised Git operation occurred · **Status:** active · **Origin:** init + mls-server

## AUTON — autonomy and approval

### RULE-AUTON-001 — Analysis-only by default
**Statement:** When asked to review, audit, investigate, or explain, edit no file; report problem, root cause, paths, and fix.
**Class:** Autonomy · **Canonical home:** `AGENT-CORE.md §3.2` · **Mirrors:** `WORKFLOW.md §2` (class 7), entry-point adapters · **Enforced by:** judgment · **Status:** active · **Origin:** mls-server

### RULE-AUTON-002 — Explicit permission and Pre-Edit Summary before editing
**Statement:** Edit only after explicit owner authorisation, and present the Pre-Edit Summary or PROBLEM/COST/FIX block before the first edit.
**Class:** Gate · **Canonical home:** `AGENT-CORE.md §3.3` (requirement) with the block format in `WORKFLOW.md §5.1` · **Mirrors:** `WORKFLOW.md §3.1` (OWNER PLAN APPROVAL state), entry-point adapters · **Enforced by:** the block appears before edits; its absence is a gate failure · **Status:** active · **Origin:** mls-server

### RULE-AUTON-003 — Owner-approval boundaries
**Statement:** Stop and ask before changing undefined product behaviour, overriding an ADR or fixed technology, resolving an unmade product decision, changing dependencies, any Git operation, destructive backend mutations, env changes under the running dev server, deleting documentation, or spending money.
**Class:** Autonomy · **Canonical home:** `AGENT-CORE.md §4` · **Mirrors:** `WORKFLOW.md §3.2` (BLOCKED states), `WORKFLOW.md §4.5`, `PRD-WORKFLOW.md` · **Enforced by:** BLOCKED — missing owner decision · **Status:** active · **Origin:** init

### RULE-AUTON-004 — Terminal command disclosure
**Statement:** Disclose every command's text, purpose, scope, and risk before running it, batch only read-only commands serving one step, never pass prompt-suppressing flags, and hand interactive commands to the owner.
**Class:** Autonomy · **Canonical home:** `WORKFLOW.md §5.2` · **Mirrors:** `AGENT-CORE.md §3.4`, entry-point adapters · **Enforced by:** the COMMAND REQUEST block precedes each command · **Status:** active · **Origin:** mls-server

### RULE-AUTON-005 — Package install request
**Statement:** Adding, removing, or upgrading a dependency requires the PACKAGE INSTALL REQUEST block and owner confirmation.
**Class:** Autonomy · **Canonical home:** `WORKFLOW.md §5.3` · **Mirrors:** `AGENT-CORE.md §4`, `WORKFLOW.md §4.5`, `CONSTITUTION.md §5` · **Enforced by:** the block · **Status:** active · **Origin:** mls-server

### RULE-AUTON-006 — Scope check for out-of-scope actions
**Statement:** An action outside the approved plan is presented as a SCOPE CHECK and waits for the owner.
**Class:** Autonomy · **Canonical home:** `WORKFLOW.md §5.4` · **Mirrors:** `WORKFLOW.md §5.1` (silent implementation exception) · **Enforced by:** the block · **Status:** active · **Origin:** mls-server

## YAGNI

### RULE-YAGNI-001 — YAGNI and smallest correct change
**Statement:** Build only what the approved task requires, with the minimal correct diff, and add no speculative abstraction, layer, config, or dependency.
**Class:** Principle · **Canonical home:** `CONSTITUTION.md §1, §3, §5` · **Mirrors:** `AGENT-CORE.md §5`, `WORKFLOW.md §4.4` · **Enforced by:** judgment; plan's Non-goals · **Status:** active · **Origin:** init

### RULE-YAGNI-002 — Reuse search before creation
**Statement:** Search `components/`, `hooks/`, `lib/`, `utils/`, `types/` for existing code before writing new code, and record what was found in the plan.
**Class:** Principle · **Canonical home:** `CONSTITUTION.md §2` · **Mirrors:** `AGENT-CORE.md §5`, `WORKFLOW.md §1 Reuse search`, `WORKFLOW.md §6.1` (Existing reuse), `ENGINEERING.md §3` · **Enforced by:** plan's Existing reuse field · **Status:** active · **Origin:** init + legacy §3.1

## WF — workflow and gates

### RULE-WF-001 — Classify before implementing
**Statement:** State one of the seven task classes (or "amendment") in the plan and final report before any edit.
**Class:** Workflow · **Canonical home:** `WORKFLOW.md §2` · **Mirrors:** `WORKFLOW.md §5.1` (Pre-Edit Summary field), `WORKFLOW.md §9` (report field), `AGENT-CORE.md §6` · **Enforced by:** Classification field in both blocks · **Status:** active · **Origin:** init

### RULE-WF-002 — The task state machine
**Statement:** Every task passes INTAKE → ORIENT → CLASSIFY → REQUIREMENTS DISCOVERY → plan/PRD gate → OWNER PLAN APPROVAL → IMPLEMENT → VERIFY → DOCUMENTATION IMPACT REVIEW → RECONCILE → FINAL REVIEW → READY FOR OWNER COMMIT without skipping a gate.
**Class:** Workflow · **Canonical home:** `WORKFLOW.md §3.1` · **Mirrors:** `WORKFLOW.md §8` (completion sequence), `AGENT-CORE.md §7` · **Enforced by:** final report structure · **Status:** active · **Origin:** init

### RULE-WF-003 — Feature gate: PRD + tasks for every new capability
**Statement:** A new product capability requires an owner-approved `docs/prd/prd-<feature>.md` and then an owner-approved `docs/tasks/tasks-<feature>.md` before implementation, with no size exemption.
**Class:** Gate · **Canonical home:** `workflows/PRD-WORKFLOW.md` · **Mirrors:** `WORKFLOW.md §4.1`, `WORKFLOW.md §3.1`, `MEMORY.md §2`, `plans/active/PLAN-forward-declared-dashboard-routes.md` · **Enforced by:** BLOCKED — missing owner decision until both approvals exist · **Status:** active · **Origin:** existing repo convention + owner:2026-09-18

### RULE-WF-004 — Bug-fix gate
**Statement:** Establish expected behaviour, reproduce, find the root cause, plan the smallest fix with a before/after manual regression check, verify adjacent behaviour, and record symptom/cause/fix.
**Class:** Gate · **Canonical home:** `WORKFLOW.md §4.2` · **Mirrors:** `WORKFLOW.md §7.3` (changelog bug entries), `VERIFICATION.md §3` · **Enforced by:** changelog entry must carry cause and fix · **Status:** active · **Origin:** init

### RULE-WF-005 — Plan template and micro-plan
**Statement:** Non-trivial work uses the full plan template including documentation-impact prediction; trivial work uses Problem → Change → Verification → Documentation impact and never skips verification.
**Class:** Workflow · **Canonical home:** `WORKFLOW.md §6` · **Mirrors:** `WORKFLOW.md §4.6`, `WORKFLOW.md §5.1` · **Enforced by:** plan present in Pre-Edit Summary · **Status:** active · **Origin:** init

### RULE-WF-006 — Failure states
**Statement:** A blocked task is reported by its named BLOCKED state, never as "mostly done", and the blocker is preserved in HANDOFF.md.
**Class:** Workflow · **Canonical home:** `WORKFLOW.md §3.2` · **Mirrors:** `HANDOFF.md` template, `VERIFICATION.md §3, §4, §5` · **Enforced by:** HANDOFF status field · **Status:** active · **Origin:** init

### RULE-WF-007 — Completion sequence
**Statement:** Completion is reported only after VERIFY → INSPECT DIFF → DOCUMENTATION IMPACT REVIEW → UPDATE DOCS → RE-READ MEMORY/HANDOFF → HANDOFF → FINAL REPORT, in that order.
**Class:** Workflow · **Canonical home:** `WORKFLOW.md §8` · **Mirrors:** `AGENT-CORE.md §7`, `VERIFICATION.md §6` · **Enforced by:** final report's documentation block · **Status:** active · **Origin:** init

### RULE-WF-008 — Two moments of output; silent implementation
**Statement:** Output the Pre-Edit Summary or PROBLEM/COST/FIX before implementing, nothing during, and the final report (or DONE/OUTCOME plus the three mandatory lines) after; every field one sentence.
**Class:** Reporting · **Canonical home:** `WORKFLOW.md §5.1` · **Mirrors:** `AGENT-CORE.md §3.3`, `WORKFLOW.md §9`, entry-point adapters · **Enforced by:** judgment; report shape · **Status:** active · **Origin:** mls-server

## VERIF — verification

### RULE-VERIF-001 — Mandatory gates
**Statement:** Before completion run `bunx tsc --noEmit` and `bun run lint` with real output shown, and verify the change in the owner's running app; run `bun run build` (with owner coordination) when config, routing, or `proxy.ts` changed.
**Class:** Verification · **Canonical home:** `VERIFICATION.md §1, §3, §6` · **Mirrors:** `WORKFLOW.md §1 Verify`, `WORKFLOW.md §9` (Verification block), `AGENT-CORE.md §7–8`, `MEMORY.md §5`, `SYSTEM.md verification_commands` · **Enforced by:** Verification block in the final report · **Status:** active · **Origin:** legacy §4.1/§6 + init

### RULE-VERIF-002 — Never weaken a gate
**Statement:** Never add `@ts-ignore`/`any`, disable a lint rule, relax strictness, skip a check, or describe a failed gate as passed to make work appear complete.
**Class:** Verification · **Canonical home:** `VERIFICATION.md §5` · **Mirrors:** `CONSTITUTION.md §8` · **Enforced by:** BLOCKED — verification failure · **Status:** active · **Origin:** init

### RULE-VERIF-003 — Zero unused code in touched files
**Statement:** Files modified by a task contain no unused imports, variables, or exports, and introduce no new lint warnings.
**Class:** Verification · **Canonical home:** `VERIFICATION.md §1.1` · **Mirrors:** `VERIFICATION.md §6`, `ENGINEERING.md §14` · **Enforced by:** `bun run lint` output · **Status:** active · **Origin:** mls-server

### RULE-VERIF-004 — Never modify env files under the running dev server
**Statement:** Never create, edit, or delete `.env*` while the owner's `next dev` is running, never start a second instance, and never point the app at a mock without asking; an unavoidable env change is BLOCKED and reported with the `rm -rf .next` recovery.
**Class:** Verification / Environment · **Canonical home:** `VERIFICATION.md §4` · **Mirrors:** `AGENT-CORE.md §4, §8`, `MEMORY.md §5–6`, `NOTES.md N-020`, `WORKFLOW.md §3.2, §5.2` · **Enforced by:** BLOCKED — env change required · **Status:** active · **Origin:** owner:2026-09 (session feedback)

## DOC — documentation behaviour

### RULE-DOC-001 — Documentation Impact Review and reconciliation
**Statement:** After VERIFY, inspect the actual diff and record UPDATED / VERIFIED-NO-CHANGE / N/A / BLOCKED for every documentation layer per the decision matrix, updating every affected one.
**Class:** Documentation · **Canonical home:** `WORKFLOW.md §7.1–7.2` · **Mirrors:** `AGENT-CORE.md §6`, `WORKFLOW.md §6.1` (impact prediction), `WORKFLOW.md §9` (per-layer block), `CONSTITUTION.md §10`, `VERIFICATION.md §6` · **Enforced by:** per-layer block in the final report · **Status:** active · **Origin:** init

### RULE-DOC-002 — Changelog rules
**Statement:** After every significant task add a `changelog.md` entry under `## [x.y.z] - YYYY-MM-DD - Title` (SemVer, owner-confirmed bump) with Added/Changed/Fixed/Removed/Note bullets, a Breaking (deployment) preamble when operators must act, symptom/cause/fix for bugs, and never rewrite earlier entries.
**Class:** Documentation · **Canonical home:** `WORKFLOW.md §7.3` · **Mirrors:** `MEMORY.md §2`, `ENGINEERING.md §9` (C-04), `NOTES.md N-015`, `WORKFLOW.md §7.2` matrix · **Enforced by:** changelog line in the final report · **Status:** active · **Version:** 2 (heading level `##` from 1.7.0; owner:2026-09-18) · **Origin:** legacy §4.2

### RULE-DOC-003 — Version reconciliation
**Statement:** `package.json`, the profile-drawer footer, and the latest changelog heading must agree; any task that bumps one checks the other two.
**Class:** Documentation · **Canonical home:** `WORKFLOW.md §7.4` · **Mirrors:** `VERIFICATION.md §6`, `MEMORY.md §6` · **Enforced by:** VERIFICATION §6 checklist · **Status:** active · **Origin:** changelog 1.4.0/1.7.0 (recurring drift)

### RULE-DOC-004 — Memory is current state only
**Statement:** `MEMORY.md` is rewritten when reality changes and never used as a chronological diary or to hold contradictory old and new facts.
**Class:** Documentation · **Canonical home:** `WORKFLOW.md §7.5` · **Mirrors:** `MEMORY.md` header, `INDEX.md §1` · **Enforced by:** RE-READ MEMORY step in §8 · **Status:** active · **Origin:** init

### RULE-DOC-005 — Handoff updated or cleared before session end
**Statement:** Before ending, `HANDOFF.md` carries everything the next agent needs for in-flight work, or reads `IDLE` with stale instructions removed.
**Class:** Documentation · **Canonical home:** `WORKFLOW.md §7.6` · **Mirrors:** `HANDOFF.md` template, `WORKFLOW.md §8`, `WORKFLOW.md §3.2` · **Enforced by:** HANDOFF line in the final report · **Status:** active · **Origin:** init

### RULE-DOC-006 — ADR discipline
**Statement:** Create or update an ADR only for a durable decision a future agent could reopen; never for ordinary fixes; never edit an ADR in place to reverse it.
**Class:** Documentation · **Canonical home:** `WORKFLOW.md §7.7` · **Mirrors:** `decisions/INDEX.md`, `CONSTITUTION.md §9`, `WORKFLOW.md §7.2` matrix · **Enforced by:** judgment; ADR line in the final report · **Status:** active · **Origin:** init

### RULE-DOC-007 — Final report format
**Statement:** Every completed task ends with Classification, What changed, Verification (real results), the per-layer Documentation synchronised block, Remaining work, Owner decisions, and the Git line.
**Class:** Reporting · **Canonical home:** `WORKFLOW.md §9` · **Mirrors:** `WORKFLOW.md §5.1` (terse variant), `AGENT-CORE.md §7` · **Enforced by:** the report itself · **Status:** active · **Origin:** init + mls-server

## ENG — engineering conventions

### RULE-ENG-001 — Bun for everything local
**Statement:** Use `bun` / `bunx` for every install, script, and typecheck; never npm, yarn, or pnpm locally.
**Class:** Engineering · **Canonical home:** `ENGINEERING.md §1` · **Mirrors:** `VERIFICATION.md §1`, `AGENT-CORE.md §8`, `MEMORY.md §5` · **Enforced by:** commands in VERIFICATION · **Status:** active · **Origin:** legacy §2

### RULE-ENG-002 — Modular layering: types → lib/api → hooks → components
**Statement:** Types, request functions, hooks, and components live in their own trees and depend only downward.
**Class:** Engineering · **Canonical home:** `workflows/API-INTEGRATION-WORKFLOW.md` (procedure) and `ENGINEERING.md §2–3` (rule) · **Mirrors:** `ARCHITECTURE.md §3, §9`, `.agent/rules/api-integration-guide.md` adapter · **Enforced by:** review; file locations · **Status:** active · **Origin:** legacy (api-integration-guide + §3.1)

### RULE-ENG-003 — `@/` alias imports
**Statement:** Local imports use the `@/` alias; relative imports only within a folder that moves together.
**Class:** Engineering · **Canonical home:** `ENGINEERING.md §4` · **Mirrors:** `API-INTEGRATION-WORKFLOW.md` examples · **Enforced by:** review · **Status:** active · **Origin:** legacy §3.1

### RULE-ENG-004 — JSDoc/TSDoc on every export
**Statement:** Every exported function, component, hook, interface, and every non-obvious block carries a JSDoc/TSDoc comment explaining what, why when non-obvious, and params/returns.
**Class:** Engineering · **Canonical home:** `ENGINEERING.md §8` · **Mirrors:** `API-INTEGRATION-WORKFLOW.md` · **Enforced by:** review · **Status:** active · **Origin:** legacy §3.2

### RULE-ENG-005 — Flat design; colour tokens only
**Statement:** No gradients; new UI uses only the token classes from `app/globals.css`, never raw palette classes or hex values; legacy usage migrates when touched.
**Class:** Engineering · **Canonical home:** `ENGINEERING.md §7` with policy in `§9` · **Mirrors:** `NOTES.md N-013`, `MEMORY.md §8` · **Enforced by:** review; grep in AUDIT · **Status:** active · **Version:** 2 (migration policy added; owner:2026-09-18) · **Origin:** legacy §3.3

### RULE-ENG-006 — Zod validation on forms
**Statement:** Every new form validates with a Zod schema via `zodResolver`; existing plain-state forms migrate when touched.
**Class:** Engineering · **Canonical home:** `ENGINEERING.md §5` with policy in `§9` · **Mirrors:** `CONSTITUTION.md §7`, `NOTES.md N-012`, `MEMORY.md §8` · **Enforced by:** review · **Status:** active · **Version:** 2 (migration policy added; owner:2026-09-18) · **Origin:** legacy §5

### RULE-ENG-007 — kebab-case file naming
**Statement:** All `.ts`/`.tsx` files are kebab-case; the five PascalCase files in `components/admin-profile/` are renamed when a task touches them, with every importer updated in the same change.
**Class:** Engineering · **Canonical home:** `ENGINEERING.md §4` with policy in `§9` · **Mirrors:** `NOTES.md N-014`, `MEMORY.md §8` · **Enforced by:** review · **Status:** active · **Origin:** owner:2026-09-18 (C-03 ruling)

### RULE-ENG-008 — Components never call the API directly
**Statement:** Components and pages consume hooks only; hooks call `lib/api` functions only; `apiClient`, `axios`, and `fetch` appear nowhere else.
**Class:** Engineering · **Canonical home:** `workflows/API-INTEGRATION-WORKFLOW.md` (Core principle 3) and `ENGINEERING.md §2` · **Mirrors:** `ARCHITECTURE.md §3`, `domains/api-client.md` · **Enforced by:** review; grep in AUDIT · **Status:** active · **Origin:** legacy (api-integration-guide)

### RULE-ENG-009 — Errors through `lib/api-error.ts`
**Statement:** Read request failures with `getApiErrorMessage` / `getApiErrorDetails` / `hasStatus`; never `catch (error: any)` or hand-read `error.response.data`.
**Class:** Engineering · **Canonical home:** `ENGINEERING.md §6` · **Mirrors:** `domains/api-client.md`, `API-INTEGRATION-WORKFLOW.md` · **Enforced by:** review · **Status:** active · **Origin:** changelog 1.4.0

### RULE-ENG-010 — Polish locale, PLN, CET/CEST
**Statement:** Format dates and numbers as `pl-PL` through `utils/format-*.ts`, default currency PLN, always send `currency` with a price, timezone CET/CEST; the codebase is English.
**Class:** Engineering · **Canonical home:** `ENGINEERING.md §11` · **Mirrors:** `AGENT-CORE.md §8`, `domains/api-client.md` · **Enforced by:** review · **Status:** active · **Origin:** legacy §1 + changelog 1.4.0

## ARCH — architectural constraints

### RULE-ARCH-001 — Pure client; no server code
**Statement:** No route handlers, server actions, server-side fetching, or database access exist in this repository.
**Class:** Architecture · **Canonical home:** `ADR-001` · **Mirrors:** `ARCHITECTURE.md §1, §9`, `ENGINEERING.md §2`, `AGENT-CORE.md §8`, `MEMORY.md §2` · **Enforced by:** review; AUDIT tree check for `app/api/` · **Status:** active · **Origin:** ADR-001 (retro)

### RULE-ARCH-002 — No root `api/` directory
**Statement:** The API client lives at `lib/api/`; a root-level `api/` directory must never be created.
**Class:** Architecture · **Canonical home:** `ADR-002` · **Mirrors:** `ARCHITECTURE.md §3, §9`, `ENGINEERING.md §2`, `domains/api-client.md`, `AGENT-CORE.md §8` · **Enforced by:** AUDIT tree check · **Status:** active · **Origin:** ADR-002 (retro)

### RULE-ARCH-003 — Permission checks mirror the server; Super Admin is the wildcard
**Statement:** `usePermissions` implements the server's wildcard/exact/`resource:*` semantics and identifies Super Admin by `*`, using the role name only for the role record or as a permissions-empty fallback.
**Class:** Architecture · **Canonical home:** `ADR-004` · **Mirrors:** `domains/rbac-permissions.md`, `ENGINEERING.md §10`, `ARCHITECTURE.md §5` · **Enforced by:** review · **Status:** active · **Origin:** ADR-004 (retro)

### RULE-ARCH-004 — The server contract is the source of truth
**Statement:** Endpoints, payloads, envelopes, permissions, and error codes come from `../mls-server/docs/admin.openapi.json` / `docs/admin/authentication-guide.md` or the owner's pasted contract, never from UI assumptions or the stale local snapshot.
**Class:** Architecture · **Canonical home:** `ARCHITECTURE.md §2` · **Mirrors:** `AGENT-CORE.md §2, §8`, `domains/api-client.md`, `domains/auth-session.md`, `API-INTEGRATION-WORKFLOW.md`, `PRD-WORKFLOW.md`, `VERIFICATION.md §6`, `MEMORY.md §3` · **Enforced by:** VERIFICATION §6 contract check · **Status:** active · **Origin:** init (ADOPT) + memory

### RULE-ARCH-005 — Envelopes normalised once in `lib/api`
**Statement:** Every collection response passes through `lib/api/_shared/envelope.ts`; hooks and pages see `Paged<T>` only and read `pagination.totalPages`, never row counts.
**Class:** Architecture · **Canonical home:** `ADR-006` · **Mirrors:** `domains/api-client.md`, `ARCHITECTURE.md §3, §9`, `ENGINEERING.md §2`, `API-INTEGRATION-WORKFLOW.md` · **Enforced by:** review · **Status:** active · **Origin:** ADR-006 (retro)

## SEC — security

### RULE-SEC-001 — Never commit secrets
**Statement:** Secrets stay in gitignored `.env*` files and are read via `process.env`; none are committed or documented.
**Class:** Security · **Canonical home:** `ENGINEERING.md §10` · **Mirrors:** `AGENT-CORE.md §3.6`, `CONSTITUTION.md §6` · **Enforced by:** `.gitignore`; AUDIT · **Status:** active · **Origin:** legacy §5

### RULE-SEC-002 — Client permission checks are UX, not security
**Statement:** `proxy.ts`, `PermissionGuard`, the sidebar, and `<Can>` are usability boundaries; never present them as protection or skip server enforcement reasoning because of them.
**Class:** Security · **Canonical home:** `domains/rbac-permissions.md` · **Mirrors:** `CONSTITUTION.md §6`, `ENGINEERING.md §10`, `ARCHITECTURE.md §5`, `ADR-004`, `domains/auth-session.md` · **Enforced by:** judgment · **Status:** active · **Origin:** code comments (verified) + ADR-004

### RULE-SEC-003 — Strip server-provided secrets in `lib/api`
**Statement:** Any response field that the browser must not hold (carrier `apiKey`/`apiSecret` and the like) is removed in the `lib/api` function before it returns.
**Class:** Security · **Canonical home:** `domains/api-client.md` · **Mirrors:** `ENGINEERING.md §10`, `CONSTITUTION.md §6`, `API-INTEGRATION-WORKFLOW.md` · **Enforced by:** review · **Status:** active · **Origin:** changelog 1.5.0

## AGENT — coverage

### RULE-AGENT-001 — Entry points are adapters, not rulebooks
**Statement:** `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `.agent/rules/*.md`, and `.github/copilot-instructions.md` are thin adapters with relative links to `docs/ai/AGENT-CORE.md` and carry no independent rules.
**Class:** Agent coverage · **Canonical home:** `SYSTEM.md agents` · **Mirrors:** `AGENT-CORE.md` header, `INDEX.md §2` · **Enforced by:** AUDIT adapter diff · **Status:** active · **Origin:** init + owner:2026-09-18

---

## Superseded

None yet. A superseded rule keeps its ID here with `status: superseded by RULE-XXX-nnn`.
