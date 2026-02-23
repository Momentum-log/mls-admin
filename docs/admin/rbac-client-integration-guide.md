# RBAC Client Implementation Guide

This guide details how the client-side (Frontend Admin Dashboard) should implement the Role-Based Access Control (RBAC) UI using the newly provided APIs.

## 1. Overview of the RBAC Workflow

The frontend will need to provide interfaces for:

1. **Viewing all available System Permissions** (so admins know what access they can grant).
2. **Creating & Updating Roles** using those permissions.
3. **Deleting Custom Roles**.
4. **Assigning Roles to Staff Members** (with an optional email notification).

All endpoints must be authenticated with the Admin's JWT token (as `Bearer <token>`). Ensure the active Admin making these requests has `staff:write` or `staff:read` permissions natively.

---

## 2. API Endpoints Reference

### 1. Fetching All Available Permissions

Before rendering the "Create/Edit Role" form, you must dynamically fetch the list of available permissions from the backend. This ensures the frontend doesn't need to hardcode permission strings, as they might dynamically scale on the backend.

**Endpoint:** `GET /api/admin/staff/roles/permissions`
**Response:**

```json
[
  {
    "group": "Dashboard",
    "permissions": [
      {
        "id": "dashboard:read",
        "name": "View Dashboard Overview",
        "description": "Allows the user to view high-level dashboard metrics, statistics, and reports."
      }
    ]
  },
  {
    "group": "Users",
    "permissions": [
      {
        "id": "user:read",
        "name": "View Users",
        "description": "Allows the user to view the list and details of registered users."
      },
      ...
    ]
  }
]
```

### 2. Creating a Role

**Endpoint:** `POST /api/admin/staff/create-new-role`
**Payload:**

```json
{
  "name": "Support Agent",
  "permissions": ["user:read", "shipment:read", "shipment:write"]
}
```

### 3. Updating a Role

**Endpoint:** `PUT /api/admin/staff/update-role/:id`
**Payload:** (All fields are optional, send what changed)

```json
{
  "name": "Senior Support Agent",
  "description": "Has advanced write capabilities.",
  "permissions": ["user:read", "user:write", "shipment:write"]
}
```

**Important:** The system will block you from renaming the immutable "Super Admin" role.

### 4. Deleting a Role

**Endpoint:** `DELETE /api/admin/staff/delete-role/:id`
**Important Notes:**

- You will receive a `409 Conflict` if the role is currently assigned to any active staff members. The UI should display: _"Cannot delete this role because there are active administrators assigned to it. Please reassign their roles first."_
- You cannot delete the default "Super Admin" role (`403 Forbidden`).

### 5. Assigning a Role to Staff

**Endpoint:** `PUT /api/admin/staff/assign-staff-role/:id`
**Payload:**

```json
{
  "roleId": "uuid-of-the-new-role",
  "notify": true // Pass true to send an automatic email to the staff member about their new role
}
```

---

## 3. Recommended UI Implementation

### The "Create / Edit Role" Form

When building the form to designate permissions for a role, utilize the data returned by `GET /api/admin/staff/roles/permissions`.

1. **Iterate over `groups`:** Create a section header or accordion, e.g., "Users", "Shipments", "Carriers".
2. **Render Checkboxes:** Inside each group, render a checkbox for every item in the `permissions` array.
   - The checkbox label should be the permission's `name` (e.g., "View Users").
   - Display the `description` as subtext or a tooltip underneath the checkbox to guide the Admin on what turning the toggle on actually does.
3. **Handle State:**
   - Maintain an array of strings in your local form state (`selectedPermissions: string[]`).
   - Checkbox value = the permission's `id` (e.g., `"user:read"`).
   - If a checkbox is checked, append `id` to the array. If unchecked, remove it.
4. **Submission:** Upon clicking "Save", send `selectedPermissions` up to the API as the `permissions` payload array.

### Visual Example:

**[Group Section: Shipments]**

- [x] **View Shipments** (`shipment:read`)
      _Allows the user to view all shipments, rates, and customs details._
- [ ] **Edit Shipments** (`shipment:write`)
      _Allows the user to update shipment statuses, override shipments, or refund payments._

### Handling the Notification Toggle

When an Admin changes another Admin's role (e.g., via a dropdown on the Staff List page or inside a Staff Profile), offer a toggle explicitly labeled: **"Notify user via email of role changes"**. Bind this toggle's boolean state directly to the `notify` parameter in the Assign Admin Role payload.
