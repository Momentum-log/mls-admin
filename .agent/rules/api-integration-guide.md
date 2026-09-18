---
trigger: model_decision
description: Adapter — the strict 4-step process for adding new API connections (types → lib/api → hook → component) now lives at docs/ai/workflows/API-INTEGRATION-WORKFLOW.md. Load that file whenever a task adds or changes a backend call.
---

# API & Mutation Creation Guide (adapter)

The canonical, path-corrected version of this guide is:

👉 **[docs/ai/workflows/API-INTEGRATION-WORKFLOW.md](../../docs/ai/workflows/API-INTEGRATION-WORKFLOW.md)**

Read it whenever you add or change any call to the backend. The original wording is preserved at `docs/ai/archive/legacy-api-integration-guide.md` (non-authoritative; its `@/api/…` paths are stale — the client moved to `@/lib/api/…` in 1.6.2).

Summary: **types/<feature>.ts → lib/api/<feature>/index.ts → hooks/<feature>/use-<feature>.ts → component.** Components never call Axios or `fetch`. Every admin path carries its own `/admin` prefix. Collections pass through `lib/api/_shared/envelope.ts`. Errors are read via `lib/api-error.ts`.
