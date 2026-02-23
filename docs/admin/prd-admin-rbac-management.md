# PRD: Admin RBAC Management & Documentation

### 1. Introduction / Overview

This PRD outlines the requirements for extending our Role-Based Access Control (RBAC) system in the `mls-server`. The feature aims to provide comprehensive tools and documentation for administrators to effectively manage roles and permissions, enabling them to confidently create, update, delete, and assign roles without confusion.

### 2. Goals

- Complete the CRUD operations for Roles (Create, Read, Update, Delete).
- Provide a robust API for fetching all available, granular permissions in the system.
- Add an optional ability to notify admins when their roles are reassigned.
- Maintain comprehensive Markdown documentation that elucidates the inner workings of RBAC for developers/admins to reference and utilize when building client-side help UI.

### 3. User Stories

- As a Super Admin, I want to create custom roles and assign precise permissions so that staff members only have access to what they need.
- As a Super Admin, I want to view a definitive list of all available permissions and what they do, directly from the API, so I can accurately set up new roles on the frontend.
- As a Super Admin, I want to be able to modify the permissions of an existing role, or delete an obsolete role to maintain a clean system.
- As a Super Admin, I want the system to optionally send an email notification when I change an administrator's role, so they are immediately aware of their new access level.
- As a Frontend Developer, I want detailed Markdown documentation explaining the RBAC logic, so that I can construct a clear "RBAC Help" interface on the frontend client.

### 4. Features / Tasks

- **Permissions Management (`PE`)**
  - PE01: Create a `GET` endpoint (e.g., `/api/admin/roles/permissions`) exposing a structured dictionary of all system permissions (e.g., `shipment:write`, `staff:read`) grouped by resource, with descriptive summaries.

- **Role Management Extensions (`RM`)**
  - RM01: Implement an `Update Role` endpoint (`PUT /api/admin/roles/:id`) allowing modifications to role names, descriptions, and their associated permission arrays.
  - RM02: Implement a `Delete Role` endpoint (`DELETE /api/admin/roles/:id`). Prevent deletion of system-critical roles (like "Super Admin") or roles currently assigned to active staff members.
- **Staff Assignment Improvements (`SA`)**
  - SA01: Update the existing `assignStaffRole` endpoint (`PUT /api/admin/staff/assign-staff-role/:id` or equivalent) to accept an optional `notify: boolean` parameter.
  - SA02: Integrate the `EmailService` to send a "Role Updated" notification to the modified Staff Member if the `notify` flag is parsed as true.

- **Documentation (`DO`)**
  - DO01: Create a detailed markdown document at `/docs/admin/rbac-guide.md` covering all roles, permission nomenclature, API endpoint usage, and instructions for how the frontend should build the Help UI.
  - DO02: Ensure `openapi.json` is updated with all new schemas and documentation for the permission endpoint, roles editing/deletion, and the assignment notifications.

### 5. Non-Goals (Out of Scope)

- Implementing dynamic creation of brand new arbitrary actions (or models) not currently predefined in the system.
- Serving a fully rendered HTML Help UI from the backend (frontend developer will read API/guide and build UI).
- Replacing RBAC with attribute-based access control (ABAC).

### 6. Design Considerations (Optional)

- The frontend should parse the permissions JSON from the new API and present them as categorized checkboxes (e.g. grouped by Users, Shipments, Carriers) when the Admin is building a new role.

### 7. Technical Considerations (Optional)

- Protect all new Endpoints with `requirePermission('staff:write')` or specific `role:write` / `role:read` permissions appropriately in the `staff.routes.ts`.
- Deletion of a role needs a soft-lock check ensuring zero users hold that role; if admins exist using the role, return a 409 Conflict instructing to reassign them first.

### 8. Success Metrics

- 100% of available backend permissions are correctly described by the new API.
- Role creation and modification completion time is drastically reduced due to clear system definitions.
- Zero orphaned admins caused by careless role deletion policies.

### 9. Open Questions

- None at this time.
