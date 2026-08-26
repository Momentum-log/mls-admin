# Changelog

All notable changes to this project "Momentum Logistics Service" will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

### [1.6.2] - 2026-08-26 - API Client Relocated Out of Vercel's Function Namespace

Deployments had begun failing at the "Deploying outputs..." step with *"No more
than 12 Serverless Functions can be added to a Deployment on the Hobby plan."*
The build itself always succeeded — nothing was wrong with the code.

- **Fixed**: **The API client directory was being deployed as backend endpoints.** Vercel's zero-config detection treats any root-level `/api` directory as a source of Serverless Functions, independently of the Next.js framework preset, and turns every non-underscore-prefixed file inside it into one. That counted 16 functions — the 15 client modules plus `api/carriers/constants.ts`, a plain constants file — against a ceiling of 12, before Next.js's own output was considered. None of them are backend code: `api/index.ts` is a browser-side Axios instance that reads a cookie via `js-cookie` and redirects with `window.location`, and the project has no route handlers at all. The directory moved to `lib/api/`, alongside the cross-cutting code it belongs with (`lib/api-error.ts`, `lib/rbac.ts`, `lib/shipment-status.ts`).
- **Changed**: All 17 consumer imports repointed from `@/api/…` to `@/lib/api/…` across 14 hooks, 2 pages and `carrier-detail-sheet.tsx`. Relative imports inside the tree were untouched — they moved together and stayed correct. No configuration changed: the `@/*` → `./*` alias already resolves the new path, and `vercel.json` carries no `builds` or `functions` block.
- **Note**: Nothing was consolidated into a single shared function, which was the other obvious route out of the limit. There were no functions to consolidate, and a barrel export over every domain's client would have defeated tree-shaking to solve a problem that did not exist. Purely a relocation — no runtime behaviour changed.
- **Note**: Earlier entries in this file refer to these modules by their original `api/…` paths. Those readings were accurate when written and are left as they stand.

### [1.6.1] - 2026-08-26 - Next.js 16 Proxy Migration

- **Changed**: Migrated deprecated `middleware.ts` file convention to `proxy.ts` with exported `proxy()` function as required by Next.js 16.

### [1.6.0] - 2026-08-11 - Permission Enforcement & Reversible Moderation

- **Added**: `<Can>` — one wrapper for gating any control on permissions, with hide and disable modes. Disable is the default choice for destructive actions: staff see the capability exists and can ask for access, rather than concluding the feature is missing.
- **Changed**: `usePermissions` now mirrors the server's `RbacService` exactly — granting on the `*` wildcard, an exact match, or a `<resource>:*` wildcard. Previously only exact matches were understood, so a role holding `shipment:*` would have been shown nothing.
- **Fixed**: **Super Admin was identified by role name.** Renaming the role would have revoked super-admin access and simultaneously unlocked the staff rows that the same comparison protected. Identity now comes from the `*` wildcard, with the name kept only as a fallback for a session whose permissions failed to load.
- **Fixed**: **Permissions are parsed defensively.** `Role.permissions` is a `Json` column, so nothing guarantees its shape. A role stored as a stringified array would have made `.includes()` do substring matching and silently grant permissions never assigned.
- **Fixed**: **Two routes were guarded too permissively.** The server chains two `requirePermission` calls on shipments (`user:read` + `shipment:read`) and leads (`user:read` + `leads:read`); the guard checked only one, letting an admin open a page whose every request then 403s. Guard entries now accept multiple permissions.
- **Fixed**: Route matching picks the longest match rather than the first, so the new `/dashboard` root guard cannot shadow more specific entries depending on key order.
- **Fixed**: `/dashboard/settings` is gated on `staff:write` — the server gates even the GET on a write permission — and the dead `email:read` entry pointing at it was removed.
- **Added**: **Un-ban.** Banning was irreversible from the UI: `BanUserPayload` was typed to the literal `"BANNED"`, so no shape could express restoring an account. The payload now covers the server's full range, and a banned user gets a Restore Access action that clears the ban type alongside the status.
- **Added**: The `inquiries:read` / `inquiries:write` group, absent from the permission catalog.

