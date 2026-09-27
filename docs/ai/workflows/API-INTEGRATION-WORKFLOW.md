---
doc: API-INTEGRATION-WORKFLOW
purpose: "The mandatory 4-layer pattern for adding any new API connection: types → lib/api function → TanStack Query hook → component"
authority: canonical
hosts_rules: [RULE-ENG-002, RULE-ENG-008]
mirrors_rules: [RULE-ENG-004, RULE-ENG-009, RULE-ARCH-005]
last_reviewed: "2026-09-18"
origin: "Canonicalised from .agent/rules/api-integration-guide.md on 2026-09-18 (archived at docs/ai/archive/legacy-api-integration-guide.md); paths corrected from @/api to @/lib/api"
---

# API & Mutation Creation Workflow

This is the strict 4-step process for adding a new API connection to `mls-admin`. Follow it every time a component needs data or needs to mutate something on the server. It exists so that types, transport, caching and UI stay in separate files that can be reasoned about — and reused — independently.

> The original wording of this guide lives in `docs/ai/archive/legacy-api-integration-guide.md`. The only substantive change here is the path correction: the client moved from `api/` to `lib/api/` in 1.6.2 ([ADR-002](../decisions/ADR-002-api-client-under-lib-not-root-api.md)).

---

## Core principles

1. **Modular** — types, API functions and hooks are separate files in separate trees.
2. **Type-safe** — the request payload and response interfaces are written *first*, before any transport code.
3. **Hooks-based** — components never call `apiClient`, `axios` or `fetch`. They consume a TanStack Query hook. This is [RULE-ENG-008](../RULES.md#rule-eng-008).

---

## The 4-step workflow

### Step 1 — Define types (`types/<feature>.ts`)

Create specific interfaces for the payload (input) and the response (output). One file per feature; reuse `types/api.ts` for the shared `ApiErrorBody`, `Pagination` and `Paged<T>` shapes.

```typescript
// types/auth.ts

// 1. What the backend returns
export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// 2. What you send
export interface RegisterData {
  email: string;
  password: string;
  name: string;
  guestUserId?: string;
}
```

Before writing a type, check the server contract — `../mls-server/docs/admin.openapi.json` is authoritative for admin endpoints ([RULE-ARCH-004](../RULES.md#rule-arch-004)). Do not guess field names from the UI.

### Step 2 — Create the API function (`lib/api/<feature>/index.ts`)

A pure function that calls the endpoint through the shared `apiClient`. No React, no toasts, no redirects here.

```typescript
// lib/api/auth/index.ts
import apiClient from "@/lib/api";            // configured Axios instance
import type { RegisterData } from "@/types/auth";

/**
 * Registers a new user.
 *
 * @param data - Registration payload.
 */
export const register = (data: RegisterData) => {
  return apiClient.post("/auth/register-user", data);
};
```

Notes:

- `apiClient` (`lib/api/index.ts`) already sets the base URL from `NEXT_PUBLIC_API_URL`, attaches the bearer token, slides the session cookie on success, and handles the global 401 redirect. Do not re-implement any of that per feature.
- Every admin path carries its own `/admin` prefix (`/admin/users`, `/admin/auth/me`). The base URL ends at `/api`. Mixing conventions was the cause of the 1.4.0 path bug.
- If the endpoint returns a collection, normalise it through `lib/api/_shared/envelope.ts` so hooks see one `Paged<T>` shape ([ADR-006](../decisions/ADR-006-response-envelope-normalisation.md)).
- If the response spreads a server row that contains secrets (carrier `apiKey`/`apiSecret`, for example), strip them here — this layer is the last place before data lands in component state ([RULE-SEC-003](../RULES.md#rule-sec-003)).

### Step 3 — Create the React Query hook (`hooks/<feature>/use-<feature>.ts`)

Wrap the API function in `useQuery` or `useMutation`. Side effects — toasts, cache invalidation, redirects — belong here, not in the component and not in the API function.

```typescript
// hooks/auth/use-auth.ts
import { useMutation } from "@tanstack/react-query";
import { register } from "@/lib/api/auth";
import type { RegisterData } from "@/types/auth";
import { getApiErrorMessage } from "@/lib/api-error";
import { toast } from "react-hot-toast";

/**
 * Mutation hook for registering a new user.
 */
export const useRegister = () => {
  return useMutation({
    mutationFn: (payload: RegisterData) => register(payload),
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Registration failed"));
    },
  });
};
```

Read errors through `lib/api-error.ts` (`getApiErrorMessage`, `getApiErrorDetails`, `hasStatus`). Never `catch (error: any)` ([RULE-ENG-009](../RULES.md#rule-eng-009)).

### Step 4 — Consume in the component (`components/<feature>/<name>.tsx` or a page)

```tsx
// components/auth/register-form.tsx
import { useRegister } from "@/hooks/auth/use-auth";

export default function RegisterForm() {
  const { mutateAsync: register, isPending } = useRegister();

  const handleSubmit = async (values: RegisterData) => {
    await register(values, {
      onSuccess: () => {
        // e.g. redirect
      },
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* fields */}
      <button disabled={isPending}>{isPending ? "Registering…" : "Sign Up"}</button>
    </form>
  );
}
```

The component is free of transport concerns. If it needs to gate the action on a permission, wrap the control in `<Can permission="…">` (`components/auth/can.tsx`).

---

## Folder structure reference

```text
/
├── lib/
│   ├── api/
│   │   ├── index.ts              # configured Axios instance (base URL, token, 401 handling)
│   │   ├── _shared/envelope.ts   # response/pagination normalisation
│   │   └── <feature>/index.ts    # API functions (Step 2)
│   └── api-error.ts              # error-envelope helpers
├── types/
│   ├── api.ts                    # ApiErrorBody, Pagination, Paged<T>
│   └── <feature>.ts              # interfaces (Step 1)
├── hooks/
│   └── <feature>/use-<feature>.ts  # TanStack Query hooks (Step 3)
└── components/
    └── <feature>/<name>.tsx      # usage (Step 4)
```

---

## Checklist for a new endpoint

- [ ] Contract checked against `../mls-server/docs/admin.openapi.json` (or the owner-pasted contract)
- [ ] Types in `types/<feature>.ts`, exported and documented
- [ ] Pure function in `lib/api/<feature>/index.ts`, path carries its own `/admin` prefix
- [ ] Collection responses normalised via `envelope.ts`
- [ ] Sensitive fields stripped before return
- [ ] Hook in `hooks/<feature>/`, errors via `lib/api-error.ts`, cache invalidated on mutation success
- [ ] Component consumes the hook only; destructive controls wrapped in `<Can>`
- [ ] `bunx tsc --noEmit` and `bun run lint` clean
