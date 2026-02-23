# PRD: Staff Role Management and Permissions UI

## 1. Introduction / Overview

This PRD outlines the requirements for building an intuitive UI on the admin side for Staff Role Management and Permissions, coupled with robust backend enforcement. The goal is to allow administrators (with `staff:write` permission) to easily create new roles and assign permissions using dynamic dropdowns. It simplifies the setup for new staff by allowing the admin to create a new role with specific permissions directly during the user creation process, which will automatically be saved globally for future use. The system must also correctly enforce these permissions by locking out unauthorized sections both visually in the sidebar and functionally across the application and API, showing a dedicated access denied screen when navigated to directly.

## 2. Goals

- Streamline the role and permission assignment process via the admin interface using dynamic dropdowns.
- Enable the creation of a new staff member and a new role simultaneously in one request, persisting the new role globally.
- Enforce strict role-based access control (RBAC) on the frontend sidebar (grayed out with a lock icon) and full-page access denial.
- Allow any admin with `staff:write` to assign any permissions, including those they may not possess themselves.
- Provide clear notifications (optional) when a staff's role or access level is updated.

## 3. User Stories

- As an admin, I want to assign permissions to roles using a dropdown list of friendly permission names rather than manually typing permission IDs like `user:read`, so that I don't make mistakes.
- As an admin creating a new staff member, I want the option to quickly define a new role with specific permissions on the same screen. The system should create and save this role globally before assigning it to the staff.
- As an admin modifying an existing role, I want all staff currently assigned to this role to automatically inherit the updated permissions.
- As an admin, I want to be prompted when I delete or change a staff member's role to confirm if they should receive an email notification about the change.
- As a staff member with restricted access, I want to see disabled menu items with lock icons for areas I don't have access to, and see an explicit "You don't have permission to view this page" message if I accidentally navigate directly to a restricted URL.

## 4. Features / Tasks

- **Role and Permission Management UI (`RM`)**:
  - RM01: Implement a dynamic dropdown for permissions when creating or editing a role, mapping friendly permission names to their system IDs (e.g., `user:read`).
  - RM02: Build a dynamic role selection dropdown in the Staff management UI.

- **Staff Creation Flow (`SC`)**:
  - SC01: Update the "Create Staff" interface to allow selecting an existing role from a dropdown OR defining a brand-new role inline.
  - SC02: Implement backend logic where if a new role is defined inline during staff creation, the backend creates the new role globally first, then assigns it to the newly created staff member.

- **Frontend Access Enforcement (`FA`)**:
  - FA01: Update the sidebar navigation to evaluate the logged-in user's permissions. If a permission is missing, render the menu item grayed out with a lock icon.
  - FA02: Implement a global "Access Denied" view to display when a user directly navigates to a URL they lack permissions for.

- **Backend Logic & Verification (`BL`)**:
  - BL01: Ensure admins with the `staff:write` permission bypass any privilege escalation checks, allowing them to create/assign any permission.
  - BL02: Ensure changes to an existing role's permissions automatically apply to all staff assigned to that role.
  - BL03: Block the deletion of any role currently assigned to active staff members, returning an error prompting the admin to reassign those staff to a different role first.
  - BL04: Ensure backend route guards correctly reject unauthorized API calls with 403 Forbidden.

- **Notifications (`NO`)**:
  - NO01: Implement an optional toggle during role assignment/modification to trigger email notifications to the affected staff.

## 5. Non-Goals (Out of Scope)

- Attribute-based access control (ABAC) or row-level security.
- Managing roles and permissions on behalf of the customer/client portal (this is strictly for Admin dashboard staff).

## 6. Design Considerations

- Use the existing application design system (flat, minimalist, modern).
- Sidebar locked states should be visually clear without breaking the layout alignment.
- The inline new role creation during staff addition should feel seamless—perhaps using an "accordion" or "Add New Role" toggle that reveals permission checkboxes.

## 7. Technical Considerations

- All backend validations must use Zod schemas.
- Re-use the permissions definitions from `docs/admin/permissions.ts`.

## 8. Success Metrics

- Admins can create a user and a custom role simultaneously without navigating to multiple pages.
- Sidebar accurately reflects accessible features for standard staff compared to Super Admins.
- Zero orphaned users resulting from deleted roles.

## 9. Open Questions

- None at this time.
