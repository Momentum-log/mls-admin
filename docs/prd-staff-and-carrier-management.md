# PRD: Staff Management & Carrier Fixes

## 1. Introduction / Overview

This document outlines the requirements and implementation steps for fixing the broken Carrier Management endpoints (currently returning 404 Not Found) and building a new, robust Staff Management system for the Momentum Logistics Service (MLS) Admin Panel.

The goal is to ensure all Admin-related endpoints are correctly mounted on `/api/admin` and that every API endpoint follows a **highly explicit, self-explanatory naming convention** (e.g., `/api/admin/get-all-carriers` instead of relying solely on HTTP methods like `GET /api/admin/carriers`). Additionally, a comprehensive action audit trail will be implemented.

## 2. Goals

- Fix and re-implement Carrier Management so it successfully mounts on the server without 404 errors.
- Create explicit, self-explanatory endpoints for all carrier operations.
- Build a robust Staff Management system allowing the Super Admin to create, suspend, and delete other staff.
- Ensure any Admin can delete any other Admin, except for the system's root Super Admin.
- Implement dynamic Role-Based Access Control (RBAC) where custom roles and granular permissions can be assigned to staff.
- Log all data-mutating operations (POST, PUT, PATCH, DELETE) to an Audit Log to track who did what and when.
- Update `docs/admin.openapi.json` to perfectly match the newly structured "self-explanatory" endpoints.

## 3. User Stories

- As a **Developer**, I want the endpoints to be extremely explicit (e.g., `/create-new-carrier`) instead of relying solely on HTTP methods, so I avoid route collision and confusion.
- As an **Admin**, I want to view, add, update, and manage shipping carriers via the admin portal.
- As an **Admin**, I want to verify that the Carrier endpoints aren't throwing 404 errors because of bad router mounting.
- As a **Super Admin**, I want to create new Staff members so they can help manage the platform.
- As a **Super Admin**, I want to assign dynamic roles and granular permissions to staff so I control exactly what they can do.
- As an **Admin**, I want to be able to suspend, re-enable, or delete other admins (except the Root Super Admin).
- As an **Admin**, I want an Audit Log that records every action any staff member takes (e.g., "Admin X created Carrier Y at 10:00 AM") so I can track history.

## 4. Features / Tasks

### Carrier Management Redo (CM)

> **Note to Developer:** Ensure the Carrier router is explicitly mounted under the `adminRouter` (e.g., `router.use('/carriers', carrierRoutes)` inside `admin.routes.ts`) so it responds at `/api/admin/carriers/…` rather than dropping requests.

- **CM01: Mount Carrier Router**
  - Verify and fix the exact mounting point of the carrier routes onto the main Express `/api/admin` router.
- **CM02: Explicit Carrier Endpoints**
  - `GET /api/admin/carriers/get-all-carriers`: Retrieve all carriers.
  - `GET /api/admin/carriers/get-single-carrier/:id`: Retrieve a specific carrier by ID.
  - `POST /api/admin/carriers/create-new-carrier`: Create a new carrier.
  - `PUT /api/admin/carriers/update-carrier/:id`: Update an existing carrier.
  - `DELETE /api/admin/carriers/delete-carrier/:id`: Delete a carrier.

### Staff & Role Management (SM)

> **Note to Developer:** Roles should be dynamic. The system needs a `Role` table and a `Staff` (or mapping `User`) table.

- **SM01: Explicit Role Endpoints**
  - `POST /api/admin/staff/create-new-role`: Create a new custom role with specific permissions (e.g., `["users:write", "carriers:manage"]`).
  - `GET /api/admin/staff/get-all-roles`: Fetch all available dynamic roles.
- **SM02: Explicit Staff Management Endpoints**
  - `POST /api/admin/staff/create-new-staff`: Create a staff member and assign a role.
  - `GET /api/admin/staff/get-all-staff`: Fetch all staff members.
  - `PUT /api/admin/staff/assign-staff-role/:id`: Change a staff member's dynamic role.
  - `PUT /api/admin/staff/suspend-staff/:id`: Suspend a staff member (prevents login).
  - `PUT /api/admin/staff/enable-staff/:id`: Re-enable a suspended staff member.
  - `DELETE /api/admin/staff/delete-staff/:id`: Delete an admin/staff (Block deletion if the target is the root Super Admin).

### Audit Logging (AL)

- **AL01: Action Middleware**
  - Create a middleware that catches all **mutating** HTTP requests (`POST`, `PUT`, `PATCH`, `DELETE`) made to `/api/admin/*`.
- **AL02: Database Storage**
  - Log the action into an `AuditLog` table. Ensure the log captures:
    - `adminId` (Who did it)
    - `action` (e.g., "Created new carrier", based on endpoint hit or a custom message)
    - `timestamp` (When they did it)
    - `targetId` (Optional: the ID of the resource affected)
    - `payload` (Optional: what data was changed)
- **AL03: Explicit Audit Endpoints**
  - `GET /api/admin/logs/get-all-system-logs`: Retrieve the audit history for tracking purposes.

### OpenAPI Specification (OA)

- **OA01: Update `docs/admin.openapi.json`**
  - Update the OpenAPI document to reflect the new **self-explanatory** endpoint paths for both Carriers and Staff.
  - Add request/response schemas for Roles, Staff creation, and Audit Logs.

## 5. Non-Goals (Out of Scope)

- Customer-facing endpoints (this is strictly Admin panel work).
- Deleting the ROOT Super Admin. The developer must ensure the root admin is strictly protected against deletion or suspension.

## 6. Technical Considerations

- **Explicit Routes:** The implementation _must_ abandon the standard RESTful paradigm (e.g., `PUT /carriers/:id`) in favor of the explicit routes requested by the user (`PUT /carriers/update-carrier/:id`).
- **404 Fixes:** The 404 errors on Carriers strongly point to a routing issue. The developer must check `src/routes/admin.routes.ts` or `src/app.ts` to ensure `carrierRoutes` is actually imported and `router.use()` is called correctly on `/api/admin`.

## 7. Success Metrics

- Navigating to Carrier Management in the admin panel accurately loads and saves data without 404 errors.
- A new Staff member can be created, assigned a dynamic role, suspended, and optionally deleted.
- The `AuditLog` database table successfully captures every mutating request made by any Admin.
- The Swagger/OpenAPI documentation (`docs/admin.openapi.json`) correctly lists all the new self-explanatory endpoint paths.

## 8. Open Questions

- Should we seed a default "Super Admin" role in the database upon initial migration to ensure the first admin always has maximum permissions?
- Is there a specific format required for the permission strings inside the dynamic roles (e.g., `carriers:read`, `staff:write`)?
