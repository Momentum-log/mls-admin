# Commission Management Guide

## Overview

Momentum Logistics Service uses a 4-stage commission system to provide granular control over shipping markups. Commissions are configured per carrier and can be either a percentage of the carrier rate or a fixed flat fee.

## The 4 Shipping Stages

The system automatically determines the shipment stage based on the origin and destination countries:

1.  **Local**: Origin is Poland (PL) and Destination is Poland (PL).
2.  **Export**: Origin is Poland (PL) and Destination is outside Poland.
3.  **Import**: Origin is outside Poland and Destination is Poland (PL).
4.  **International**: Both Origin and Destination are outside Poland.

## Commission Types

For each stage, you can define:

- **PERCENT**: A percentage markup (e.g., `0.15` for 15%).
  - Formula: `Final Price = Carrier price * (1 + 0.15)`
- **FIXED**: A flat fee added to the rate.
  - Formula: `Final Price = Carrier Price + (Fixed Value converted to carrier currency)`
  - **Currency Rule (CL02)**:
    - `PLN`: Can ONLY be assigned to the **Local** (PL -> PL) stage.
    - `EUR`: Can be assigned to **Local, Export, Import, or International** stages.

## Managing Carriers & Commissions (Admin API)

### 1. List Carriers

**Endpoint**: `GET /api/admin/carriers`
**Access**: Admin Only (`carrier:read`)
**Description**: Returns all carriers. Sensitive fields (API Keys) are masked for security.

### 2. Update Commissions

**Endpoint**: `PUT /api/admin/carriers/{id}/commissions`
**Access**: Admin Only (`carrier:write`)
**Payload Example**:

```json
{
  "local": { "type": "FIXED", "value": 10.0, "currency": "PLN" },
  "export": { "type": "FIXED", "value": 15.0, "currency": "EUR" },
  "import": { "type": "PERCENT", "value": 0.15 },
  "international": { "type": "FIXED", "value": 50.0, "currency": "EUR" }
}
```

### 3. Create/Update Carrier Profile

**Endpoint**: `POST /api/admin/carriers` or `PUT /api/admin/carriers/{id}`
**Access**: Admin Only (`carrier:write`)
**Fields**: `name`, `apiKey`, `apiSecret`, `baseUrl`, `isActive`.

## Logic Verification

Pricing calculations are performed by the `PricingService`. If a `FIXED` commission currency (e.g. PLN) differs from the carrier's response currency (e.g. EUR), the system uses the `CurrencyService` to perform a real-time conversion of the commission value before adding it to the base rate.

## Security & RBAC

- Commission updates are strictly restricted to **Admin** users.
- The user must have the `carrier:write` permission in their role.
- Access is verified via the `requirePermission` middleware on the server.