### [1.5.0] - 2026-08-10 - Hub Routing & Multi-Leg Operations

Hub routing can now be enabled safely. Before this, turning it on would have
stranded every hub-routed parcel at the sorting centre, because nothing in the
dashboard could confirm arrival.

- **Added**: **Hub & Routing page** (`/dashboard/hub`). Master routing switch, compete-best-price switch, and full sorting-centre CRUD. The current mode is rendered from the server's own `routingMode` sentence rather than re-derived, so the two cannot drift.
- **Added**: **Honest no-op reporting on both toggles.** Enabling hub routing with no centre configured, or flipping compete while routing is off, are accepted by the API but change nothing. Both responses carry `effective` and a `warning`; the UI raises the warning and snaps the switch back instead of showing a success it did not earn.
- **Added**: **Environment-fallback banner.** When the active hub resolves from deploy-time configuration rather than the database, the page says so — activating any centre replaces it.
- **Added**: **Multi-Leg Ops queue** (`/dashboard/multi-leg`). Lists hub-routed shipments waiting on a person, oldest first. Confirm hub arrival and create leg 2, both driven by the server's `canConfirmArrival`/`canCreateLegTwo` flags so the state rules live in one place.
- **Added**: **Leg-2 re-pricing decision.** When leg 2's live rate exceeds the quoted price by more than 10% the server refuses with a 409 carrying both figures. That is a decision, not a failure: the dialog shows what the customer paid, what it costs now, and the shortfall MLS absorbs, and proceeding is explicit.
- **Added**: **Centre-printed label warning.** Leg 2's label is flagged as never to be sent to the customer — they already hold leg 1's, and a parcel with two barcodes fails physically.
- **Added**: Central shipment status model (`lib/shipment-status.ts`). The enum grew from 7 to 15 values; the override modal offered only 7, so no fulfillment or multi-leg state could be set by hand. Multi-leg states are hidden for single-leg shipments to avoid stranding them in a state the ops queue filters out.
- **Added**: Status filter on the shipments list — the API has always supported it and the type declared it, but no control ever set it.
- **Added**: `api/_shared/envelope.ts` — normalises the API's four response envelopes and two pagination styles behind one shape.
- **Fixed**: Carrier credentials no longer reach the client. The multi-leg detail endpoint spreads the full carrier row including `apiKey`/`apiSecret`; the API layer strips them before they can land in component state.
- **Fixed**: Three divergent copies of `getPaymentVariant`, none of which knew about `REFUNDED`, consolidated into one.
- **Changed**: Sidebar grouped into Operations / Growth / Configuration / System. Ten flat entries had stopped being scannable, and more are coming. Locked entries stay visible with a tooltip naming the permission they need, so staff can ask for access rather than assume a feature is missing.
- **Fixed**: The Security entry guarded on `system:security`, a permission absent from the server's catalog. It could never be granted, so it always evaluated false — correct behaviour by accident. Now an explicit Super Admin flag.

### [1.4.0] - 2026-08-09 - API Path Realignment & Broken Flow Repairs

**Breaking (deployment):** `NEXT_PUBLIC_API_URL` must now be `https://<host>/api`,
not `.../api/admin`. Every admin path carries its own `/admin` prefix.

