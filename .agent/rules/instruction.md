---
trigger: always_on
---

# Project Instructions for Momentum Logistics Service (MLS)

## 1. Project Overview & Context

Momentum Logistics Service is a comprehensive logistics management system designed to streamline operations for logistics companies in **Poland**. The system provides features such as shipment tracking, inventory management, route optimization, and real-time analytics.

### Regional Configuration (Poland)

- **Primary Region**: Poland
- **Timezone**: Central European Time (CET) / Central European Summer Time (CEST)
- **Currency**: Polish Złoty (PLN)
- **Locale**: `pl-PL` (use for date/number formatting), `en-US` (codebase language)

## 2. Technology Stack

- **Runtime & Package Manager**: **Bun**
  - **Strict Rule**: Always use `bun` for package management and scripts (e.g., `bun install`, `bun run dev`).
- **Backend**: Node.js, Express.js
- **Frontend**: React.js, Next.js (App Router)
- **Database**: PostgreSQL

### Project Structure Overview

- `app/`: Next.js App Router pages and layouts.
- `components/`: Reusable UI components.
  - `components/ui/`: Primitive UI components (buttons, inputs).
- `api/`: Backend API routes and logic.
- `types/`: TypeScript definitions.
- `utils/`: Helper functions.
- `hooks/`: Custom React hooks.
- `public/`: Static assets.

## 3. Coding Standards & Philosophy

### 3.1 Modular & Reusable Code (Strict)

- **Modularity**: Code **MUST** be modular. Extract distinct logic, constants, and types into separate files.
  - _Anti-Pattern_: 500+ line components with mixed logic.
  - _Pattern_: `useShippingCalculator.ts` (hook), `shipping.types.ts` (types), `ShippingForm.tsx` (UI).
- **Reusability**: **ALWAYS** check `components/` and `utils/` before creating new code. Do not duplicate logic.
- **Imports**: Use the `@/` alias for all local imports (e.g., `import { Button } from '@/components/ui/button'`).

### 3.2 Documentation (Strict)

- **Heady Documentation**: All exported functions, components, interfaces, and complex logic blocks **MUST** be documented using JSDoc/TSDoc.
- **Requirement**: Comments should explain _what_ the code does, _why_ it does it (if complex), and define parameters/return values.
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
  export const calculateShippingCost = (length: number, width: number, height: number, weight: number): number => { ... }
  ```

### 3.3 Design & Styling (Strict)

- **Style**: Flat, minimalist, modern. **NO GRADIENTS**.
- **Colors**: Use **ONLY** CSS variables from `global.css`.
  - usage: `bg-brand-blue`, `text-text-color`.
  - **Forbidden**: `bg-blue-500`, `text-[#123456]`.
- **Contrast**: Ensure high contrast for readability (Light text on Dark bg, Dark text on Light bg).

## 4. Development Workflows

### 4.1 Commands

- **Start Dev Server**: `bun run dev`
- **Build**: `bun run build`
- **Type Check**: `bunx tsc --noEmit`
- **Lint**: `bun run lint` (or equivalent configured script)

### 4.2 Version Control & Changelog (Critical)

- **Semantic Versioning (SemVer)**:
  - **Major (X.0.0)**: Breaking API changes or major architectural shifts.
  - **Minor (0.X.0)**: New features that are backward compatible.
  - **Patch (0.0.X)**: Bug fixes and minor adjustments.
- **Changelog Updates**: You **MUST** update `changelog.md` after every significant task or feature implementation.
- **Format**:

  ```markdown
  ### [version code: 1.0.0] - YYYY-MM-DD - Short description

  - Added: Feature X
  - Changed: Refactored Y
  - Fixed: Bug Z
  ```

## 5. Security Standards (High Priority)

- **Input Validation**: ALL API endpoints and Form inputs **MUST** be validated using schemas (e.g., Zod) on both client and server.
- **Secrets Management**: NEVER commit secrets/keys. Use `.env.local` and access via `process.env`.
- **Authentication**: Protect all private routes. Ensure proper authorization checks (e.g., User can only view their own shipments).
- **Dependencies**: Periodically check for vulnerabilities.

## 6. Pre-Commit Checklist

1. **Run Type Check**: `bunx tsc --noEmit` (Must pass)
2. **Run Linting**: Ensure no lint errors.
3. **Verify Server**: Ensure `bun run dev` starts without errors.
4. **Update Changelog**: Document your changes.
