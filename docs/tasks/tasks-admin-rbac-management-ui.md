# Tasks: Staff Role Management and Permissions UI

## Relevant Files

- `docs/admin/permissions.ts` - Source of truth for all system permissions.
- `api/staff/index.ts` - Client-side API definitions for staff and role management.
- `app/dashboard/staff/staff-table.tsx` - Main staff management listing and creation UI.
- `app/dashboard/staff/roles-table.tsx` - Role management listing and CRUD UI.
- `components/admin-sidebar.tsx` - Navigation component that needs permission-based rendering.
- `types/staff.ts` - TypeScript definitions for roles, permissions, and staff.
- `hooks/staff/use-staff.ts` - TanStack Query hooks for staff and roles.
- `hooks/use-permissions.ts` - (New) Custom hook to check user permissions globally.
- `app/dashboard/denied/page.tsx` - (New) Page to display when a user is unauthorized.
- `components/ui/permission-selector.tsx` - (New) Multi-select component for permissions.

### Notes

- Ensure all backend calls for creating staff handle the new "inline role" logic if provided.
- Permissions should follow the grouping structure defined in `docs/admin/permissions.ts`.
- Use the existing design system (shadcn/ui + Lucide icons).

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, you must check it off in this markdown file by changing `- [ ]` to `- [x]`.

## Tasks

### Backend & API Client Integration

- [x] BE00: Update API Client and Types
  - [x] BE01: Update `types/staff.ts` to include `Permission` type and update `CreateStaffPayload` for inline roles.
  - [x] BE02: Implement `getPermissions()` in `api/staff/index.ts` to fetch mapped permissions.
  - [x] BE03: Implement `updateRole()` and `deleteRole()` in `api/staff/index.ts`.
  - [x] BE04: Update `createNewStaff()` to handle the optional inline role payload.

### Core Permissions Logic

- [x] PL00: Implementation of Permission Hooks
  - [x] PL01: Create `hooks/use-permissions.ts` to provide `hasPermission(permId: string)` logic.
  - [x] PL02: Integrate `use-permissions` into the main layout to ensure user profile/permissions are loaded.

### UI Components

- [x] UC00: Developing RBAC UI Components
  - [x] UC01: Create `components/ui/permission-selector.tsx` using a multi-select or checkbox-group approach for friendly permission selection.
  - [x] UC02: Create `app/dashboard/denied/page.tsx` with a modern "Access Denied" UI and a "Back to Dashboard" button.

### Staff & Role Management Enhancements

- [x] SR00: Enhance Staff Management UI
  - [x] SR01: Update `StaffTable` in `staff-table.tsx` to include an "Assign Role" dropdown with a `notify` toggle.
  - [x] SR02: Modify the "Add Staff" modal to include a toggle for "Create New Role" which reveals the `PermissionSelector`.
  - [x] SR03: Implement the logic to call `createNewStaff` with inline role data.
- [x] SR04: Update Role Management UI
  - [x] SR05: Update `roles-table.tsx` to allow editing existing roles (name, description, permissions).
  - [x] SR06: Implement the delete role confirmation with a check (if backend returns conflict, show "Role in use" message).

### Frontend Security & Sidebar

- [x] FS00: Implement Navigation Enforcement
  - [x] FS01: Update `components/admin-sidebar.tsx` to gray out and add lock icons to routes the user cannot access.
  - [x] FS02: Implement a Higher-Order Component (HOC) or layout-level check to redirect unauthorized direct URL access to `/dashboard/denied`.

### Testing & Verification

- [x] TS00: Final Verification
  - [x] TS01: Verify an admin can create a custom role and staff member in a single flow.
  - [x] TS02: Verify sidebar items are correctly disabled for a "Customer Support" role.
  - [x] TS03: Verify email notification toggle sends the `notify` flag to the backend correctly.
  - [x] TS04: Verify the "Access Denied" screen appears when bypassing the sidebar via direct URL.