- **Fixed**: **API paths were half-prefixed.** Some calls included `/admin` and most did not, so one set was always wrong. All 40+ paths now resolve consistently against a single base. Bulk delete, force delete and cascade delete were among those returning 404.
- **Fixed**: **Two pages crashed on load.** `users/[id]/shipments` and `users/[id]/estimates` called `useMemo` after early returns, throwing "Rendered more hooks than during the previous render" the moment the user query resolved. Both hooks hoisted above the guards.
- **Fixed**: **"Create & Bypass Payment" never bypassed anything.** The handler ignored its own `bypass` argument, so the shipment was created and left unpaid behind a success toast. It now chains the bypass call and collects the required payment reference instead of confirming blindly.
- **Fixed**: **Create Shipment wizard could not fetch rates.** It posted to `/shipping/estimates`, which does not exist. Repointed at `/shipments/get-shipping-quote`, and the request now sends the canonical address shape (`streetLines[]`, `stateOrProvinceCode`) and a `packages` array rather than a flat address and a singular `package`.
- **Fixed**: **EUR rates booked as PLN.** The proxy payload omitted `currency`, which the server defaults to PLN while calculating commission — roughly a 4x undercharge on EUR routes. It now sends `currency`, `actualPrice`, `carrierSlug` (not a display name) and `estimateId`.
- **Fixed**: **Rate list rendered blank prices.** `ShippingRate` declared `price`/`estimatedDays`; the API returns `carrierPrice`/`actualPrice`/`deliveryDescription`. Types corrected and carrier errors are now surfaced.
- **Fixed**: **Session cookie outlived its token 168x.** Admin tokens expire after one hour; the cookie was set for seven days, so the middleware admitted admins to a dead session that 401'd on every request. Cookie lifetime now matches the token, with `sameSite=strict` and `secure` over HTTPS.
- **Fixed**: **ESLint could not run at all.** `zod` was pinned at `3.24.1`, below the `^3.25.0 || ^4.0.0` range `eslint-plugin-react-hooks@7` requires via `zod-validation-error`. Bumped to `^3.25.76`, which ships the `zod/v4` subpaths while keeping the v3 classic API `@hookform/resolvers@3` depends on. This is why the hooks-order crashes shipped unnoticed.
- **Fixed**: Pagination on the user sub-pages advanced past the last page — it inferred "has more" from row count instead of `pagination.totalPages`.
- **Added**: `lib/api-error.ts` and `types/api.ts` — one place to read the API's `{ error, code, details }` envelope, including structured `details` objects. Replaces 28 hand-rolled `catch (error: any)` chains.
- **Added**: `residential` toggle on wizard addresses. Carriers price residential delivery differently and the field is required by the schema.
- **Removed**: The admin logout API call. No `/admin/auth/logout` route exists — the 404 was invisible because the mutation used `onSettled`. Session teardown is client-side, which is all a stateless token allows.
- **Changed**: Reconciled version drift — `package.json`, the changelog and the profile drawer footer had disagreed since 0.5.1.

### [1.3.0] - 2026-03-09 - Add Commission Thresholds and Admin Profile

- Added: Global commission safety net thresholds (PLN and EUR with manual override options).
- Added: Carrier-level fallback commission thresholds.
- Added: Route-specific commission threshold safety nets (Local, Export, Import, International).
- Added: User profile side drawer for quick profile access.
- Added: Ability for admins to update their passwords from the profile drawer.
- Added: Activity logger display inside the profile drawer with collapsible JSON details viewer.
- Changed: Updated global Axios response interceptor to map backend JSON error messages (`.details`, `.error`) directly to UI toast notifications.
- Fixed: Resolved invalid date formatting crash in Activity Logs and improved time display to be fully explicit.

### [1.2.2] - 2026-02-24 - Super Admin Password Rotation & Security Overhaul

- **Added**: **Manual Password Rotation**: Super Admins can now manually trigger a full 16-character password rotate using their **Weekly Reset Key**.
- **Added**: **Emergency Recovery (Login Page)**: Integrated a public-facing rotation trigger on the login page for cases where rotation emails are missing or access is lost.
- **Added**: **Security Dashboard**: New dedicated `/dashboard/security` page for system-level security controls.
- **Added**: **High-Friction Confirmation**: Automated rotation triggers are guarded by `ConfirmDialog` to prevent accidental credential invalidation.
- **Added**: **RBAC Visibility**: The Security module is dynamically hidden from non-Super Admin staff in the sidebar and protected via layout guards.
- **Improved**: Login page accessibility with specialized recovery paths for administrative personnel.

### [1.2.1] - 2026-02-24 - Code Quality & Component Consolidation

- **Changed**: **Unified Confirmation System**: Merged `DeleteResourceDialog` into an enhanced `ConfirmDialog`. The new unified component now supports loading states, optional "Force Delete" toggles, and resource-specific warnings.
- **Changed**: **Refactored Deletion Flow**: Standardized deletion confirmations across Carriers, Roles, Users, and Shipments to use the enhanced `ConfirmDialog`.
- **Changed**: **Simplified User Data Fetching**: Removed redundant `getUserByCode` API and `useUserByCode` hook. The User Detail page now leverages the generic `useUsers` list hook with specific search filters for better code reuse and consistency.
- **Removed**: `components/admin/delete-resource-dialog.tsx` (consolidated into `ConfirmDialog`).
- **Improved**: Logic in `ConfirmDialog` to prevent accidental double-submits by disabling form controls and adding a loader during asynchronous operations.

