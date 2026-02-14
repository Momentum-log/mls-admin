# Admin Marketing Leads Guide

This guide details how to access and manage marketing leads derived from shipping estimates. Every time a user (guest or authenticated) generates a rate estimate, it is saved as a `ShippingEstimate`.

## Base Endpoint

`/api/admin/leads`

## 1. List Leads

Retrieve a paginated list of shipping estimates.

### Endpoint

`GET /api/admin/leads`

### Query Parameters

| Parameter   | Type    | Description                                                        |
| :---------- | :------ | :----------------------------------------------------------------- |
| `page`      | number  | Page number (default: 1)                                           |
| `limit`     | number  | Items per page (default: 20)                                       |
| `converted` | boolean | `true`: estimates that became shipments. `false`: abandoned carts. |
| `isGuest`   | boolean | `true`: guest users. `false`: registered users.                    |

### Response Structure

```json
{
  "data": [
    {
      "id": "uuid",
      "user": {
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890"
      },
      "pickupLocation": { "city": "Warsaw", "countryCode": "PL" },
      "dropoffLocation": { "city": "Berlin", "countryCode": "DE" },
      "weight": { "value": 5, "units": "KG" },
      "actualPrice": 120.5,
      "createdAt": "2024-01-01T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 20
  }
}
```

### Implementation Notes

- **Guest Leads**: Guest estimates may have `email` and `phone` stored directly on the `ShippingEstimate` record (if captured), whereas registered users will have their contact info in the `user` relation.
- **Conversion Tracking**: A lead is considered "converted" if the `converted` boolean is true. This happens automatically when a shipment is created from an estimate.
- **Retargeting**: Use this list to export emails for retargeting campaigns (e.g., "Complete your shipment to Berlin!").
