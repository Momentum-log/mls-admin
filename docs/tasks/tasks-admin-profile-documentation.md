## Relevant Files

- `components/layout/Sidebar.tsx` (or equivalent layout file) - Where the admin profile avatar/icon is located, acting as the trigger for the drawer.
- `components/admin-profile/AdminProfileDrawer.tsx` - The new main slide-out drawer or modal component.
- `components/admin-profile/DocsViewer.tsx` - The component responsible for rendering and conditionally displaying the documentation sections.
- `docs/admin/admin-comprehensive-guide.md` - The source of truth for the documentation content. You may need to import it as a string or manually restructure it into React components depending on the chosen implementation.
- `hooks/useAuth.ts` (or equivalent) - To access the current user's profile data (Name, Email, Role) and active permissions.
- `utils/permissions.ts` (or equivalent) - Utility functions for checking if the user meets the `read` or `write` criteria for specific documentation sections.

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `AdminProfileDrawer.tsx` and `AdminProfileDrawer.test.tsx` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, you must check it off in this markdown file by changing `- [ ]` to `- [x]`. This helps track progress and ensures you don't skip any steps.

Example:

- `- [ ] <PREFIX>00: <Parent Task Title>` → `- [x] <PREFIX>00: <Parent Task Title>` (after completing)

Update the file after completing each sub-task, not just after completing an entire parent task.

## Tasks

### Profile Interface

- [x] PI00: Implement Admin Profile slide-out drawer or modal
  - [x] PI01: Create the `AdminProfileDrawer.tsx` component using an accessible UI library (e.g., Shadcn UI Sheet/Dialog or similar).
  - [x] PI02: Add an `onClick` handler to the profile avatar in the main layout/sidebar to toggle the drawer's visibility.
  - [x] PI03: Fetch the current user's details (Name, Email, Role) from the authentication context or state.
  - [x] PI04: Display the user's details prominently at the top of the drawer.

### Dynamic Documentation System

- [x] DD00: Develop Dynamic Documentation Viewer
  - [x] DD01: Create a `DocsViewer.tsx` component to handle the layout of the tutorial (e.g., using tabs, accordions, or a scrollable list).
  - [x] DD02: Implement logic to evaluate the user's permissions against the required permissions for each documentation section.
  - [x] DD03: Ensure sections where the user lacks both `read` and `write` permissions are completely hidden from the UI, avoiding empty tabs or "access denied" messages.
  - [x] DD04: Integrate `DocsViewer.tsx` into the `AdminProfileDrawer.tsx`.

### Module Tutorials

- [x] MT00: Integrate Tutorial Content
  - [x] MT01: Implement the "Dashboard Overview" tutorial section (requires `dashboard:read` or `dashboard:write`).
  - [x] MT02: Implement the "Managing Users" tutorial section (requires `user:read` or `user:write`).
  - [x] MT03: Implement the "Managing Shipments" tutorial section (requires `shipment:read` or `shipment:write`).
  - [x] MT04: Implement the "Managing Carriers & Logistics" tutorial section (requires `carrier:read` or `carrier:write`).
  - [x] MT05: Implement the "Marketing, Leads & Emails" tutorial sections (requires `leads:read`/`leads:write` or `email:read`/`email:write`).
  - [x] MT06: Implement the "Staff Administration & RBAC" tutorial section, detailing permissions, role creation, and staff assignment (requires `staff:read` or `staff:write`).
  - [x] MT07: Ensure the content perfectly mirrors the provided `docs/admin/admin-comprehensive-guide.md` and respects the project's styling/UI system.
