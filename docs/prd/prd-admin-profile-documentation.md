# PRD: Admin Profile & Dynamic Documentation

## 1. Introduction / Overview

This PRD outlines the requirements for building an interactive Admin Profile drawer/modal that provides quick access to the administrator's details and dynamically displays system documentation. The goal is to provide a contextual, permissions-aware help guide describing how the Admin Dashboard works, acting as an integrated tutorial to onboard and guide staff members.

## 2. Goals

- Provide immediate access to the current admin's Name, Email, and Role.
- Serve as a comprehensive tutorial/guide to the Admin Dashboard (users, shipments, staff, carriers, etc.).
- Ensure documentation is strictly permission-based; admins should not see guides for modules they lack access to.
- Explain the RBAC system, including how to create roles, assign permissions, and manage staff leaders.
- Render the extensive tutorial content dynamically within the UI without needing to navigate away from the current context.

## 3. User Stories

- As an Admin, I want to click on my profile so that I can see my details and access the system guide without navigating away from my current work.
- As an Admin with limited permissions, I only want to see documentation for the tabs I have access to, so I am not confused by features I cannot use.
- As a Super Admin, I want to read a tutorial on how the Role-Based Access Control works, so I can accurately create new custom roles and assign them to staff members.
- As a new Staff Member, I want a comprehensive guide explaining how the User Table, Shipments, and other dashboard areas work so I can learn the system quickly.

## 4. Features / Tasks

### Profile Interface (`PI`)

- PI01: Implement a slide-out drawer or modal overlay that opens when an admin clicks their profile avatar/icon.
- PI02: Display the current admin's `Name`, `Email`, and assigned `Role` prominently at the top of the interface.

### Dynamic Documentation System (`DD`)

- DD01: Create a categorized Help / Tutorial section within the profile interface (e.g., using tabs or accordions).
- DD02: Integrate the extensive Markdown guide (`/docs/admin/admin-comprehensive-guide.md`) into the frontend, potentially parsing it dynamically or mapping its content to React components.
- DD03: Implement permission checks for each documentation category. Hide the documentation entirely if the admin lacks the relevant `read` or `write` permission for that domain (e.g., hide the Shipments tutorial if they lack `shipment:read` or `shipment:write`).

### Module Tutorials (`MT`)

- MT01: Include tutorial content explaining the Dashboard, User Table, User Staff rows, and Shipping tabs.
- MT02: Include an in-depth tutorial on how the permissions system works (RBAC), mapping every system permission based on the `permissions.ts` configuration.
- MT03: Provide step-by-step instructions on creating new roles, creating staff leaders, and assigning roles to staff.

## 5. Non-Goals (Out of Scope)

- Creating a separate dedicated full-page documentation portal (e.g., `/admin/docs`).
- Displaying disabled or greyed-out documentation for inaccessible features (they will be hidden entirely to avoid clutter).

## 6. Design Considerations

- The drawer/modal should be wide enough to comfortably read documentation without feeling cramped.
- Use an elegant Markdown renderer if fetching the documentation dynamically.
- For the tutorials, utilize clear typography, bullet points, and high contrast for readability in both light/dark modes according to the global CSS styles.

## 7. Technical Considerations

- The frontend will need to evaluate the current user's JWT payload (which contains their active permissions) against the required permissions for each documentation block.
- A Markdown file titled `admin-comprehensive-guide.md` has been simultaneously provided to act as the source of truth for the tutorial content. You may parse this file or hardcode its structured content directly into the UI components depending on technical constraints.

## 8. Success Metrics

- 100% of newly onboarded staff can understand dashboard tabs without requiring manual walkthroughs.
- Zero support questions related to "how do I add a role or user" from Super Admins.
- The drawer cleanly hides documentation blocks for inaccessible areas without layout breaks.

## 9. Open Questions

- Should the profile drawer also include "Edit Profile" capabilities (e.g., updating their own name or password), or is it strictly read-only and documentation-focused for now?
