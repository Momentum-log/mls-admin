# Admin User Management Guide

This guide details the implementation of user management features for the MLS Admin Panel. It covers listing users, moderation actions (banning/flagging), manual verification, and profile updates.

## Base Endpoint

`/api/admin/users`

## 1. List Users

The user list is the central hub for user management. It supports pagination and filtering.

### Endpoint

`GET /api/admin/users`

### Query Parameters

| Parameter | Type   | Description                                               |
| :-------- | :----- | :-------------------------------------------------------- |
| `page`    | number | Page number (default: 1)                                  |
| `limit`   | number | Items per page (default: 10)                              |
| `search`  | string | Search by name, email, or userCode (case-insensitive)     |
| `status`  | string | Filter by status: `ACTIVE`, `FLAGGED`, `WARNED`, `BANNED` |

### Response Structure

```json
{
  "users": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "userCode": "MLS-U-12345",
      "status": "ACTIVE",
      "banType": "NONE",
      "is_verified": true,
      "is_phone_verified": false,
      "lastActive": "2024-06-15T10:30:00.000Z",
      "lastLogin": "2024-06-14T08:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

### Implementation Rules

- **Debounce Search**: Debounce the search input on the frontend by at least 300ms to avoid excessive API calls.
- **Status Badges**: Use distinct colors for statuses (Active: Green, Flagged: Yellow, Banned: Red).

## 2. User Moderation (Status Update)

Admins can change a user's status to control their access to the platform.

### Endpoint

`PUT /api/admin/users/:id/status`

### Payload

```json
{
  "status": "BANNED",
  "banType": "FULL"
}
```

### Status & Ban Types

- **ACTIVE**: Normal user behavior.
- **FLAGGED**: User is marked for review but has full access.
- **WARNED**: User has received a warning.
- **BANNED**: User access is restricted based on `banType`.
  - `NONE`: N/A (for non-banned statuses)
  - `PARTIAL`: User can login but cannot create new shipments or make payments.
  - `FULL`: User cannot login at all.

### Implementation Rules

- **Confirmation Modal**: Always require confirmation before banning a user.
- **Ban Type Selection**: If status is `BANNED`, show a secondary dropdown to select `FULL` or `PARTIAL` ban.

## 3. Manual Verification

In cases where automated verification fails (email/phone), an admin can manually verify a user.

### Endpoint

`POST /api/admin/users/:id/verify`

### Behavior

- Sets `is_verified` to `true`.
- Sets `is_phone_verified` to `true`.
- **Audit Log**: This action is logged in the `AuditLog` table.
- **Idempotent**: Can be called multiple times without error.

## 4. User Profile Update

Admins can edit a user's profile details on their behalf.

### Endpoint

`PUT /api/admin/users/:id/profile`

### Payload

```json
{
  "name": "Jane Doe",
  "phone": "+48123456789",
  "address": { ... }
}
```

### Implementation Rules

- **Validation**: Ensure phone numbers follow the correct format before sending.
- **Audit**: All changes are logged.

## 5. Get User Details

Retrieve the full profile of a specific user, including related data counts and recent activity. Useful for the admin user detail view.

### Endpoint

`GET /api/admin/users/:identifier`

### Path Parameters

| Parameter    | Type   | Description                    |
| :----------- | :----- | :----------------------------- |
| `identifier` | string | User UUID (`id`) or `userCode` |

### Permission

`user:read`

### Response Structure

```json
{
  "user": {
    "id": "uuid",
    "userCode": "MLS-U-12345",
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "+48123456789",
    "address": { ... },
    "is_verified": true,
    "is_phone_verified": true,
    "status": "ACTIVE",
    "banType": "NONE",
    "lastActive": "2024-06-15T10:30:00.000Z",
    "lastLogin": "2024-06-14T08:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-06-15T10:30:00.000Z",
    "_count": {
      "shipments": 12,
      "estimates": 45,
      "activity": 230,
      "sessions": 5
    },
    "recentActivity": [
      {
        "id": "uuid",
        "action": "LOGIN",
        "ipAddress": "192.168.1.1",
        "userAgent": "Mozilla/5.0 ...",
        "timestamp": "2024-06-15T10:30:00.000Z"
      }
    ]
  }
}
```

### Implementation Notes

- **Identifier Detection**: The backend auto-detects whether the identifier is a UUID or `userCode`.
- **Audit Log**: Every lookup is logged as `USER_DETAILS_VIEW` in the audit log.
- **Sensitive Fields Excluded**: `password_hash`, verification codes, and expiry dates are never returned.
