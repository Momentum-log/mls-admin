---
doc: ENGINEERING
purpose: "Code-writing standards that actually apply in mls-admin: tooling, structure, naming, typing, validation, errors, styling, security, locale, and the legacy-migration policy"
authority: canonical
hosts_rules: [RULE-ENG-001, RULE-ENG-003, RULE-ENG-004, RULE-ENG-005, RULE-ENG-006, RULE-ENG-007, RULE-ENG-009, RULE-ENG-010, RULE-SEC-001, RULE-SEC-003]
mirrors_rules: [RULE-ENG-002, RULE-ENG-008, RULE-ARCH-001, RULE-ARCH-003, RULE-ARCH-005, RULE-SEC-002, RULE-YAGNI-002]
last_reviewed: "2026-09-18"
origin: "Sections 1–8 carried from .agent/rules/instruction.md (archived); §9 migration policy and the C-01…C-04 rulings are owner decisions of 2026-09-18"
---

# Engineering Standards — MLS Admin

> Only standards that are real requirements of this repository. Where a standard has a registered rule, the ID is linked. Where a standard exists but the code does not yet fully follow it, §9 says what an agent does about the gap.

---

## 1. Toolchain

- **Bun** for everything: `bun install`, `bun add`, `bun run dev|build|lint`, `bunx tsc --noEmit` ([RULE-ENG-001](RULES.md#rule-eng-001)). Never `npm`/`yarn`/`pnpm` locally. `vercel.json` and `.claude/launch.json` currently say `npm`; the owner has ruled that should become Bun everywhere — tracked as deferred work in `NOTES.md` N-007 — but agents do not change deployment config as a side effect of another task.
- TypeScript **strict** (`tsconfig.json`), `moduleResolution: bundler`, path alias `@/*` → `./*`.
- ESLint 9 flat config: `eslint-config-next/core-web-vitals` + `eslint-config-next/typescript`. No Prettier; formatting is whatever ESLint enforces plus the existing style (2-space, double quotes, trailing commas, semicolons).
- Tailwind CSS 4 via `@tailwindcss/postcss`; theme tokens in `app/globals.css` under `@theme inline`. shadcn/ui, style `new-york`, `radix-ui` monopackage, `lucide-react` icons.

## 2. Project structure and layering

```text
app/              Next.js App Router pages and layouts — every page is "use client"
components/       React components; components/ui/ = shadcn primitives + small shared widgets
hooks/            TanStack Query hooks per feature (hooks/<feature>/use-<feature>.ts) + cross-cutting (use-permissions, use-debounce)
lib/api/          the Axios client and one folder per backend feature (pure request functions)
lib/api/_shared/  envelope normalisation
lib/              cross-cutting non-React code (api-error, rbac, shipment-status, auth/session, utils)
types/            TypeScript interfaces per feature; types/api.ts = shared envelope shapes
utils/            pure formatting/correlation helpers (currency, date, phone)
public/           static assets, fonts (Satoshi, Work Sans)
docs/             product docs, PRDs, tasks, reviews, server-contract copies
docs/ai/          this operating system
```

Layering is strict and one-directional ([RULE-ENG-002](RULES.md#rule-eng-002), [RULE-ENG-008](RULES.md#rule-eng-008)):

```text
types  →  lib/api  →  hooks  →  components / app
```

- Components and pages **never** import `apiClient`, `axios`, or call `fetch`. They consume hooks.
- Hooks **never** build URLs or touch Axios directly. They call `lib/api/<feature>` functions.
- `lib/api` functions are pure: no React, no toasts, no navigation. Side effects live in hooks.
- Collections are normalised through `lib/api/_shared/envelope.ts` before a hook sees them ([RULE-ARCH-005](RULES.md#rule-arch-005)).
- There is **no** `app/api/`, no route handler, no server action, no server component that fetches ([RULE-ARCH-001](RULES.md#rule-arch-001)). Do not add one. There is no root `api/` directory and there must not be one — Vercel would deploy it as serverless functions ([ADR-002](decisions/ADR-002-api-client-under-lib-not-root-api.md)).

The full 4-step procedure for a new endpoint is [workflows/API-INTEGRATION-WORKFLOW.md](workflows/API-INTEGRATION-WORKFLOW.md).

## 3. Modularity

Code is modular. Distinct logic, constants, and types go in separate files ([RULE-ENG-002](RULES.md#rule-eng-002)).

- Anti-pattern: a 500-line component with fetching, state, formatting, and markup mixed together.
- Pattern: `use-shipping-calculator.ts` (hook) + `shipping.ts` in `types/` + `shipping-form.tsx` (UI).
- Before writing, check `components/ui/`, `hooks/`, `utils/`, `lib/` for an existing implementation ([RULE-YAGNI-002](RULES.md#rule-yagni-002)). Shared status → variant mappings belong in `lib/shipment-status.ts`, not re-derived per component.

## 4. Naming and imports

- **Files:** kebab-case for every `.ts`/`.tsx` file (`carrier-detail-sheet.tsx`, `use-address-requests.ts`, `format-currency.ts`) ([RULE-ENG-007](RULES.md#rule-eng-007)). The five PascalCase files in `components/admin-profile/` are legacy — see §9.
- **Identifiers:** `camelCase` for variables and functions, `PascalCase` for components and types, `SCREAMING_SNAKE` for module constants (`SUPERUSER_WILDCARD`, `TOKEN_COOKIE`).
- **Hooks:** `use-` prefix on the file and `use` prefix on the export; one file per feature under `hooks/<feature>/`.
- **Imports:** always the `@/` alias for local modules ([RULE-ENG-003](RULES.md#rule-eng-003)) — `import { Button } from "@/components/ui/button"`. Relative imports only inside a feature folder when the files move together.
- **Components:** functional, hooks-based. Pages export `default`; shared components export named where the existing folder does.

## 5. Validation

Form input is validated with a **Zod** schema wired through `react-hook-form` + `@hookform/resolvers/zod` ([RULE-ENG-006](RULES.md#rule-eng-006)). `app/login/page.tsx` is the reference implementation (`emailSchema`, `passwordSchema`, `sixDigitSchema`).

- Every **new** form uses this pattern. No exceptions for "simple" forms.
- Existing forms that use plain `useState` are legacy — see §9.
- The server validates independently; client validation exists to give the admin a precise message before a round-trip, never as the security boundary.

## 6. Errors and API responses

- Read failures through `lib/api-error.ts` — `getApiErrorMessage(error, fallback)`, `getApiErrorDetails(error)`, `hasStatus(error, 409)` ([RULE-ENG-009](RULES.md#rule-eng-009)). Never `catch (error: any)`; never read `error.response.data` by hand in a hook or component.
- The shared interceptor already rewrites `error.message` to the server's wording; prefer it over a generic fallback.
- Surface errors with `react-hot-toast` from the **hook** (`onError`), not from the component. Success toasts likewise.
- A `401` off a credential route means the session is gone — the interceptor handles it; do not add per-hook redirects. A `401` on a credential route means "wrong code" and belongs to the form.
- A `409` with structured `details` (leg-2 re-pricing) is a decision for the admin, not a failure — render it.
- Branch on `reason` (falling back to `code`) for auth failures; the v6 contract converges on `reason`.

## 7. Styling and design

- **Flat, minimalist, modern. No gradients** ([RULE-ENG-005](RULES.md#rule-eng-005)).
- **Colour comes only from the tokens in `app/globals.css`**: `bg-primary`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-brand-blue`, `text-brand-yellow`, `bg-accent`, `text-destructive`, `bg-sidebar-accent`, etc. Forbidden in new code: raw palette classes (`bg-blue-500`, `text-gray-600`) and arbitrary hex values (`text-[#123456]`).
- Existing raw-palette usage (≈170 occurrences, concentrated in `app/login/page.tsx`, `app/dashboard/security/page.tsx`, the shipment/estimate detail sheets) is legacy — see §9.
- High contrast is mandatory: dark text on light surfaces, light text on dark surfaces.
- Fonts: `font-primary` (Satoshi) is the body default; `font-secondary` (Work Sans) for the accents that already use it.
- Compose with shadcn primitives from `components/ui/` before writing bespoke markup; use `cn()` from `lib/utils.ts` for class merging.
- Destructive or permission-gated controls are wrapped in `<Can permission="…">` (`components/auth/can.tsx`). Prefer **disable** over hide for destructive actions so staff can see the capability exists and ask for access.

## 8. Documentation in code

Every exported function, component, hook, interface, and every non-obvious block carries JSDoc/TSDoc ([RULE-ENG-004](RULES.md#rule-eng-004)): what it does, why (when the why is not obvious), `@param` and `@returns` where applicable.

```typescript
/**
 * Calculates the estimated shipping cost based on volumetric weight.
 *
 * @param length - Package length in cm
 * @param width - Package width in cm
 * @param height - Package height in cm
 * @param weight - Actual weight in kg
 * @returns The calculated shipping cost in PLN
 */
export const calculateShippingCost = (length: number, width: number, height: number, weight: number): number => { … };
```

The existing code is a good model: `lib/api/index.ts`, `lib/auth/session.ts`, `hooks/use-permissions.ts`, and `components/permission-guard.tsx` explain *why* — the trap each comment prevents. Match that register. Do not write comments that restate the code.

## 9. Legacy patterns and migration policy

Owner ruling 2026-09-18 for every item below: **new code complies; existing code is migrated opportunistically when a task is already editing that file; no drive-by migrations.** Migrating a file counts as part of the task and appears in the plan's "Files to change" and in the final report.

| ID | Legacy pattern | Canonical | Where it lives today | Policy |
|---|---|---|---|---|
| C-01 | Forms with plain `useState`, no schema | Zod + `zodResolver` (§5) | every form except `app/login/page.tsx` | migrate when touched |
| C-02 | Raw Tailwind palette classes / hex | `globals.css` tokens (§7) | ≈170 occurrences, 20+ files | migrate when touched |
| C-03 | PascalCase component files | kebab-case (§4) | `components/admin-profile/*.tsx` (5 files) | rename when touched; update every import in the same change |
| C-04 | `###` changelog version headings | `##` (WORKFLOW §7.3) | entries ≤ 1.6.2 | **never** rewrite — history stands |

"When touched" means the task's approved scope already includes editing that file. It does not license editing a file only to migrate it.

## 10. Security and data handling

- Never commit secrets; never write real env values into any document ([RULE-SEC-001](RULES.md#rule-sec-001)). Access config via `process.env.NEXT_PUBLIC_*` only for values that are safe in the browser bundle — and remember they are inlined at build time.
- Protect routes: `proxy.ts` gates `/dashboard/*` on the cookie; `PermissionGuard` gates per-route permissions; `<Can>` gates controls. All three are UX. The server is the authority ([RULE-SEC-002](RULES.md#rule-sec-002)).
- Strip server-provided secrets (carrier `apiKey`/`apiSecret`, anything similar) in `lib/api` before returning ([RULE-SEC-003](RULES.md#rule-sec-003)).
- Super Admin identity is the `*` wildcard, never the role name ([RULE-ARCH-003](RULES.md#rule-arch-003)). `SUPER_ADMIN_ROLE_NAME` is only for guarding the role *record*.
- Backup codes and TOTP secrets are shown once and never stored client-side beyond the render that displays them.
- Periodically check dependencies for vulnerabilities; upgrades are owner-approved.

## 11. Locale, dates, money

- Business locale is **Poland**: `pl-PL` for date and number formatting, **PLN** as the default currency, **CET/CEST** timezone ([RULE-ENG-010](RULES.md#rule-eng-010)). The codebase itself is in English.
- Format through `utils/format-currency.ts`, `utils/format-date.ts`, `utils/format-phone.ts` — do not inline `toLocaleString` calls.
- Money is whatever the server sends; never recompute a price client-side. Always send `currency` with a price — omitting it once booked EUR rates as PLN (1.4.0).
- Dates from the API are ISO strings; parse with `date-fns`; guard against invalid dates (a crash in Activity Logs came from an unguarded format call, 1.3.0).

## 12. State management

- Server state: TanStack Query, one `QueryClient` in `components/providers.tsx` (`staleTime` 60s, `retry` 1). Query keys are arrays starting with the feature name (`["users", filters]`). Mutations invalidate by prefix.
- Local UI state: `useState` / `useMemo` in the component.
- Cross-tab / persisted client state: only what `lib/auth/session.ts` already manages (`localStorage` idle window, `sessionStorage` sign-out reason). Zustand is installed but unused; do not start using it without an owner decision.
- Hooks order: never call a hook after an early return — two pages crashed on exactly this (1.4.0).

## 13. Accessibility

No formal WCAG target is recorded. Minimum practice: shadcn primitives (which carry ARIA), visible focus, labelled inputs, contrast per §7, and keyboard-operable dialogs. Do not regress what the primitives provide.

## 14. Code review expectations

Every change is reviewed by the owner before commit. To make that review cheap: small diffs, no unrelated changes, comments that say why, a final report that lists every file and every verification actually performed.
