# PRD: Admin Login Redesign & Global Toast Notification System

## 1. Introduction / Overview

The current admin login page is functional but lacks the "wow" factor and premium feel expected for the Momentum Logistics Service (MLS) management suite. Additionally, the existing toast system needs refinement to be more interactive (pulsing, dismissible) and more deeply integrated into the application's feedback loops, particularly for authentication errors.

This project aims to:

1. Redesign the Login Page with a high-end, dynamic UI using reactive components and component-based backgrounds.
2. Enhance the Global Toast System to support pulsing animations, clear manual dismissal, and strict adherence to the brand's theme.
3. Standardize error handling using toasts across the admin application.

## 2. Goals

- **Stunning Login UI**: Create a memorable first impression with modern typography, glassmorphism, and dynamic (but non-image) backgrounds.
- **Interactive Notifications**: Implement toasts that feel "alive" (pulsing) and provide clear user control.
- **Global Integration**: Ensure the toast system is easily accessible from any hook or component in the app.
- **Improved UX**: Use toasts for immediate, clear feedback on login attempts and other critical actions.

## 3. User Stories

- As an admin, I want a login page that feels professional and visually impressive.
- As an admin, I want to receive immediate, clear feedback when my login fails so I know what went wrong.
- As a developer, I want a simple, consistent way to trigger notifications from anywhere in the codebase.
- As an admin, I want notifications to be noticeable (pulsing) but easy to dismiss if they are in the way.

## 4. Features / Tasks

### Toast System Enhancement (TS)

- TS01: Update `ToastItem` in `components/ui/toast.tsx` to include a pulse animation for error types.
- TS02: Add a clear "Dismiss" or "Close" button to the toast component with improved accessibility.
- TS03: Ensure the toast colors and shadows are derived strictly from CSS variables in `globals.css`.
- TS04: Support background messages that can be queued and displayed across page transitions.

### Login Page Redesign (LR)

- LR01: Implement a "Glassmorphism" login card with subtle borders and backdrop blur.
- LR02: Create a component-based "dynamic background" (e.g., floating geometric shapes or grid patterns) instead of using images.
- LR03: Integrate the enhanced toast system into the login flow, replacing inline error messages.
- LR04: Add entrance animations for the login card and its contents.
- LR05: Improve typography and spacing to match the "flat, minimalist, modern" Polish aesthetic.

### Application Integration (AI)

- AI01: Refactor `use-auth.ts` to trigger error toasts on failed login/logout attempts.
- AI02: Globalize the `ToastContainer` in the root layout to ensure it's always available.
- AI03: Update existing CRUD operations (Shipments, Users) to use the new toast feedback.

## 5. Non-Goals (Out of Scope)

- Changing the underlying authentication logic (JWT/Cookies).
- Adding complex multi-factor authentication (MFA) at this stage.
- Redesigning the internal dashboard pages beyond toast integration.

## 6. Design Considerations

- **Colors**: Strictly use `--brand-blue` (#005db1), `--brand-yellow` (#fcb417), and `--accent-dark`.
- **Background**: Use a CSS-only or React-component-based background. A grid pattern with moving lights or subtle gradient shifts (non-static) is preferred.
- **Aesthetics**: Premium, state-of-the-art, high contrast. No plain red/blue; use the curated palette.

## 7. Technical Considerations

- **Animations**: Use `framer-motion` for transitions and pulsing effects.
- **State Management**: Continue using the existing `zustand` store (`use-toast.ts`).
- **Framework**: Next.js App Router (React).

## 8. Success Metrics

- 100% of login errors are handled via toasts.
- Zero usage of native `alert()` or `console.error` for user-facing feedback.
- Positive feedback on the new login visual design.

## 9. Open Questions

1. Should we move the toast logic to a dedicated external library like `react-toastify` or keep the custom `zustand` implementation? (Note: User mentioned React Toastify, but we already have a custom one that might be better to polish).
2. Do we need support for multiple toast positions (e.g., bottom-left), or is top-right sufficient?
3. Should the "pulse" effect be continuous or only on initial appearance?
