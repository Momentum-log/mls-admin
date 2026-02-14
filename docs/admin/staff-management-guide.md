# Admin Staff Management Guide

This guide details the implementation of staff management logic. It covers the creation of new admins, assigning roles, and managing the hierarchy.

## Base Endpoint

`/api/admin/staff`

## 1. List Staff

View all admin users except yourself.

### Endpoint

`GET /api/admin/staff`

### Permissions Required

`staff:read`

### Response

Returns an array of admin objects, including their role name and description.

## 2. Create Staff

Create a new admin account. The system automatically generates a secure temporary password and emails it to the new staff member.

### Endpoint

`POST /api/admin/staff`

### Payload

```json
{
  "email": "new.staff@mls.com",
  "name": "New Staff Member",
  "roleId": "uuid-of-role"
}
```

### Logic & Rules

1.  **Welcome Email**: The backend sends an email with the subject "Welcome to MLS Administration" containing the temporary password.
2.  **Hierarchy Check**: A `Super Admin` can create any role. A regular admin (if they have `staff:write`) **CANNOT** create a `Super Admin`.
3.  **Unique Email**: Emails must be unique across the `Admin` table.

## 3. Update Staff

Modify details of an existing staff member.

### Endpoint

`PUT /api/admin/staff/:id`

### Payload

```json
{
  "name": "Updated Name",
  "roleId": "uuid-of-new-role" // Optional
}
```

### Implementation Rules (Hierarchy)

- **Self-Edit Restriction**: You cannot change your own role.
- **Super Admin Protection**:
  - Only a `Super Admin` can edit another `Super Admin`.
  - Only a `Super Admin` can promote someone TO `Super Admin`.
  - If a non-Super Admin tries to edit a Super Admin, the API returns `403 Forbidden`.

## 4. Reset Staff Password

Manually reset a staff member's password.

### Endpoint

`PUT /api/admin/staff/:id/password`

### Payload

```json
{
  "password": "newSecurePassword123!"
}
```

### Best Practices

- **Force Change**: It is recommended to instruct the staff member to change this password immediately after login.
- **Audit**: This action is logged.