### [1.2.0] - 2026-02-24 - Dynamic Carrier Management & Health Monitoring

- **Added**: **Programmable Carrier Slugs**: Migrated from static `.env` (`ACTIVE_CARRIERS`) to database-driven adapter routing.
- **Added**: **Custom Slug Creation**: Administrators can now create new lowercased slugs directly from the UI for future integrations.
- **Added**: **Carrier Name Validation**: Custom slugs must now include the carrier's name to ensure descriptive and unique identifiers.
- **Added**: **Slug Selector**: Integrated a unified dropdown in carrier configuration for FedEx, DHL, and InPost adapters, with a fallback for custom entries.
- **Added**: **System Health Monitoring**: New real-time warning banners on the Carriers page for inactive or misconfigured shipping providers.
- **Added**: **Validation Logic**: Enforced slug selection for all carrier creations and updates to ensure integration reliability.
- **Changed**: Enhanced the Carriers table with a "Programmatic Slug" column for immediate visibility.
- **Changed**: Improved **Custom Slug Normalization**: Slugs are automatically lowercased and kebab-cased in real-time.
- **Changed**: Updated **Comprehensive Admin Guide** with instructions for dynamic carrier configuration and slug mapping.
- **Fixed**: **Custom Slug Input Bug**: Refactored state management with an explicit `isCustom` flag to prevent the input field from vanishing when cleared.

### [1.1.0] - 2026-02-24 - Admin Profile & Dynamic Documentation System

- **Added**: Integrated **Admin Profile & Help Drawer** for quick access to personal details and system guides.
- **Added**: **Dynamic Documentation Viewer** (`DocsViewer`) providing contextual, permission-aware tutorials.
- **Added**: **RBAC-Driven Visibility**: Documentation sections (Shipments, Users, Staff, etc.) automatically hide if the user lacks the required system permissions.
- **Added**: **Comprehensive Admin Guide**: In-depth tutorials for Dashboard modules, plus step-by-step instructions for Role creation and Staff management.
- **Added**: New UI component: `Accordion` (based on Radix UI) for a structured documentation experience.
- **Changed**: Updated `AdminTopbar` with a "Help & System Guide" trigger in the profile dropdown.

### [1.0.0] - 2026-02-23 - Staff Role Management & Permissions UI (RBAC)

- **Added**: Comprehensive Role-Based Access Control (RBAC) Management UI.
- **Added**: `PermissionSelector` component for grouped, user-friendly permission selection with descriptions.
- **Added**: `StaffTable` enhancement: **Inline Custom Role Creation**. Admins can now define permissions for a new role while adding a staff member.
- **Added**: `RolesTable` full CRUD: Create, Edit, and Delete system roles with real-time permission mapping.
- **Added**: **Frontend Enforcement**:
  - `AdminSidebar` now grays out and locks unauthorized modules based on user permissions.
  - `PermissionGuard` layout wrapper protects against direct URL access to restricted pages.
  - Dedicated **Access Denied** redirection page (`/dashboard/denied`).
- **Added**: Optional **Email Notifications** toggle when assigning or changing staff roles.
- **Added**: New hooks: `usePermissions` (global access check), `useAvailablePermissions`, `useUpdateRole`, and `useDeleteRole`.
- **Changed**: Simplified Staff & Role navigation under a unified responsive management interface.
- **Fixed**: Role deletion protection to prevent breaking active staff accounts.
- **Fixed**: Synced `types/staff.ts` and `api/staff/index.ts` with updated RBAC backend endpoints.

### [0.9.0] - 2026-02-18 - Carrier & Commission Management

