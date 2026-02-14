# Admin Role Management Guide

This guide explains the Role-Based Access Control (RBAC) system used in the MLS Admin Panel. It details the permission structure and hierarchy rules.

## 1. Role Model

Roles are defined in the database and assigned to Admins.

### Schema

```prisma
model Role {
  id          String   @id @default(uuid())
  name        String   @unique // e.g., "Super Admin", "Support", "Finance"
  description String?
  permissions Json     // Array of strings: ["user:read", "shipment:write"]
  admins      Admin[]
}
```

## 2. Permissions List

The application verifies permissions using the `requirePermission(permission)` middleware.

### Available Permissions

| Scope         | Permission Key   | Description                                                |
| :------------ | :--------------- | :--------------------------------------------------------- |
| **Staff**     | `staff:read`     | View the list of staff members.                            |
|               | `staff:write`    | Create and update staff accounts.                          |
| **Users**     | `user:read`      | View the user list.                                        |
|               | `user:write`     | Moderate users (ban/warn), manual verify, update profiles. |
| **Shipments** | `shipment:read`  | View shipments (implied by dashboard access).              |
|               | `shipment:write` | Proxy creation, payment bypass, status override.           |
| **Emails**    | `email:read`     | View email templates.                                      |
|               | `email:write`    | Edit templates and send one-off emails.                    |
| **Leads**     | `leads:read`     | View marketing leads/estimates.                            |
| **Dashboard** | `dashboard:read` | View high-level stats and trends.                          |

### Super Admin Role

- **Name**: `Super Admin` (Case sensitive check in code: `role.name === "Super Admin"`)
- **Privileges**:
  - Bypasses all permission checks (effectively has `*`).
  - Can create/edit/delete other Admins including other Super Admins.
  - Can manage Roles.

## 3. Hierarchy Rules

Strict rules prevent privilege escalation.

1.  **Super Admin Supremacy**: Only a Super Admin can create another Super Admin.
2.  **Self-Protection**: A Super Admin cannot be edited or deleted by a non-Super Admin, even if they have `staff:write`.
3.  **Role Locking**: A regular admin cannot assign the "Super Admin" role to anyone.
4.  **Self-Edit**: Admins cannot change their _own_ role to escalate privileges.

## 4. Implementation Strategy

When building the frontend "Add Staff" form:

1.  Fetch the list of available roles.
2.  If the current user is **NOT** a Super Admin, hide/disable the "Super Admin" option from the dropdown.
3.  Display permissions as a read-only list when selecting a role to help the user understand what access they are granting.
