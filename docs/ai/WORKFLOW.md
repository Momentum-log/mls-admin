---
doc: WORKFLOW
purpose: "The agent state machine: task classification, gates and approvals, output and command protocols, planning template, documentation reconciliation, completion sequence, final report"
authority: canonical
hosts_rules: [RULE-WF-001, RULE-WF-002, RULE-WF-004, RULE-WF-005, RULE-WF-006, RULE-WF-007, RULE-WF-008, RULE-AUTON-004, RULE-AUTON-005, RULE-AUTON-006, RULE-DOC-001, RULE-DOC-002, RULE-DOC-003, RULE-DOC-004, RULE-DOC-005, RULE-DOC-006, RULE-DOC-007]
mirrors_rules: [RULE-GIT-001, RULE-AUTON-001, RULE-AUTON-002, RULE-AUTON-003, RULE-WF-003, RULE-VERIF-001, RULE-YAGNI-002]
last_reviewed: "2026-09-18"
---

# Development Workflow — MLS Admin

> This is not a checklist. It is the state machine every task moves through. It decides what kind of work has arrived, which gate applies, what must be read, how implementation and verification proceed, and which documentation layers must be reconciled before the task can be called complete.

---

## 1. The lifecycle

```text
ORIENT → UNDERSTAND → PLAN → REUSE SEARCH → IMPLEMENT → VERIFY → RECORD → HANDOFF
```

