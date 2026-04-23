# Commission Thresholds, PayU Gateway & Activity Tracking

## Overview

This document covers three feature areas implemented in v3.3.0:

1. **Minimum Commission Thresholds** — Guarantee minimum profit on low-value shipments
2. **PayU Payment Gateway** — Polish payment gateway alongside Stripe
3. **Admin/Staff Profile & Activity Tracking** — Self-service profile management and audit logging

---

## 1. Minimum Commission Thresholds (CM01)

### Business Logic

When a carrier's base rate falls **at or below** a configured PLN/EUR threshold, the system applies a **flat minimum commission** instead of the standard percentage markup.

**Example:**

- Threshold: 300 PLN
- Flat Commission: 50 PLN
- Base rate 250 PLN → Final price = 250 + 50 = 300 PLN (flat commission applied)
- Base rate 400 PLN → Final price = 400 × 1.10 = 440 PLN (standard 10% applied)

### Database Fields (on `Carrier` model)

| Field                  | Type   | Default | Description                                 |
| ---------------------- | ------ | ------- | ------------------------------------------- |
| `minRateThresholdPln`  | Float? | 300     | Base rate threshold in PLN                  |
| `minFlatCommissionPln` | Float? | 50      | Flat commission for rates ≤ threshold (PLN) |
| `minRateThresholdEur`  | Float? | null    | EUR equivalent threshold                    |
| `minFlatCommissionEur` | Float? | null    | EUR equivalent flat commission              |

### API Endpoints

- `GET /api/admin/settings/commission/:carrierId` — Retrieve thresholds
- `PUT /api/admin/settings/commission/:carrierId` — Update thresholds

### Pricing Logic

The `PricingService.calculateActualPrice()` method now:

1. Checks the rate currency (PLN or EUR)
2. Selects the appropriate threshold and flat commission
3. If `carrierPrice <= threshold` → applies flat commission
4. Otherwise → applies standard stage-based commission (Local/Export/Import/International)

---

## 2. PayU Payment Gateway (PA01)

### Architecture

```
Client → POST /shipments/create-shipment
  { ..., preferredPaymentOption: "payu" }
    ↓
ShipmentController → branches by gateway
    ↓
PayuAdapter.createOrder() → PayU REST API v2.1
    ↓
Returns { checkoutUrl, paymentGateway: "payu" }
```

### PayU Adapter (`src/adapters/payu.adapter.ts`)

| Method                     | Description                                                 |
| -------------------------- | ----------------------------------------------------------- |
| `isConfigured()`           | Checks if PayU env vars are set                             |
| `createOrder()`            | Creates a PayU payment order, returns orderId + redirectUri |
| `getOrder()`               | Retrieves order details by orderId                          |
| `verifyWebhookSignature()` | Verifies OpenPayu-Signature header (MD5/SHA-256)            |

### Environment Variables

| Variable               | Required | Description                                  |
| ---------------------- | -------- | -------------------------------------------- |
| `PAYU_CLIENT_ID`       | Optional | PayU OAuth client ID                         |
| `PAYU_CLIENT_SECRET`   | Optional | PayU OAuth client secret                     |
| `PAYU_MERCHANT_POS_ID` | Optional | PayU merchant POS ID                         |
| `PAYU_NOTIFY_URL`      | Optional | Webhook notification URL                     |
| `PAYU_CONTINUE_URL`    | Optional | Post-payment redirect URL                    |
| `PAYU_ENV`             | Optional | `sandbox` or `production` (default: sandbox) |

### Payment Flow

1. **Checkout**: Client sends `preferredPaymentOption: "payu"` in `createShipment`
2. **Order Creation**: Server creates PayU order via REST API
3. **Redirect**: Client redirects user to PayU checkout page
4. **Webhook**: PayU sends status notification to `POST /payments/payu-webhook`
5. **Verification**: Client calls `GET /payments/verify-payment?gateway=payu&order_id=...`

### Database Changes

- `Payment.paymentGateway`: `STRIPE` (default) or `PAYU`
- `Payment.payuOrderId`: PayU order ID (nullable, unique)
- `Payment.stripeSessionId`: Now nullable (not used for PayU payments)

---

## 3. Profile Management & Activity Tracking

### Self-Service Endpoints

| Endpoint                       | Method | Description            |
| ------------------------------ | ------ | ---------------------- |
| `/api/admin/staff/me/profile`  | GET    | View own admin profile |
| `/api/admin/staff/me/password` | PUT    | Change own password    |
| `/api/admin/staff/me/activity` | GET    | View own activity logs |

#### Change Password Payload

```json
{
  "oldPassword": "current-password",
  "newPassword": "new-password-min-8-chars"
}
```

> **Note:** Email changes are explicitly blocked. Only password updates are allowed.

### Activity Tracking

The `activity.middleware.ts` now tracks:

| Activity Type    | What's Logged                      | Examples                                     |
| ---------------- | ---------------------------------- | -------------------------------------------- |
| Write Operations | All POST/PUT/PATCH/DELETE requests | Creating shipments, updating users           |
| Specific Reads   | Viewing individual resources       | `GET /admin/users/:id`, `GET /shipments/:id` |
| Last Active      | Timestamp on every request         | Auto-updated on User/Admin record            |

**Excluded from logging** (noisy routes):

- Dashboard stats/trends
- Staff/role list endpoints
- Carrier list
- Email template list
- Auth "me" endpoints
- Shipment history/stats

### Activity Logs API

| Endpoint                           | Role               | Description                    |
| ---------------------------------- | ------------------ | ------------------------------ |
| `GET /api/admin/activity-logs`     | Admin (staff:read) | All logs with optional filters |
| `GET /api/admin/staff/me/activity` | Any staff          | Own logs only                  |

#### Query Parameters (admin endpoint)

| Param       | Type   | Description                                  |
| ----------- | ------ | -------------------------------------------- |
| `page`      | number | Page number (default: 1)                     |
| `limit`     | number | Items per page (default: 20, max: 100)       |
| `adminId`   | string | Filter by admin ID                           |
| `userId`    | string | Filter by user ID                            |
| `actorType` | string | Filter by actor type (`ADMIN` or `USER`)     |
| `action`    | string | Search by action (case-insensitive contains) |

### AuditLog Schema Changes

| Field       | Change       | Description                             |
| ----------- | ------------ | --------------------------------------- |
| `adminId`   | Now nullable | Can be null for user-level logs         |
| `userId`    | New field    | Optional user ID for user-level logging |
| `actorType` | New field    | `ADMIN` or `USER` (default: `ADMIN`)    |

---

## Migration

After pulling these changes, run:

```bash
# Generate Prisma client
bunx prisma generate

# Create and apply migration
bunx prisma migrate dev --name commission-payu-activity

# For staging/production
bunx prisma migrate deploy
```

Add the following to your `.env` (if using PayU):

```env
PAYU_CLIENT_ID=your-client-id
PAYU_CLIENT_SECRET=your-client-secret
PAYU_MERCHANT_POS_ID=your-pos-id
PAYU_NOTIFY_URL=https://your-domain.com/api/payments/payu-webhook
PAYU_CONTINUE_URL=https://your-domain.com/app/shipments/new/verify
PAYU_ENV=sandbox
```
