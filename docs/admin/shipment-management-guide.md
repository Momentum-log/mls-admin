# Admin Shipment Management Guide

This guide details the administrative capabilities for managing shipments, including listing, detailed auditing, creating shipments on behalf of users, and status/payment overrides.

## Base Endpoint

`/api/admin/shipments`

## 1. List Shipments

Admins can view all shipments in the system with full filtering and pagination.

### Endpoint

`GET /api/admin/shipments`

### Query Parameters

| Parameter   | Type   | Description                                                 |
| :---------- | :----- | :---------------------------------------------------------- |
| `page`      | number | Page number (default: 1)                                    |
| `limit`     | number | Items per page (default: 20)                                |
| `search`    | string | Search by tracking number, user name, email, or userCode    |
| `status`    | string | Filter by shipment status (CREATED, PAID, IN_TRANSIT, etc.) |
| `userId`    | string | Filter by user UUID                                         |
| `startDate` | string | ISO date string - filter shipments created after this date  |
| `endDate`   | string | ISO date string - filter shipments created before this date |

### Success Response

Returns a paginated list of shipments with expanded user summary and carrier information.

---

## 2. Get Shipment Details

Retrieve the complete history and current state of a specific shipment.

### Endpoint

`GET /api/admin/shipments/:id`

### Response Structure

Includes:

- **Shipment Core**: All addresses, price details, and status.
- **User**: Detailed summary of the sender.
- **Payments**: All payment attempts (Stripe or Manual) associated with this shipment.
- **Audit Logs**: The most recent 20 administrative actions taken on this specific shipment.

---

## 3. Proxy Shipment Creation

Admins can create a shipment for a specific user. This is useful for phone orders or assisting users with difficulties.

### Endpoint

`POST /api/admin/shipments/proxy`

### Payload

The payload is identical to the standard shipment creation payload, with one additional required field: `targetUserId`.

```json
{
  "targetUserId": "uuid-of-user",
  "carrierName": "FedEx",
  "pickupAddress": { ... },
  "dropoffAddress": { ... },
  "package": {
    "weight": { "value": 10, "units": "KG" },
    "dimensions": { "length": 10, "width": 10, "height": 10, "units": "CM" }
  },
  "rate": {
    "serviceType": "INTERNATIONAL_PRIORITY",
    "serviceName": "FedEx International Priority",
    "carrierPrice": 100.00
  }
}
```

### Response

Returns the `shipment` object including `id` and `customTrackingNumber`.

---

## 4. Payment Bypass (Manual Payment)

If a user pays via bank transfer, cash, or an external method, an admin can manually mark the shipment as paid.

### Endpoint

`POST /api/admin/shipments/:id/bypass-payment`

### Payload

```json
{
  "manualTransactionId": "BANK-TRANSFER-REF-123",
  "notes": "Paid via wire transfer on 2024-01-01"
}
```

### Logic

1.  **Status Update**: Sets `paymentStatus` to `PAID` on the shipment.
2.  **Record Creation**: Creates a `Payment` record with `isManual: true` and `status: PAID`.
3.  **Deduplication**: `manualTransactionId` is stored for reference.

---

## 5. Manual Status Override

Admins can force a shipment into **any** valid lifecycle status (e.g., `CANCELLED`, `DELIVERED`, `IN_TRANSIT`), bypassing automated carrier tracking updates.

### Endpoint

`PUT /api/admin/shipments/:id/manual-status`

### Payload

```json
{
  "status": "CANCELLED",
  "manualOverride": true,
  "trackingSyncEnabled": false,
  "notify": true
}
```

### Parameters

- **`status`**: Any valid `ShipmentStatus` (CREATED, PAID, CANCELLED, etc.).
- **`manualOverride`**: (Default: true) Marks the shipment as manually adjusted.
- **`trackingSyncEnabled`**: (Default: false) If false, the system **IGNORES** carrier updates for this shipment.
- **`notify`**: (Default: true) If true, the system sends an email notification to the user about the status change.

### Behavior

1. Updates the shipment status in the database.
2. If `notify` is true:
   - For `COMPLETED`, sends the "Shipment Delivered" email.
   - For all other statuses (e.g., `CANCELLED`), sends a "Shipment Status Update" email with the new status name.
3. Logs the action in the audit log including whether the user was notified.

---

## 6. Complete Shipment

Once a shipment is successfully delivered and all administrative checks are passed, it can be formally completed. This is a convenience action that performs a manual status override to `COMPLETED` with notification enabled.

### Endpoint

`POST /api/admin/shipments/:id/complete`

### Behavior

1.  Sets `shipmentStatus` to `COMPLETED`.
2.  **Notification**: Automatically sends a "Shipment Completed" email to the recipient's linked user account.
3.  **Sync Disable**: Automatically disables carrier sync as the shipment is finished.
4.  **Audit**: Logs the completion action with the performing admin's details.
