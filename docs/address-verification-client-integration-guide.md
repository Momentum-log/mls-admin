# Address Verification Client Integration Guide

## Overview

This guide explains how client applications should integrate the address verification flow required for shipment creation.

## Business Rules

1. A user must have an approved active address before creating shipments.
2. Address updates require admin review.
3. User uploads exactly one proof file per request.
4. Supported proof formats: PDF, PNG, JPG.
5. Max proof size: 10MB.
6. If request submission fails, backend deletes uploaded proof automatically.
7. On admin approval or rejection, backend deletes the proof file from S3.

## User Flow (Client)

### Step 1: User submits address update request

Endpoint:

`POST /api/auth/address/update-request`

Headers:

- `Authorization: Bearer <access_token>`
- `Content-Type: application/json`

Request body:

```json
{
  "address": {
    "street": "Marszalkowska 12",
    "city": "Warsaw",
    "postalCode": "00-001",
    "country": "PL"
  },
  "proofFile": {
    "fileName": "utility-bill-april.pdf",
    "mimeType": "application/pdf",
    "base64Content": "<BASE64_FILE_CONTENT>",
    "size": 834122
  }
}
```

Success response:

```json
{
  "status": "success",
  "message": "Address update request submitted for admin review",
  "request": {
    "id": "...",
    "status": "PENDING",
    "createdAt": "2026-04-20T15:09:15.522Z",
    "newAddress": {
      "street": "Marszalkowska 12",
      "city": "Warsaw",
      "postalCode": "00-001",
      "country": "PL"
    }
  }
}
```

### Step 2: User checks address status

Endpoint:

`GET /api/auth/address/status`

Use this endpoint to render:

- Active address currently used by shipments.
- Latest request status (`PENDING`, `APPROVED`, `REJECTED`).
- Rejection feedback when available.

### Step 3: User checks request history (optional)

Endpoint:

`GET /api/auth/address/requests?page=1&limit=20`

Use this for history views and timeline UI.

## Admin Flow (Client/Admin App)

### List requests

`GET /api/admin/address-requests?status=PENDING&page=1&limit=20`

### Request details

`GET /api/admin/address-requests/:requestId`

### Preview proof file

`GET /api/admin/address-requests/:requestId/proof-file`

This endpoint streams inline content for PDF/image preview.

### Approve request

`POST /api/admin/address-requests/:requestId/approve`

Result:

- User address is updated.
- `addressVerifiedAt` is set.
- Proof file is deleted from S3.
- User receives approval email.

### Reject request

`POST /api/admin/address-requests/:requestId/reject`

Request body:

```json
{
  "feedback": "Proof document does not clearly show the full address."
}
```

Result:

- User keeps existing active address.
- Proof file is deleted from S3.
- User receives rejection email with feedback.

## Shipment Guard Behavior

Endpoint affected:

`POST /api/shipments/create-shipment`

If user has no approved active address, backend returns:

```json
{
  "error": "ADDRESS_REQUIRED",
  "code": 400,
  "details": "An approved address is required to create shipments."
}
```

Client behavior recommendation:

1. Detect `error === "ADDRESS_REQUIRED"`.
2. Redirect user to address verification screen.
3. Show clear CTA to submit address + proof.

## Frontend Validation Checklist

Validate before submitting:

1. `country` must be ISO alpha-2 uppercase code.
2. File type must be one of:
   - `application/pdf`
   - `image/png`
   - `image/jpeg`
3. File size must be `<= 10MB`.
4. Exactly one file per request.

## Error Handling Recommendations

1. If submission returns validation error, show field-level messages.
2. If upload request fails, allow retry with same form state.
3. Poll `GET /api/auth/address/status` or refresh status after submission.
4. For `REJECTED`, display admin feedback and allow re-submission.

## Email Events

The backend sends notifications automatically:

1. User: request submitted.
2. Admin: new request requires review.
3. User: request approved.
4. User: request rejected with admin feedback.
