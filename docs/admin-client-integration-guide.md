# Client-Side Integration Guide: Staff & Carrier Management (Admin Panel)

This guide provides the frontend/mobile development team with the precise endpoint structures, expected payloads, and integration strategies for the newly rebuilt Staff and Carrier Management systems within the MLS Admin Panel.

## 🚨 CRITICAL ROUTING NOTICE 🚨

**DO NOT use standard RESTful routing assumptions.** Complete explicit action-naming is now mandatory.

**INCORRECT:** `GET /api/admin/carriers` or `POST /api/admin/staff`
**CORRECT:** `GET /api/admin/carriers/get-all-carriers` or `POST /api/admin/staff/create-new-staff`

All endpoints listed below are prefixed with your environment's base API URL and require an `Authorization: Bearer <Admin_JWT>` header.

---

## 1. Carrier Management (`/api/admin/carriers`)

This module manages the list of available shipping carriers and their API credentials/commissions.

### 1.1 List All Carriers

Retrieves all carriers in the system. Sensitive data (`apiKey`, `apiSecret`) is masked (e.g., `sk_********xx`).

- **Endpoint:** `GET /api/admin/carriers/get-all-carriers`
- **Response Shape:**
  ```typescript
  Array<{
    id: string;
    name: string;
    isActive: boolean;
    apiKey: string | null;
    apiSecret: string | null;
    baseUrl: string | null;
    localCommission: { type: "PERCENT" | "FIXED"; value: number } | null;
    exportCommission: { type: "PERCENT" | "FIXED"; value: number } | null;
    importCommission: { type: "PERCENT" | "FIXED"; value: number } | null;
    internationalCommission: {
      type: "PERCENT" | "FIXED";
      value: number;
    } | null;
  }>;
  ```

### 1.2 Get Single Carrier

- **Endpoint:** `GET /api/admin/carriers/get-single-carrier/:id`
- **Response Shape:** Single `Carrier` object as defined above.

### 1.3 Create New Carrier

- **Endpoint:** `POST /api/admin/carriers/create-new-carrier`
- **Body Payload:**
  ```typescript
  {
    "name": "FedEx", // Required
    "apiKey": "production_key_123", // Optional
    "apiSecret": "super_secret_xyz", // Optional
    "baseUrl": "https://apis.fedex.com", // Optional, Must be valid URL
    "isActive": true // Optional
  }
  ```

### 1.4 Update Carrier Details

- **Endpoint:** `PUT /api/admin/carriers/update-carrier/:id`
- **Body Payload:** Partial object matching the creation payload.

### 1.5 Update Carrier Commissions

Allows updating the 4-stage commission configuration. **Note:** Validation ensures `FIXED` commissions using `PLN` can ONLY be applied to the `local` stage. `EUR` must be used for export/import/international fixed fees.

- **Endpoint:** `PUT /api/admin/carriers/update-carrier-commissions/:id`
- **Body Payload (Partial Optional):**
  ```typescript
  {
    "local": { "type": "PERCENT", "value": 0.15 },
    "international": { "type": "FIXED", "value": 15.00, "currency": "EUR" }
  }
  ```

### 1.6 Delete Carrier

- **Endpoint:** `DELETE /api/admin/carriers/delete-carrier/:id`
- **Status:** `200 OK`
- **Error Behavior:** Will return `400 Bad Request` if the carrier has existing shipment records linked to it.

---

## 2. Staff & Role Management (`/api/admin/staff`)

This module handles creating secondary administrators, assigning custom dynamic roles, and hierarchical management.

### 2.1 Get All Roles

Always fetch roles before rendering the "Create Staff" modal so the Super Admin can select a valid `roleId`.

- **Endpoint:** `GET /api/admin/staff/get-all-roles`
- **Response Shape:**
  ```typescript
  Array<{
    id: string;
    name: string;
    permissions: string[];
  }>;
  ```

### 2.2 Create New Role

Create a custom role with a specific array of wildcard permissions.

- **Endpoint:** `POST /api/admin/staff/create-new-role`
- **Body Payload:**
  ```typescript
  {
    "name": "Support Agent",
    "permissions": ["user:read", "user:write", "shipment:read"]
  }
  ```

### 2.3 List All Staff

Retrieves all staff (automatically excludes the currently requesting admin from the list).

- **Endpoint:** `GET /api/admin/staff/get-all-staff`
- **Response Shape:**
  ```typescript
  Array<{
    id: string;
    name: string;
    email: string;
    adminCode: string;
    isActive: boolean; // Indicates if they are suspended
    role: { id: string; name: string; permissions: string[] };
    lastActive: string; // ISO DateTime
    lastLogin: string; // ISO DateTime
  }>;
  ```

### 2.4 Create New Staff Member

Creates a staff member, generates an `MLS-A-XXXX` code, securely creates a random temporary password, and automatically emails the new staff member their login credentials.

- **Endpoint:** `POST /api/admin/staff/create-new-staff`
- **Body Payload:**
  ```typescript
  {
    "email": "new.staff@mls.com",
    "name": "Jane Doe",
    "roleId": "uuid-of-support-agent-role"
  }
  ```

### 2.5 Assign / Change Staff Role

Changes a staff member's administrative role.

- **Endpoint:** `PUT /api/admin/staff/assign-staff-role/:id`
- **Body Payload:**
  ```typescript
  {
    "roleId": "uuid-of-new-role"
  }
  ```

### 2.6 Suspend & Enable Staff

Suspended staff (`isActive: false`) will instantly be blocked from executing protected endpoints or logging in.

- **Suspend Endpoint:** `PUT /api/admin/staff/suspend-staff/:id` (No body required)
- **Enable Endpoint:** `PUT /api/admin/staff/enable-staff/:id` (No body required)
- **Validation:** Returns `403 Forbidden` if attempting to suspend a `Super Admin` or oneself.

### 2.7 Delete Staff Member

Permanently deletes a staff member from the system.

- **Endpoint:** `DELETE /api/admin/staff/delete-staff/:id`
- **Validation:** Returns `403 Forbidden` if attempting to delete a `Super Admin` or oneself.

---

## 3. Best Practices & Client Implementation Tips

### 3.1 Displaying Suspend vs Delete Actions

For safety, design your UI so that "Suspend" is the primary moderation action against staff members. "Delete" should be tucked behind a secondary confirmation dialog. If a Staff Member's `role.name === "Super Admin"`, completely hide the Suspend/Delete/Edit Role buttons in the UI for that row.

### 3.2 Error Handling for Explicit Routes

Because the backend routing is now explicitly matched to paths like `/delete-carrier/:id`, ensure your Axios/Fetch clients are accurately constructing the URL strings. Do not append the `:id` blindly; inject it into the path template:

```javascript
// Example correct implementation
const deleteCarrier = async (id) => {
  return await axios.delete(`/api/admin/carriers/delete-carrier/${id}`);
};
```

### 3.3 Audit Logging Awareness

Every single `POST`, `PUT`, and `DELETE` request sent to these explicit endpoints is now permanently logged in the backend `AuditLog` table against the acting Admin's account. This means there is total observability. Prompt users with "Are you sure?" dialogs for destructive actions to limit accidental audit noise.