- Added: Full Carrier Management system (CRUD) at `/dashboard/carriers`.
- Added: Commission Management with 4-stage rules (Local, Export, Import, International) and CL02 logic.
- Added: Enhanced deletion endpoints (Cascade/Force Delete) for Users and Shipments.
- Added: Delete Shipment functionality in Shipment Detail Sheet.
- Changed: Dashboard stats now reflect backend fields (`leads`, `activeShipments`).
- Fixed: Sidebar navigation highlight for nested routes.

### [0.8.0] - 2026-02-17 - Dashboard Stats & LeadsOperations Optimization

- Added: Premium Revenue card styling with multi-currency line-item display and high-contrast visuals.
- Added: Uniform heights for all dashboard stat cards (`h-[140px]`) with glassmorphism hover effects.
- Added: **Rows Per Page Selector** (10, 20, 30, 50) for all management tables (Users, Shipments, Leads).
- Added: **Localized Currency Symbols** (zł, €, $) for all prices across the dashboard using a new `formatCurrency` utility.
- Added: **Enhanced Conversion Tracking**:
  - Real-time shipment correlation: The leads list now cross-references active shipments to accurately show "Shipment Created."
  - Visual overhaul: Non-converted leads now use a vibrant **Purple/Accent** theme with a **Zap (⚡)** icon to highlight them as open opportunities.
- Added: Delete functionality for Marketing Leads, Shipments, and Users with mandatory `ConfirmDialog` guards.
- Added: Standardized user identification: `Name (User Code)` for authenticated users and explicit `GUEST` badge for guest records.
- Added: Copy icons and buttons for User Codes, Guest Emails, and Tracking Numbers across all tables and detail sheets.
- Added: Dedicated "Guest Contact" section in estimate details with one-click copy for email and phone.
- Changed: Widened Name/Customer columns across all tables to `240px`-`360px` for better readability.
- Changed: Global 12-hour time formatting (`h:mm a`) support in `utils/format-date.ts`.
- Removed: Legacy "Export to CSV" buttons from all pages (pending new background export endpoint).
- Fixed: Standardized table cell formatting with extra-bold names and consistent price colors.

### [0.7.1] - 2026-02-16 - Branding, Font System & Login Content Refinement

- Changed: Switched application logo from `favicon.svg` to the official `logo-landscape.svg` on the login page.
- Changed: Overhauled font system to use local **Satoshi** (primary) and **Work Sans** (secondary) fonts.
- Changed: Removed `next/font/google` and `next/font/local` dependencies to fix Turbopack build errors; switched to standard CSS `@font-face` declarations.
- Changed: Redesigned login page branding section with left-aligned content and updated typography.
- Changed: Updated login page description to include mandatory instruction regarding credential emails and restricted access.
- Changed: Toned down background animations to a minimal geometric grid with subtle light pulses.
- Removed: Default Next.js boilerplate assets (`next.svg`, `vercel.svg`, etc.) from the `public` directory.

### [0.7.0] - 2026-02-16 - Admin Login Redesign & Hot Toast Integration

- Added: Premium split-screen login page with dynamic background (Logistic/Security icons + grid)
- Added: Integrated `react-hot-toast` as the global notification system with brand-aligned styling
- Changed: Updated `useLogin` to provide immediate feedback via toasts
- Changed: Globalized `Toaster` in `Providers.tsx` for application-wide notifications
- Added: Success/Error toast feedback for Shipment updates, User bans/verifications, and Payments
- Removed: Legacy custom toast system (`components/ui/toast.tsx`)

### [0.6.0] - 2026-02-14 - Admin Dashboard Redesign & Colorful Stats

- Added: Colorful, high-contrast statistics grid with brand-aligned backgrounds (Blue, Yellow, Accent Dark/Light)
- Added: "Recent Activity" sections for Shipments, Marketing Leads, and User Signups with "View All" shortcuts
- Added: Subtle entrance animations and hover transitions using `framer-motion`
- Added: `totalLeads` and `recentSignupsCount` to `DashboardStats` type
- Changed: Dashboard now fetches real-time recent data using specific resource hooks
- Added: `date-fns` dependency for enhanced date formatting

### [0.5.1] - 2026-02-14 - Unified Shipment Status Override

