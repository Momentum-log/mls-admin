# PRD: MLS Admin Panel Basic Setup

## 1. Introduction / Overview

This document outlines the requirements for the initial setup of the MLS Admin Panel. The goal is to provide a secure, functional interface for MLS staff and super admins to manage users, shipments, and marketing leads. This phase focuses on establishing the project foundation, authentication, and core management features.

## 2. Goals

- **Secure Access**: Implement a robust authentication system using JWTs stored in `httpOnly` cookies.
- **User Control**: Enable admins to view, verify, and moderate user accounts.
- **Operational Efficiency**: Allow admins to fully manage shipment lifecycles, including proxy creation and manual overrides.
- **Lead Capture**: Provide visibility into shipping estimates (marketing leads) and enable data export.
- **Brand Consistency**: Ensure the admin UI reflects the MLS brand identity using `shadcn/ui`.

## 3. User Stories

- **As an Admin**, I want to log in securely so that I can access the management tools.
- **As an Admin**, I want to view a list of users and filter them by status so that I can find specific accounts.
- **As an Admin**, I want to manually verify a user's phone number if the automated system fails.
- **As an Admin**, I want to ban a user who violates platform policies.
- **As an Admin**, I want to create a shipment on behalf of a customer (Proxy) who is having technical trouble.
- **As an Admin**, I want to manually mark a shipment as "PAID" if the customer pays via bank transfer.
- **As an Admin**, I want to force-update a shipment's status if the carrier tracking is stuck.
- **As a Marketing Manager**, I want to view and export a list of shipping estimates to run retargeting campaigns.

## 4. Features / Tasks

### Infrastructure (IN)

- **IN01**: Initialize Next.js project with `shadcn/ui` and configure brand colors (Brand Blue: `#005db1`, Brand Yellow: `#fcb417`).
- **IN02**: Configure `axios` instance with base URL `https://api.momentumlogservices.com/api/admin` and interceptors for token handling.
- **IN03**: Setup environment variables (`NEXT_PUBLIC_API_URL`, `SUPER_ADMIN_EMAIL`).

### Authentication (AT)

- **AT01**: Implement `/login` page with email/password form.
- **AT02**: Implement `httpOnly` cookie storage logic for JWTs (encapsulated in Auth Hook/Context).
- **AT03**: Create Next.js Middleware to protect `/admin` routes and redirect unauthenticated users to `/login`.
- **AT04**: Implement "Logout" functionality that clears the cookie.

### Layout & Dashboard (LD)

- **LD01**: Create a persistent Sidebar Navigation with links to Dashboard, Users, Shipments, and Leads.
- **LD02**: Implement a Topbar displaying the current admin's profile/avatar.
- **LD03**: Create a basic Dashboard Landing page (can be empty or show placeholder stats for now).

### User Management (UM)

- **UM01**: Implement `UserList` view with reliable pagination and filtering (by name, email, status).
- **UM02**: Implement `UserDetails` view (or modal) to show full user profile.
- **UM03**: Implement "Manual Verify" action (Phone/Email).
- **UM04**: Implement "Ban User" action with "Full" or "Partial" ban type selection.

### Shipment Management (SM)

- **SM01**: Implement `ShipmentList` view with pagination and filtering.
- **SM02**: Implement "Proxy Shipment" form to create shipments for a specific `targetUserId`.
- **SM03**: Implement "Payment Bypass" modal to mark shipments as PAID (requires generic `manualTransactionId`).
- **SM04**: Implement "Status Override" modal to force status updates (toggle `trackingSyncEnabled`).

### Marketing Leads (ML)

- **ML01**: Implement `LeadList` view displaying Shipping Estimates.
- **ML02**: Add filtering for "Converted" vs "Abandoned" leads.
- **ML03**: Implement "Export to CSV" button for the leads list.

## 5. Non-Goals

- **Analytics Dashboard**: Complex charts and graphs are out of scope for this basic setup.
- **Staff Management**: Creating other admin accounts or role management is post-basic setup.
- **Settings/Configuration**: Global platform settings are out of scope.

## 6. Design Considerations

- **Library**: `shadcn/ui` (React/Tailwind).
- **Theme**: Light mode default, high contrast.
- **Responsiveness**: Desktop-first, but functional on tablets.

## 7. Technical Considerations

- **API Wrapper**: Use the defined 4-step API integration process (Types -> API Fn -> Hook -> Component).
- **State Management**: Use `TanStack Query` (React Query) for server state management.
- **Security**:
  - Ensure sensitive tokens are not accessible to client-side JS if possible (HttpOnly).
  - If using an encryption/hashing layer for the cookie as requested, document the mechanism clearly.

## 8. Success Metrics

- Admin can log in and navigate to all sections.
- Admin can successfully find a user and verify them.
- Admin can create a proxy shipment that appears in the list.
- Marketing team can export a CSV of leads.
- No unsecured admin routes are accessible.

## 9. Open Questions

- Specific fields required for the CSV export of leads? (Assumed: Email, Name, Origin, Destination, Date).
