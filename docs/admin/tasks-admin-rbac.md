## Relevant Files

- `src/constants/permissions.ts` - New file to store the dictionary of all system permissions, grouped by resource, with descriptions.
- `src/controllers/staff.controller.ts` - Contains the logic for fetching permissions, full role CRUD, and staff role assignment logic.
- `src/routes/staff.routes.ts` - Where the new endpoints (`GET /roles/permissions`, `PUT /update-role/:id`, `DELETE /delete-role/:id`) will be mounted and protected.
- `src/services/email.service.ts` - Will be used to trigger email notifications when a staff member's role changes.
- `docs/admin/rbac-guide.md` - New developer documentation file detailing RBAC logic, endpoints, and frontend integration.
- `docs/openapi.json` - (Or `admin.openapi.json` depending on module breakdown) Needs updating with the new endpoint schemas and models.

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, you must check it off in this markdown file by changing `- [ ]` to `- [x]`. This helps track progress and ensures you don't skip any steps.

Update the file after completing each sub-task, not just after completing an entire parent task.

## Tasks

### Permissions Management

- [x] PE00: Permissions Management API Implementation
  - [x] PE01: Define a constant dictionary/list of all valid permissions spanning the app (e.g., `shipment:write`, `staff:read`) with groups and descriptions.
  - [x] PE02: Create `getAllPermissions` logic in `StaffController` that returns this structured data so the frontend can build UIs.
  - [x] PE03: Define `GET /get-all-permissions` route in `staff.routes.ts` protected by `requirePermission("staff:read")`.

### Role Management

- [x] RM00: Role Management CRUD Operations
  - [x] RM01: Define Zod schemas for updating a role.
  - [x] RM02: Add `updateRole` method in `StaffController`. Enforce guards to prevent mutating permanent/default system roles like "Super Admin" if necessary.
  - [x] RM03: Add `deleteRole` method in `StaffController`. Must prevent deleting "Super Admin" and check if there are users with the role to prevent orphaned data.
  - [x] RM04: Mount `PUT /update-role/:id` and `DELETE /delete-role/:id` in `staff.routes.ts`, protected by `requirePermission("staff:write")`.

### Staff Assignment

- [x] SA00: Staff Assignment and Notifications
  - [x] SA01: Modify `assignStaffRole` inside `StaffController` to accept an optional `notify: boolean` parameter in the request body.
  - [x] SA02: Add email logic using `emailService`: if `notify` is true, send an email to the staff member alerting them of their newly assigned role.

### Documentation

- [x] DO00: RBAC Documentation and OpenAPI Updates
  - [x] DO01: Create `/docs/admin/rbac-guide.md` detailing all backend roles, permission nomenclature, API endpoint usages, and how the frontend should build the Help UI.
  - [x] DO02: Update OpenAPI specs (like `docs/admin.openapi.json`) with schemas for the new permission endpoint, roles editing/deletion, and the assignment notifications.
