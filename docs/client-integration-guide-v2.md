# Client Integration Guide: Deletion, Carriers & Commissions

This document provides technical instructions for frontend developers to integrate the new administrative features: **Deletion Management**, **Carrier Profile CRUD**, and **Refined Commission Controls**.

## 1. Authentication & Security

All administrative endpoints require an `Authorization` header with a valid Admin Bearer Token.

- **Header**: `Authorization: Bearer <ADMIN_TOKEN>`
- **Access Level**: Requires specific permissions (`user:write`, `shipment:write`, `carrier:write`, etc.) in the admin role.

---

## 2. Deletion Management

The system supports **Safe Delete** (guarded by business logic) and **Force Delete** (bypass guards, perform cascade).

### 2.1 User Deletion

- **Safe Delete User**: `DELETE /api/admin/users/:id`
  - Blocks if the user has active shipments (status not in `DELIVERED`, `CANCELLED`, `COMPLETED`).
- **Force Delete User**: `POST /api/admin/users/:id/cascade`
  - Deletes the user and all linked data (Shipments, Estimates, Sessions, Activity).
- **Bulk Delete Users**: `POST /api/admin/users/bulk-delete`
  - **Payload**:
    ```json
    {
      "ids": ["uuid-1", "uuid-2"],
      "force": false
    }
    ```

### 2.2 Shipment Deletion

- **Individual Delete**: `DELETE /api/admin/shipments/:id?force=false`
  - Safe by default; use `?force=true` to bypass terminal status checks.
- **Bulk Delete**: `POST /api/admin/shipments/bulk-delete`
  - **Payload**:
    ```json
    {
      "ids": ["uuid-1", "uuid-2"],
      "force": true
    }
    ```

### 2.3 Lead Deletion (Shipping Estimates)

- **Individual Delete**: `DELETE /api/admin/leads/:id`
- **Bulk Delete**: `POST /api/admin/leads/bulk-delete`
  - **Payload**:
    ```json
    { "ids": ["uuid-1", "uuid-2"] }
    ```

---

## 3. Carrier & Commission Management

### 3.1 Carrier Profile CRUD

Manage shipping providers (FedEx, etc.) and their API credentials.

- **List Carriers**: `GET /api/admin/carriers`
  - **Response**: Sensitive fields like `apiKey` and `apiSecret` are masked (e.g., `ABCD********EFGH`).
- **Create Carrier**: `POST /api/admin/carriers`
  - **Payload**:
    ```json
    {
      "name": "FedEx",
      "baseUrl": "https://apis-sandbox.fedex.com",
      "apiKey": "your-key",
      "apiSecret": "your-secret",
      "isActive": true
    }
    ```
- **Update Profile**: `PUT /api/admin/carriers/:id`
  - Supports partial updates.
- **Delete Carrier**: `DELETE /api/admin/carriers/:id`
  - Blocked if the carrier has existing shipments in the database.

### 3.2 Commission Controls (CL02 Rules)

Commissions are applied based on the 4 shipping stages.

- **Update Commissions**: `PUT /api/admin/carriers/:id/commissions`
- **Payload Structure**:
  ```json
  {
    "local": { "type": "FIXED", "value": 10.0, "currency": "PLN" },
    "export": { "type": "PERCENT", "value": 0.15 },
    "import": { "type": "FIXED", "value": 20.0, "currency": "EUR" },
    "international": { "type": "FIXED", "value": 50.0, "currency": "EUR" }
  }
  ```
- **Strict Currency Rules**:
  - `PLN`: Can only be used for the `local` stage.
  - `EUR`: Can be used for all 4 stages.
  - Percentage markup is always currency-agnostic.

---

## 4. Analytics & Conversion Tracking

### 4.1 Enhanced Dashboard Stats

`GET /api/admin/dashboard/stats`

**Response Structure**:

```json
{
  "totalUsers": 150,
  "totalShipments": 450,
  "revenue": { "PLN": 1200.5, "EUR": 450.0 },
  "leads": 890,
  "activeShipments": 24
}
```

_Note: `activeShipments` counts all shipments that are not DELIVERED, COMPLETED, FAILED, or CANCELLED._

### 4.2 Lead Conversion Tracking

When creating a shipment from an estimate (lead), provide the `estimateId`.

- **Endpoint**: `POST /api/shipments` (Client) or `POST /api/admin/shipments/proxy` (Admin)
- **New Field**: `estimateId` (string, optional)
- **Effect**: Setting this marks the corresponding lead as `converted: true`, allowing admins to filter converted vs non-converted leads in the Leads table.

---

## 5. Data Structures

### Carrier Object

```typescript
interface Carrier {
  id: string;
  name: string;
  baseUrl?: string;
  isActive: boolean;
  localCommission: Commission;
  exportCommission: Commission;
  importCommission: Commission;
  internationalCommission: Commission;
}

interface Commission {
  type: "PERCENT" | "FIXED";
  value: number;
  currency: "PLN" | "EUR";
}
```

### Shipment Object

```typescript
interface Shipment {
  id: string;
  customTrackingNumber: string;
  estimateId?: string; // Persistent link to the lead
  shipmentStatus: string;
  paymentStatus: string;
  carrier: { name: string };
}
```

### Lead (Estimate) Object

```typescript
interface Lead {
  id: string;
  email?: string;
  phone?: string;
  converted: boolean; // TRUE means a shipment was created from this
  actualPrice?: number;
  createdAt: string;
  user?: {
    userCode: string;
    name: string;
  };
}
```