| Phase | What happens |
|---|---|
| **Orient** | Startup protocol in [AGENT-CORE §1](AGENT-CORE.md#1-universal-startup-protocol). Read `MEMORY.md`, `HANDOFF.md`, and the current Git state (read-only). |
| **Understand** | Restate the request. Identify requirements, constraints, non-goals. Read the PRD / contract / domain doc for the area. Ask the owner when anything is ambiguous. |
| **Plan** | Classify (§2), enter the state machine (§3), pass the applicable gate (§4), produce the plan (§6). |
| **Reuse search** | Search `components/`, `hooks/`, `lib/`, `utils/`, `types/` for existing code before writing anything. Record what was found. |
| **Implement** | Silent execution of the approved plan, following [ENGINEERING.md](ENGINEERING.md) and the [API integration workflow](workflows/API-INTEGRATION-WORKFLOW.md) where applicable. |
| **Verify** | Every gate in [VERIFICATION.md](VERIFICATION.md), with real output. |
| **Record** | Documentation Impact Review (§7). |
| **Handoff** | Update or clear `HANDOFF.md`; final report (§9); ready-for-commit statement. |

---

## 2. Task intake and classification

Every request is classified **before** any plan or edit. State the classification in the plan and in the final report.

| # | Class | Meaning | Gate |
|---|---|---|---|
| 1 | **New product capability** | A new screen, user flow, dashboard module, endpoint group, or product concept that does not exist today | §4.1 PRD workflow |
| 2 | **Enhancement / extension** | Expands an existing capability; changes scope or behaviour without a new product concept | §4.3 |
| 3 | **Bug fix / defect / regression** | Existing intended behaviour is broken, incorrect, unsafe, or regressed | §4.2 |
| 4 | **Refactor / technical debt** | Changes structure without changing externally visible behaviour | §4.4 |
| 5 | **Maintenance / dependency / configuration** | Packages, tooling, deployment, env, generated assets | §4.5 |
| 6 | **Documentation-only** | Changes documentation without changing behaviour | §4.5 |
| 7 | **Investigation / spike** | Answers a question or validates an approach; no implementation commitment | Analysis-only ([AGENT-CORE §3.2](AGENT-CORE.md#32-analysis-only-by-default)) |
| — | **Amendment to this system** | The owner states a new or changed rule, gate, convention, or reporting requirement | [SYSTEM.md — How to amend](SYSTEM.md#how-to-amend-a-rule-in-this-system) |

If a single request contains both an amendment and implementation work, the amendment lands first so the work complies with it.

---

## 3. The task state machine

### 3.1 States

```text
INTAKE
  ↓
ORIENT                      startup protocol; read memory + handoff + git state
  ↓
CLASSIFY                    §2 — stated explicitly
  ↓
REQUIREMENTS DISCOVERY      PRD / contract / domain doc / code read; questions asked
  ↓
┌───────────────────────────────────────────────────────────────────┐
│ New capability → PRD-WORKFLOW → OWNER PRD APPROVAL → tasks file   │
│ Everything else non-trivial → IMPLEMENTATION PLAN (§6)            │
│ Trivial → MICRO-PLAN (§6.2)                                       │
└───────────────────────────────────────────────────────────────────┘
  ↓
OWNER PLAN APPROVAL         Pre-Edit Summary presented (§5.1); explicit "go"
  ↓
IMPLEMENT                   silent; approved scope only; command protocol (§5.2)
  ↓
VERIFY                      VERIFICATION.md gates, real output
  ↓
DOCUMENTATION IMPACT REVIEW §7 — against the actual diff
  ↓
RECONCILE AFFECTED DOCS     every affected layer updated; per-layer status recorded
  ↓
FINAL REVIEW                re-read MEMORY.md and HANDOFF.md; self-healing check (§7.6)
  ↓
READY FOR OWNER COMMIT      final report (§9); no Git operation performed
```

A task must not skip a gate. Autonomous work is permitted only inside the boundaries an approved plan defines.

### 3.2 Failure states

Any of these halts forward progress. The task is **not complete**; `HANDOFF.md` must carry the blocker and the exact next decision or action required.

```text
BLOCKED — missing owner decision          (product decision, trade-off, ADR override)
BLOCKED — missing requirement             (contract / PRD does not define the behaviour)
BLOCKED — verification failure            (a gate failed and cannot be fixed within scope)
BLOCKED — documentation conflict          (two authoritative documents disagree; hierarchy cannot resolve)
BLOCKED — unauthorised Git operation requested
BLOCKED — backend unavailable             (mls-server down / 500ing; cannot verify against it)
BLOCKED — env change required under running dev server (see VERIFICATION.md §4)
```

Report the state by name. Do not describe a blocked task as "mostly done".

---

## 4. Gates by classification

### 4.1 New product capability — the feature gate

Do not go from request to implementation. Follow [workflows/PRD-WORKFLOW.md](workflows/PRD-WORKFLOW.md):

1. Discovery (existing PRDs, server contract, capability audit, owner questions).
2. Draft `docs/prd/prd-<feature>.md` → **owner approves**.
3. Draft `docs/tasks/tasks-<feature>.md` → **owner approves**.
4. Implement against the tasks file, checking items off as they are *verified*.

Owner ruling 2026-09-18: this applies to **every** new capability, however small. If you believe a request is too small to warrant it, say so and let the owner decide — do not decide for them.

### 4.2 Bug fix — the defect gate

1. Establish the **expected** behaviour from the PRD, the server contract, existing accepted behaviour, or the owner. Do not assume the current code is the spec.
2. Reproduce or otherwise establish the defect (running app, network tab, contract comparison).
3. Find the **root cause** before touching code. "It works now" without a cause is not a fix.
4. Produce a concise plan (§6) — or a micro-plan (§6.2) for a one-line fix — including the regression check that fails before and passes after (manual, given there is no test runner today; see [VERIFICATION.md §3](VERIFICATION.md#3-manual-verification-in-the-running-app)).
5. Present the Pre-Edit Summary or PROBLEM/COST/FIX block (§5.1). Owner approval is required unless the current task already authorises immediate execution.
6. Implement the smallest correct fix.
7. Verify the fix **and** adjacent behaviour that shares the code path.
8. Record: changelog entry with symptom / cause / fix (§7.3); memory if a durable gotcha or current-state fact changed; notes if something remains open; ADR only if a durable decision changed.

### 4.3 Enhancement — the extension gate

1. Read the existing feature's PRD, domain doc, and the code.
2. Decide: corrective tweak, small refinement, or meaningful scope expansion? If it introduces a new product concept, reclassify as §4.1 and say so.
3. Implementation plan for anything non-trivial; owner approval before editing unless already covered by an approved plan.
4. Update the feature's documentation if the current behaviour changes.

### 4.4 Refactor — the debt gate

1. State why the refactor is needed **now** — a task it unblocks, a defect it prevents, a duplication it removes.
2. Confirm externally visible behaviour stays identical unless the owner explicitly wants otherwise.
3. Reuse search and duplication search first.
4. Plan proportional to the risk. A rename across 17 files is not trivial.
5. No new abstraction "because it could be cleaner".
6. Update `ARCHITECTURE.md` / `ENGINEERING.md` only if the structural reality changes.

### 4.5 Maintenance and documentation-only

- Dependency changes are an owner decision ([AGENT-CORE §4](AGENT-CORE.md#4-autonomy-boundaries)); use the package-install request block (§5.3).
- Config changes that affect deployment (`vercel.json`, `next.config.ts`) are disclosed and approved before editing.
- Documentation-only work still goes through §7 — it usually touches more than one layer.

### 4.6 Trivial work — the micro-plan

Genuinely trivial changes (a typo, a single wrong label, a missing `key`) may use the micro-plan in §6.2 instead of the full template. "Trivial" never bypasses verification (§VERIFY) or documentation impact (§7). If a "trivial" change turns out to touch behaviour, stop and reclassify.

---

## 5. Output and command protocols

These are owner-mandated. They exist so the owner always knows what is about to happen and what happened, with no narration in between.

### 5.1 Two moments of output

**Before implementation** — one of two blocks, then silence.

For a **feature, enhancement, refactor, or any multi-file change** — the **Pre-Edit Summary**:

```text
PRE-EDIT SUMMARY
─────────────────────────────────────
Classification:   <one of the seven classes>
Problems found:   <what is wrong or missing, with file paths>
Will change:      <the concrete outcome>
How and why:      <approach, reuse found, rationale>
Files involved:   <exact create / modify list>
Plan:             <ordered steps>
Verification:     <which gates, which manual checks>
Doc impact:       <predicted layers — see §6 template>
─────────────────────────────────────
⏳ Awaiting approval before editing.
```

For a **targeted fix** (single-cause bug, one or two files), the terse block:

```text
PROBLEM:  <one sentence — what is wrong or missing>
COST:     <one sentence — what fails or regresses if this is not fixed>
FIX:      <one sentence — the specific action you will take>
```

**During implementation** — silence. No "Now I will…", no progress narration, no mid-task confirmations unless genuinely blocked (§3.2). Resolve unexpected problems silently when they are inside the approved scope; raise a Scope Check (§5.4) when they are not.

**After implementation** — the final report (§9). For a targeted fix the report may be reduced to:

```text
DONE:     <one sentence — what concretely changed>
OUTCOME:  <fixed | partial | failed> — <one sentence — why>
```

followed by the mandatory Verification, Documentation synchronised, and Git lines from §9. Those three lines are never omitted, however terse the report.

Every field is one sentence. If a word can be cut, cut it.

### 5.2 Terminal command protocol

No command runs silently. Before each command:

```text
📦 COMMAND REQUEST
─────────────────────────────────────
Command:         <exact command>
Purpose:         <what it does, plain English>
Scope:           <why this task needs it>
Risk:            <side effects: writes files, hits the backend, installs, deletes, none>
Requires input:  Yes / No
─────────────────────────────────────
⏳ Awaiting confirmation before proceeding.
```

Practical notes for this repository:

- Read-only inspection (`git status`, `git diff`, `ls`, `cat`, `grep`, `bunx tsc --noEmit`, `bun run lint`) still gets a disclosure, but several may be batched in one block when they are all read-only and all serve the same step.
- Never pass prompt-suppressing flags (`--yes`, `-y`, `--force`, `--non-interactive`) to a command that would otherwise ask.
- Never start a second `next dev` — the owner's instance holds the Turbopack lock on `:3000` ([VERIFICATION.md §4](VERIFICATION.md#4-environment-rules)).
- For an interactive command, hand it to the owner:

```text
🖊️ INTERACTIVE COMMAND — YOUR INPUT REQUIRED
─────────────────────────────────────
Run this yourself:
  <exact command>
Expected prompt(s):
  - "<prompt>" → <what to enter>
Return here and tell me to continue.
─────────────────────────────────────
```

### 5.3 Package install request

Adding, removing, or upgrading a dependency:

```text
📦 PACKAGE INSTALL REQUEST
─────────────────────────────────────
Package:        <name@version>
Command:        bun add <package>        (or bun add -d / bun remove)
What it does:   <plain English>
Why needed:     <specific justification for this task>
Alternatives:   <why existing dependencies cannot do it>
─────────────────────────────────────
⏳ Awaiting confirmation before installing.
```

### 5.4 Scope check

When an action outside the approved plan becomes necessary mid-task:

```text
🔍 SCOPE CHECK — OUT-OF-ORIGINAL-SCOPE ACTION
─────────────────────────────────────
Original task:   <request>
New action:      <proposed action>
Reason:          <why now>
Risk:            <side effects>
─────────────────────────────────────
This was not part of the original request. Proceed?
```

---

## 6. Planning protocol

### 6.1 The plan template

Every non-trivial task gets a plan at the smallest level of detail that allows safe execution. It lives in the tasks file (features), in `docs/ai/plans/active/` (multi-session non-feature work), or inline in the Pre-Edit Summary (single-session work).

```text
Problem            what is wrong or what capability is required
Evidence           files, contract sections, logs, observations that establish it
Classification     one of the seven classes
Scope              explicitly included
Non-goals          explicitly excluded
Proposed solution  the smallest correct approach
Existing reuse     what code / component / hook / type / pattern will be reused
Files to change    expected paths (update the list when discovery expands it)
Verification       gates + manual checks that prove correctness
Documentation impact
  PRD/tasks    → if product behaviour or scope changes
  Memory       → if current-state knowledge changes
  Handoff      → if work remains or context transfers
  Notes        → if observations, deferrals, gotchas need recording
  ADR          → if a durable decision is created / changed / reinforced
  Architecture → if structure changes
  Engineering  → if conventions change
  Domain docs  → if domain behaviour or structure changes
  Changelog    → if completed work meets the changelog criteria (§7.3)
Owner decisions    anything only the owner can decide
```

The documentation-impact prediction is part of the plan, not a cleanup step.

### 6.2 The micro-plan

For trivial work:

```text
Problem → Change → Verification → Documentation impact
```

All four are stated. "Documentation impact: none" is a valid answer only when it is true.

---

## 7. Documentation Impact Review and reconciliation

This is a mandatory phase after VERIFY. It is performed against the **actual diff**, not against the plan.

### 7.1 Inspect reality

Review what actually changed: files, types, hooks, API paths, UI flows, config, env, dependencies, resolved defects, plan/tasks status, owner decisions made during the work.

### 7.2 Reconcile every affected layer

For each layer, record one of:

```text
UPDATED               the change required new information
VERIFIED / NO CHANGE  reviewed and current; no edit required
NOT APPLICABLE        this layer does not apply to this task
BLOCKED               cannot reconcile; owner input or source missing
```

Decision matrix:

| Change observed | Documentation action |
|---|---|
| New product capability shipped | Tasks file items checked; PRD marked delivered if it tracks status; `MEMORY.md` features; `changelog.md`; relevant domain doc; ADR only if a durable decision exists |
| New screen / flow / module | As above, plus `ARCHITECTURE.md` route list |
| Bug discovered (not yet fixed) | `NOTES.md` entry; handoff if it blocks |
| Bug fixed | `changelog.md` with symptom / cause / fix; `MEMORY.md` if a current-state fact or durable gotcha changed; `NOTES.md` for anything left open or a deliberate non-fix; ADR only if a decision changed |
| Regression discovered | `NOTES.md` + `changelog.md`; memory / ADR if durable |
| Architecture changed | `ARCHITECTURE.md` + ADR + `MEMORY.md` + `changelog.md` |
| Technology choice changed | ADR + `ARCHITECTURE.md` + `MEMORY.md` + `ENGINEERING.md` if practice changes + `changelog.md` |
| Convention changed | `ENGINEERING.md` + `MEMORY.md` if needed + `changelog.md` — and this is an **amendment**; see `SYSTEM.md` |
| Config / env changed | `ARCHITECTURE.md` env section + `MEMORY.md` environment + `changelog.md` with a **Breaking (deployment)** note if operators must act |
| API contract consumed changed | Types + domain doc (`domains/api-client.md` or the feature's domain) + `MEMORY.md` + `changelog.md` |
| Dependency added / removed | `ENGINEERING.md`/`ARCHITECTURE.md` if it becomes a standard; `MEMORY.md` environment; `changelog.md` |
| Planned work added / reordered | Tasks file or `plans/active/` + `MEMORY.md` current position |
| Open concern found, not fixed | `NOTES.md` + `HANDOFF.md` if relevant; never claim completion |
| Intentional non-fix | `NOTES.md` with reason and revisit trigger |
| Decision made, not architecture-level | `MEMORY.md` or the plan; no ADR |
| Durable architecture / product / engineering decision | ADR created or updated + current-state docs + `changelog.md` |
| Documentation-only correction | The document itself; `changelog.md` only if the project convention calls for it (it does not, for pure doc fixes) |

### 7.3 Changelog rules

`changelog.md` is the human-readable history. Its style is established and is preserved as-is; agents match it.

- **When:** after every significant task — a feature, an enhancement, a bug fix, a dependency or config change with user-visible or operational effect, a version bump. Not for pure documentation fixes or for changes to the AI system itself.
- **Version:** SemVer. Major = breaking API / architecture shift; minor = backward-compatible feature; patch = fix or minor adjustment. The agent proposes the bump; the owner confirms it.
- **Heading:** `## [x.y.z] - YYYY-MM-DD - Short title` — level-two heading for every new entry from 1.7.0 onward (owner ruling 2026-09-18). Earlier entries use `###`; they are history and are not rewritten.
- **Preamble:** when a release has a deployment consequence, open with `**Breaking (deployment):** …` stating exactly what an operator must do (see 1.4.0 and 1.7.0).
- **Body:** `- **Added** / **Changed** / **Fixed** / **Removed** / **Note**:` bullets. For a fix, the bullet states the **symptom as experienced**, the **root cause**, why existing checks let it through when that is known, and the **actual fix**. "Fixed import issue" is not an entry. Reference PRD item codes and file paths where they help.
- **Historical accuracy:** an entry that was accurate when written is left as it stands even when a later release reverses it; add a `**Note**` in the new entry pointing back (see 1.6.2 and 1.7.0 for the pattern).

### 7.4 Version reconciliation

`package.json` `version`, the footer in `components/admin-profile/AdminProfileDrawer.tsx`, and the latest `changelog.md` heading must agree. They have drifted three times (0.5.1 / 1.3.0; 1.6.0 / 1.6.2). Any task that bumps one checks the other two.

### 7.5 Memory reconciliation

`MEMORY.md` is **current state only**. After documentation updates, re-read it and fix any statement the task made stale — a moved module, a changed provider, a completed deferral, a reversed decision. Rewrite the fact; do not append the new truth beside the old one. Never turn memory into a diary.

### 7.6 Handoff, plan, and the self-healing check

- If work remains: `HANDOFF.md` is updated before the session ends with everything the next agent needs (template in that file).
- If work is complete: `HANDOFF.md` is set to `IDLE`, stale instructions removed.
- The tasks file / active plan reflects reality — items are checked only when verified; deviations are recorded.
- Then ask: **"If a completely new agent opened this repository tomorrow, what would it need to know that the documentation does not yet say?"** Inspect for stale paths, stale architecture statements, missing gotchas, missing plan status, answered-but-open questions, changelog entries missing the real cause. Repair what is within the authorised scope. Do not manufacture documentation to make the list longer.

### 7.7 ADR discipline

Create or update an ADR only when the work establishes, changes, or permanently clarifies a decision a future agent could reasonably need to understand — and could otherwise reopen. Ordinary fixes get a changelog entry and, where relevant, a note. When a bug exposes a rule that must govern future code, that rule goes into `ENGINEERING.md` or an ADR and the changelog links to it.

---

## 8. Completion sequence

```text
IMPLEMENT
  ↓
VERIFY                         all gates, real output
  ↓
INSPECT ACTUAL DIFF
  ↓
DOCUMENTATION IMPACT REVIEW    §7.1–7.2
  ↓
UPDATE AFFECTED DOCS           §7.3–7.5, 7.7
  ↓
RE-READ MEMORY.md + HANDOFF.md
  ↓
HANDOFF / CLEAR HANDOFF        §7.6
  ↓
FINAL REPORT                   §9
  ↓
READY FOR OWNER REVIEW / COMMIT
```

Do not report completion before the documentation phase finishes. A passing typecheck is not evidence that the repository is fully updated.

---

## 9. Final report format

Every completed implementation response contains, in this order:

```text
Classification:        <class>
What changed:          <concise, technically accurate summary; file paths>
Verification:          <each gate with its actual result — command and pass/fail;
                        the manual check performed in the running app>
Documentation synchronised:
  changelog.md         UPDATED | VERIFIED / NO CHANGE | N/A — <why>
  MEMORY.md            …
  HANDOFF.md           …
  NOTES.md             …
  tasks / plan         …
  ADR                  …
  ARCHITECTURE.md      …
  ENGINEERING.md       …
  domain docs          …
Remaining work:        <anything genuinely unfinished, or "none">
Owner decisions:       <anything still needing the owner, or "none">
Git:                   No branch, stage, commit, or history operation was performed.
                       The working tree is ready for your review and commit.
```

Then ask whether the owner wants a Git operation performed. Do not perform it.

A report that omits the per-layer documentation block, the real verification output, or the Git line is not complete.
