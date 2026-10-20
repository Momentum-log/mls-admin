---
doc: CONSTITUTION
purpose: "Enduring engineering principles that do not change from task to task"
authority: canonical
hosts_rules: [RULE-YAGNI-001, RULE-YAGNI-002]
mirrors_rules: [RULE-GIT-001, RULE-CORE-003, RULE-SEC-001, RULE-VERIF-002, RULE-DOC-001]
last_reviewed: "2026-09-18"
---

# Engineering Constitution — MLS Admin

These principles are standing. They are not re-argued per task, and no plan may quietly set one aside. Where a principle has an operational rule, the rule's canonical home is linked; this document does not restate rule bodies.

---

## 1. YAGNI — You Aren't Gonna Need It

Build only what the current, approved task requires. No speculative props, config flags, generic wrappers, "future-proof" abstractions, or dependencies added on the chance they might be useful.

Concretely, in this repository:

- Do not add a store (Zustand is installed and unused — that is a finding, not an invitation).
- Do not create a barrel `index.ts` over `lib/api/*` — it would defeat tree-shaking to solve a problem that does not exist (see 1.6.2).
- Do not add a generic `useGuardedMutation`, a service layer, or a repository pattern above `lib/api` unless a task proves the need.
- Do not generalise a component used in one place.
- Do not create documentation, ADRs, plans, or domain files that have nothing real to say.

Rule: [RULE-YAGNI-001](RULES.md#rule-yagni-001).

## 2. Reuse before creation

Before writing anything, search `components/` (especially `components/ui/`), `hooks/`, `lib/`, `utils/`, and `types/` for something that already does it. The 1.5.0 changelog records three divergent copies of `getPaymentVariant` that had to be consolidated; that is the failure this principle prevents.

Rule: [RULE-YAGNI-002](RULES.md#rule-yagni-002).

## 3. Smallest correct change

Prefer the minimal diff that fully solves the problem. Do not reformat, rename, reorder, or "tidy" code the task did not touch. Opportunistic migration of legacy patterns (Zod, colour tokens, kebab-case) applies only to files the task is already editing — see [ENGINEERING.md §9](ENGINEERING.md#9-legacy-patterns-and-migration-policy).

## 4. Correctness before cleverness

Readable, explicit code over compact or clever code. A comment explaining *why* is worth more than a trick that saves three lines.

## 5. No speculative architecture, no speculative dependencies

Adding a dependency is an owner decision ([AGENT-CORE §4](AGENT-CORE.md#4-autonomy-boundaries)). Every new abstraction must be justified by code that exists today.

## 6. Security is mandatory

- Secrets never enter the repository or its documentation ([RULE-SEC-001](RULES.md#rule-sec-001)).
- Client-side permission checks are a usability boundary, not a security one; the server enforces. Never present a client check as protection ([RULE-SEC-002](RULES.md#rule-sec-002)).
- Data that the server should not have sent (carrier credentials, for example) is stripped in `lib/api` before it can reach component state ([RULE-SEC-003](RULES.md#rule-sec-003)).
- This dashboard's mutations act on real users, shipments, payments and staff. Destructive actions get confirmation dialogs in the UI and owner confirmation from agents.

## 7. Validation is mandatory

Form input is validated with a schema (Zod + `zodResolver`) at the boundary. The server validates independently; the client validates so the admin gets a precise message before a round-trip. Canonical rule and migration policy: [ENGINEERING.md §5](ENGINEERING.md#5-validation).

## 8. Verification is real, and gates are never weakened

A task is done when the gates in [VERIFICATION.md](VERIFICATION.md) pass with their real output shown — not when the code "should work". Never relax a lint rule, add a `@ts-ignore`, cast to `any`, or skip a check to make work appear complete ([RULE-VERIF-002](RULES.md#rule-verif-002)).

## 9. Fixed decisions are not relitigated

Accepted ADRs in [decisions/](decisions/INDEX.md) stand until superseded by a new ADR the owner approves. An agent may propose reversal with evidence; it may not act as though the decision were open.

## 10. Documentation describes reality

Every document in this system claims to describe the repository as it is. When code changes, the documents that describe it change in the same task ([WORKFLOW.md §7](WORKFLOW.md#7-documentation-impact-review-and-reconciliation)). A document that describes an intended state the code does not implement is worse than no document, because agents will trust it.

## 11. Never guess

When a fact is not established by the repository, the contract, or the owner — ask. Inference is labelled as inference ([RULE-CORE-003](RULES.md#rule-core-003)).

## 12. The owner controls history

Git is the owner's. Agents inspect; agents do not commit, branch, or push ([RULE-GIT-001](RULES.md#rule-git-001)).
