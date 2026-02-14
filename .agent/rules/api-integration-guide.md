---
trigger: model_decision
description: This guide documents the strict 4-step process for adding new API connections to the project. Follow this workflow to ensure type safety, reusability, and clean architecture.
---

# API & Mutation Creation Guide

This guide documents the strict 4-step process for adding new API connections to the project. Follow this workflow to ensure type safety, reusability, and clean architecture.

---

## 🏗️ Core Principles

1.  **Modular**: Separate types, keys, and mutations.
2.  **Type-Safe**: Always define request/response interfaces first.
3.  **Hooks-Based**: Never call API functions directly in components; uses custom React Query hooks.

---

## 🚀 The 4-Step Workflow

### Step 1: Define Types (`types/[feature].ts`)

First, create specific interfaces for the payload (input) and the response (output).
_File: `types/auth.ts`_

```typescript
// 1. Define what the backend returns (Response)
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

// 2. Define what you send (Payload)
export interface RegisterData {
  email: string;
  password: string;
  name: string;
  guestUserId?: string;
}
```

### Step 2: Create API Function (`api/[feature]/index.ts`)

Create a pure function that calls the endpoint using the shared `apiClient` instance.
_File: `api/auth/index.ts`_

```typescript
import apiClient from "@/api"; // Global axios instance
import { RegisterData } from "@/types/auth"; // Types from Step 1

/**
 * Registers a new user.
 */
export const register = (data: RegisterData) => {
  return apiClient.post("/auth/register-user", data);
};
```

> **Note**: `apiClient` is the configured Axios instance located at `@/api/index.ts`. It handles base URLs, interceptors, and tokens automatically.

### Step 3: Create React Query Hook (`hooks/[feature]/use-[feature].ts`)

Wrap the API function in a TanStack Query hook (`useMutation` or `useQuery`). This is where side effects (like toasts or redirects) should generally live, or you can leave it pure.
_File: `hooks/auth/use-auth.ts`_

```typescript
import { useMutation } from "@tanstack/react-query";
import { register } from "@/api/auth"; // Function from Step 2
import { RegisterData } from "@/types/auth"; // Types from Step 1

export const useRegister = () => {
  return useMutation({
    mutationFn: (payload: RegisterData) => register(payload),
    // Optional: Add logging or global side effects here
    // onSuccess: (data) => { console.log("Registered!", data) }
  });
};
```

### Step 4: Consume in Component (`components/[feature]/[form].tsx`)

Import the hook and use it in your UI. This keeps your components clean and free of `fetch` or `axios` calls.
_File: `components/auth/register-form.tsx`_

```tsx
import { useRegister } from "@/hooks/auth/use-auth"; // Hook from Step 3

export default function RegisterForm() {
  // 1. Destructure the mutate function
  const { mutateAsync: register, isPending } = useRegister();

  const handleSubmit = async (values: any) => {
    await register(
      {
        email: values.email,
        password: values.password,
        name: values.name,
      },
      {
        onSuccess: () => {
          // Handle success (e.g., redirect)
        },
        onError: (error) => {
          // Handle error
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form Fields */}
      <button disabled={isPending}>
        {isPending ? "Registering..." : "Sign Up"}
      </button>
    </form>
  );
}
```

---

## 📂 Folder Structure Reference

```
/
├── api/
│   ├── index.ts           # Base Axios Instance
│   └── auth/              # Feature Folder
│       └── index.ts       # API Functions (Step 2)
├── types/
│   └── auth.ts            # Interfaces (Step 1)
├── hooks/
│   └── auth/              # Feature Folder
│       └── use-auth.ts    # React Query Hooks (Step 3)
└── components/
    └── auth/
        └── register-form.tsx # Usage (Step 4)
```
