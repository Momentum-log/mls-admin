# Admin Shipment Management Guide

This guide details the administrative capabilities for managing shipments, including creating shipments on behalf of users (Proxy), manually bypassing payments, and overriding shipment statuses.

## Base Endpoint

`/api/admin/shipments`

## 1. Proxy Shipment Creation

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

### Use Case

After creating a proxy shipment, the shipment will appear in the user's dashboard with `paymentStatus: PENDING`. The admin can then direct the user to pay, or use the **Payment Bypass** feature below.

## 2. Payment Bypass (Manual Payment)

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

## 3. Manual Status Override

Admins can force a shipment into a specific status, bypassing the automated carrier tracking updates.

### Endpoint

`PUT /api/admin/shipments/:id/manual-status`

### Payload

```json
{
  "status": "DELIVERED",
  "manualOverride": true,
  "trackingSyncEnabled": false // RECOMMENDATION: Set to false to prevent overwrite
}
```

### Tracking Sync Logic

- **`trackingSyncEnabled: true`**: The system will continue to poll the carrier (FedEx) and update the status based on their tracking events.
- **`trackingSyncEnabled: false`**: The system will **IGNORE** carrier updates for this shipment. The status will remain what you manually set it to until changed again.

### Use Case

- Correcting a status stuck in "IN_TRANSIT".
- Marking a shipment as "COMPLETED" manually if the carrier API fails to update.