- Changed: Rewrote `OverrideStatusModal` with full status list (CREATED → FAILED), descriptions, destructive action warnings, and notification toggle
- Added: `notify` field to `OverrideStatusPayload` type to match updated backend API
- Added: "Admin Actions" section in `ShipmentDetailSheet` with "Update Status" and "Mark as Paid" buttons
- Changed: Modals (status override, payment bypass) are now managed internally by the detail sheet instead of the parent page
- Changed: Cleaned up shipments page by removing legacy modal state and standalone modal rendering

### [0.5.0] - 2026-02-14 - Shipments & Estimates Dashboard Tabs Revamp

- Changed: Rewrote main Shipments page with modern UI, clickable rows, and `ShipmentDetailSheet` integration
- Changed: Rewrote main Marketing Leads page as "Shipping Estimates" with modern UI, clickable rows, and `EstimateDetailSheet` integration
- Added: Global search filters for user code, email, name, and guest ID across both tabs
- Added: Correlation logic to the global tabs (fetching matching data on-demand when a row is selected)
- Added: CSV export for shipping estimates with expanded fields (converted status, price, user details)
- Fixed: Standardized global API endpoints (`/leads` for estimates, response payload uses `data[]` wrapper)
- Fixed: Added missing `trackingSyncEnabled` and `carrier` fields to admin resource types

### [0.4.2] - 2026-02-14 - Estimate ↔ Shipment Correlation

- Added: `utils/estimate-shipment-correlation.ts` — matches estimates to shipments by address, serviceType, and chronological order
- Added: "Source Estimate" section in `ShipmentDetailSheet` — green card showing the estimate that originated the shipment
- Added: "Created Shipment" section in `EstimateDetailSheet` — green card with tracking #, carrier, price, payment status
- Added: Yellow warning in estimate sheet when `converted: true` but no matching shipment found in loaded data
- Added: "Selected" badge highlighting the rate the user actually chose when viewing a converted estimate
- Changed: Sub-pages now fetch the complementary data set (estimates on shipments page, shipments on estimates page) for correlation
- Changed: User details page computes correlation using `useMemo` and passes to detail sheets

### [0.4.1] - 2026-02-14 - Shipment & Estimate Detail Sheets + API Fix

- Fixed: API response types now match actual backend shape (`data[]` wrapper instead of `shipments[]`/`leads[]`)
- Added: `AdminShipment`, `AdminLead` and related types in `types/admin-user-resources.ts`
- Added: `ShipmentDetailSheet` — slide-out panel with full shipment details (addresses, package, pricing, label link)
- Added: `EstimateDetailSheet` — slide-out panel with full estimate details (locations, rates, conversion status, contact)
- Changed: Shipment and estimate table rows are now clickable on user details page and sub-pages
- Fixed: Correct field names used throughout (`shipmentStatus`, `carrier.name`, `pickupLocation`, `weight.value`, etc.)

### [0.4.0] - 2026-02-14 - User Details — Shipments & Estimates Enhancement

