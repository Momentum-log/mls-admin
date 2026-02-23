# Changelog

All notable changes to this project "Momentum Logistics Service" will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
