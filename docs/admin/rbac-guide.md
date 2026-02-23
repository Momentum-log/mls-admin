# MLS Role-Based Access Control (RBAC) Guide

## Overview

The MLS system utilizes Role-Based Access Control (RBAC) to restrict administrative functionalities based on granular permissions assigned to distinct roles. Staff members are granted exactly one `Role`.

## Permissions List

The application relies on explicitly defined permissions strings (e.g. `shipment:write`). Wildcard prefixes (like `shipment:*`) or universal `*` checks are natively supported by the internal `RbacService`.

To get the latest live permissions list from the system (for client-side UI rendering), a GET endpoint is available:

**Endpoint:** `GET /roles/permissions`

- **Output:** JSON Array grouped by resources:

```json
[
  {
    "group": "Users",
    "permissions": [
      {
        "id": "user:read",
        "name": "View Users",
        "description": "Allows the user to view the list and details..."
      }
    ]
  }
]
```

## Creating & Managing Roles

The system provides a set of endpoints dynamically controlling these roles. Protect your UI interactions by querying `staff:write` permissions.

1. **Get All Roles:** `GET /get-all-roles`
2. **Create New Role:** `POST /create-new-role`
   - Body: `{ "name": "Manager", "permissions": ["user:read", "shipment:*"] }`
3. **Update Role:** `PUT /update-role/:id`
   - Body: `{ "name": "Manager", "description": "Operational level access", "permissions": ["..."] }`
4. **Delete Role:** `DELETE /delete-role/:id`
   - Constraint constraints block deletion of the critical `Super Admin` role or any role actively assigned to a user.

## Role Hierarchies & Protections

The system has a built-in hierarchy rule:

1. A regular admin cannot edit, suspend, or manage a `Super Admin` user.
2. An admin cannot edit or downgrade the system's `Super Admin` Role entity directly.
3. An admin, even with `staff:write`, is forbidden from directly manipulating their own current role ID.

## Notification on Assignment

When updating a user's role:
**Endpoint:** `PUT /assign-staff-role/:id`

- Body: `{ "roleId": "UUID", "notify": true }`

Setting `notify` to `true` will automatically generate an alert email triggering the MLS Notification Service to send the staff member a confirmation of their new role capabilities.

## Frontend Implementation Guidance

For building the RBAC Manager on the client UI:

1. Call `GET /roles/permissions`.
2. Generate accordions / categorized blocks (e.g. `Dashboard`, `Users`, `Shipments`) using the `group` properties.
3. Form checkbox lists using the `permissions` mappings.
4. When creating or updating a Role, traverse the selected checkboxes to send an array of the `id` values back to the server endpoints.