- Added: "Recent Shipments" card on user details page (top 5, with tracking #, status, carrier, date)
- Added: "Recent Estimates" card on user details page (top 5, with route, weight, conversion status, date)
- Added: `ConversionBadge` component — green "Shipment Created" or neutral "Shipping Estimate"
- Added: `UserInfoHeader` compact component for user sub-pages
- Added: "See All" Shipments sub-page at `/dashboard/users/[id]/shipments` (paginated table)
- Added: "See All" Estimates sub-page at `/dashboard/users/[id]/estimates` (paginated table with conversion badges)
- Added: `getUserShipments` API function and `useUserShipments` hook (`GET /shipments?userId=...`)
- Added: `getUserLeads` API function and `useUserLeads` hook (`GET /leads?userId=...`)
- Added: `UserShipmentFilter` and `UserLeadFilter` types for user-scoped queries
- Changed: `Lead` type now includes `converted` boolean field

### [0.3.0] - 2026-02-13 - UI Overhaul — Light Theme, Create Shipment, & Cleanup

- Changed: Entire app switched to light theme with brand colors (`--primary` → `#005db1`, `--secondary` → `#fef9ec`, `--accent` → `#f3f0ff`)
- Changed: Sidebar redesigned from dark (`#111827`) to white with brand-blue active states
- Changed: Removed `.dark` CSS block (app is light-only)
- Changed: Layout sidebar wrapper no longer uses `bg-gray-900`
- Changed: User detail page merged "Verification & Status" and "Profile Information" into a single 2-column "User Profile" card
- Changed: All native `confirm()` calls replaced with shadcn `ConfirmDialog` component
- Changed: "Create Proxy" renamed to "Create Shipment" everywhere
- Changed: `userCode` used instead of `id` for copy actions and navigation across all pages
- Changed: Create Shipment button on user detail page now passes `userCode` in URL
- Added: Reusable `ConfirmDialog` component (`components/ui/confirm-dialog.tsx`) built on shadcn AlertDialog
- Added: Multi-step Create Shipment flow: Select User → Addresses → Package → Get Rates → Confirm & Create
- Added: Searchable user list with auto-select from `?userCode=` query parameter
- Added: Shipping estimate types (`types/shipping-estimate.ts`), API (`api/shipping/index.ts`), and hook (`hooks/shipping/use-shipping.ts`)
- Added: Rate cards display with per-currency formatting
- Added: "Create & Bypass Payment" option on the confirm step

### [0.2.1] - 2026-02-13 - Stats, Dates & User Details Fixes

- Changed: Dashboard stats now correctly handle multi-currency `revenue` object (e.g., `{ EUR: 375.04, PLN: 2344.09 }`)
- Changed: Revenue card displays each currency on its own line instead of concatenating
- Changed: Dashboard shows `pendingPayments` and `inTransit` instead of the incorrect `totalRevenue` / `activeShipments`
- Changed: Dashboard grid updated to 5 columns for all stat cards
- Changed: Date formatting across the app now uses "12 Feb 2026" format (short month name) via `utils/format-date.ts`
- Changed: User detail page URL now uses `userCode` (e.g., `/dashboard/users/MLS-U-15O8B2W6`) instead of UUID
- Changed: `getUserById` replaced with `getUserByCode` (searches users list by userCode as workaround until dedicated endpoint exists)
- Changed: Removed "Status" and "Verified" columns from users table for cleaner layout
- Changed: Verification status now shown as `BadgeCheck` (green) / `BadgeX` (red) icons inline next to email
- Changed: Email verification on user detail page also uses `BadgeCheck` / `BadgeX` icons
- Added: `lastActiveAt` and `lastLoginAt` fields to User type
- Added: "Last Active" and "Last Login" columns on the users list page
- Added: "Last Login" field on the user detail page
- Added: `utils/format-date.ts` with `formatDate`, `formatDateTime`, and `formatRelativeTime` utilities
- Added: `utils/format-date.ts` with `formatDate`, `formatDateTime`, and `formatRelativeTime` utilities

- Added: Brand logo in sidebar (replaces placeholder circle)
- Added: Topbar profile dropdown showing admin initials, name, email, role badge
- Added: Red logout button in the profile dropdown
- Added: Dashboard stats API integration (`/dashboard/stats`) with PLN formatting
- Added: User details page at `/dashboard/users/[id]` with profile info and moderation actions
- Added: "View Details" option in users action dropdown
- Added: Clickable user names in the users table (navigates to detail page)
- Added: CopyButton on user emails, user codes, user IDs (users page and detail page)
- Added: CopyButton on tracking numbers and user emails (shipments page)
- Added: `WARNED` status filter option in users page
- Added: Page indicator in pagination controls
- Changed: `getMe` now correctly parses the direct API response (was trying to access `response.data.user`)
- Changed: `AuthResponse` type updated to match actual API (`admin` field instead of `user`)
- Changed: Dates formatted using `pl-PL` locale
- Fixed: CopyButton `cn` import path corrected to `@/lib/utils`

### [0.1.0] - 2026-02-13 - Initial Admin Panel Setup

- Added: Authentication module (login, logout, session management)
- Added: Admin layout with sidebar and topbar
- Added: Dashboard overview page
- Added: User management (list, search, filter, ban, verify)
- Added: Shipment management (list, proxy creation, payment bypass, status override)
- Added: Marketing leads management with CSV export
- Added: Middleware-based route protection
- Added: Axios interceptor for Bearer token and 401 handling
