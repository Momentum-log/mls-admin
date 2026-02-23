# PRD: Carrier & Commission Management + Lead Conversion Tracking

## 1. Overview

This PRD defines the scope for integrating **Carrier Profile Management**, **Commission Configuration**, and **Lead Conversion Tracking** into the MLS Admin Dashboard. These features give administrators full control over shipping providers, pricing markups, and conversion analytics—all from a single interface.

**Backend Reference**: `docs/client-integration-guide-v2.md`, `docs/commission-management-guide.md`

---

## 2. Goals

1. **Carrier Management**: Admins can list, create, update, and delete shipping carriers (e.g., DHL, FedEx) and view their API credentials (masked).
2. **Commission Management**: Admins can configure per-carrier commission rules across the 4 shipping stages (Local, Export, Import, International), using either percentage markup or fixed fees.
3. **Lead Conversion Tracking**: Use the backend's `estimateId` linkage to accurately display which shipping estimates converted into shipments.
4. **Enhanced Deletion**: Integrate force/cascade and bulk delete operations for Users, Shipments, and Leads.

---

## 3. Feature Breakdown

### 3.1 Carrier Management Page (`/dashboard/carriers`)

A new top-level section in the sidebar for managing shipping carriers.

#### 3.1.1 Carrier List View

- **Table Columns**: Name, Status (Active/Inactive toggle badge), API Key (masked), Base URL, Created Date, Actions.
- **Actions per carrier**: View/Edit, Manage Commissions, Delete (with guard if carrier has active shipments).
- **"Add Carrier" button**: Opens a creation form/modal.

#### 3.1.2 Carrier Creation/Edit Form

- **Fields**: Name (required), Base URL, API Key, API Secret, Active toggle.
- **Validation**: Name is required; API Key and Secret are required on creation but not on edit (partial update supported).
- **UI**: Modal or side sheet, consistent with existing `EstimateDetailSheet` pattern.

#### 3.1.3 Delete Carrier

- Backend blocks deletion if the carrier has existing shipments.
- Show clear error message when deletion is blocked.
- Use `ConfirmDialog` guard.

### 3.2 Commission Management (Per-Carrier)

#### 3.2.1 Commission Editor

- Accessible from the carrier list row action or from a dedicated tab within carrier details.
- **4 Stages displayed as cards/sections**: Local, Export, Import, International.
- Each stage shows:
  - **Type selector**: `PERCENT` or `FIXED` (radio/select).
  - **Value input**: Numeric field.
  - **Currency selector** (only for `FIXED` type):
    - `Local` stage: `PLN` or `EUR`.
    - `Export`, `Import`, `International` stages: `EUR` only.
  - When `PERCENT` is selected, the currency field is hidden/disabled.
- **Save button**: `PUT /api/admin/carriers/:id/commissions`.
- **Visual explanation**: Show formula preview (e.g., "Final Price = Carrier Price × 1.15" or "Final Price = Carrier Price + 10.00 PLN").

#### 3.2.2 Commission Rules (CL02)

- **PLN** can only be used for the **Local** stage.
- **EUR** can be used for all 4 stages.
- Percentage markup is currency-agnostic (no currency field shown).
- Enforce these rules in frontend validation.

### 3.3 Lead Conversion Tracking Enhancement

#### 3.3.1 Backend-Driven Conversion

- The backend now sets `converted: true` when a shipment is created with an `estimateId`.
- The `AdminShipment` type has an `estimateId` field linking back to the estimate.
- Update admin types to include `estimateId` on `AdminShipment`.

#### 3.3.2 UI Updates

- In the Leads table: The `ConversionBadge` should rely on the backend `converted` flag (now accurate).
- Remove or reduce reliance on the client-side heuristic correlation since `estimateId` provides a definitive link.
- In `EstimateDetailSheet`: If `converted` is true, show the linked shipment's tracking number and details.

### 3.4 Enhanced Deletion Operations

#### 3.4.1 Force Delete

- **Users**: `POST /api/admin/users/:id/cascade` for force delete (removes all linked data).
- **Shipments**: `DELETE /api/admin/shipments/:id?force=true` to bypass terminal status checks.
- Add a "Force Delete" option with an extra warning in the `ConfirmDialog`.

#### 3.4.2 Bulk Delete

- **Users**: `POST /api/admin/users/bulk-delete` with `{ ids: [], force: boolean }`.
- **Shipments**: `POST /api/admin/shipments/bulk-delete` with `{ ids: [], force: boolean }`.
- **Leads**: `POST /api/admin/leads/bulk-delete` with `{ ids: [] }`.
- Add checkbox selection to table rows and a "Delete Selected" action bar.

---

## 4. Data Structures

### Carrier

```typescript
interface Carrier {
  id: string;
  name: string;
  baseUrl?: string;
  apiKey?: string; // Masked in GET responses
  apiSecret?: string; // Masked in GET responses
  isActive: boolean;
  localCommission: Commission;
  exportCommission: Commission;
  importCommission: Commission;
  internationalCommission: Commission;
  createdAt: string;
  updatedAt: string;
}
```

### Commission

```typescript
interface Commission {
  type: "PERCENT" | "FIXED";
  value: number;
  currency?: "PLN" | "EUR"; // Only relevant for FIXED type
}
```

### Commission Update Payload

```typescript
interface CommissionUpdatePayload {
  local: Commission;
  export: Commission;
  import: Commission;
  international: Commission;
}
```

---

## 5. API Endpoints Summary

| Feature               | Method | Endpoint                              | Notes                    |
| --------------------- | ------ | ------------------------------------- | ------------------------ |
| List Carriers         | GET    | `/api/admin/carriers`                 | API keys masked          |
| Create Carrier        | POST   | `/api/admin/carriers`                 |                          |
| Update Carrier        | PUT    | `/api/admin/carriers/:id`             | Partial updates          |
| Delete Carrier        | DELETE | `/api/admin/carriers/:id`             | Blocked if has shipments |
| Update Commissions    | PUT    | `/api/admin/carriers/:id/commissions` | 4-stage payload          |
| Force Delete User     | POST   | `/api/admin/users/:id/cascade`        | Cascades all data        |
| Bulk Delete Users     | POST   | `/api/admin/users/bulk-delete`        | `{ ids, force }`         |
| Bulk Delete Shipments | POST   | `/api/admin/shipments/bulk-delete`    | `{ ids, force }`         |
| Bulk Delete Leads     | POST   | `/api/admin/leads/bulk-delete`        | `{ ids }`                |

---

## 6. Design Requirements

- **Flat, minimalist** — consistent with the existing admin aesthetic.
- **No gradients** — use CSS variables from `global.css` only.
- **High contrast** — readable at all times.
- Carrier management page follows the same table + detail sheet pattern as Users, Shipments, and Leads.
- Commission editor uses clear visual separation between the 4 stages.

---

## 7. Out of Scope

- Carrier API key encryption/decryption (handled by backend).
- Real-time currency conversion preview (handled by backend's `CurrencyService`).
- Carrier-specific rate fetching/testing from the admin panel.
