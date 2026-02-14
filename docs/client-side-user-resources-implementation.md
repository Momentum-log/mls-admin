# Client-Side Implementation Walkthrough: User Activity Resources (Admin v2.8.0)

This document provides a guide for frontend developers to integrate the new user-specific shipments and estimates (leads) endpoints into the Admin Panel.

## 1. Overview

We have introduced two powerful list endpoints that allow admins to drill down into a specific user's history. These should be integrated into the **User Details** view (likely as new tabs or sections).

- **API Endpoints**:
  - `GET /api/admin/shipments?userId={uuid}&page=1&limit=10`
  - `GET /api/admin/leads?userId={uuid}&page=1&limit=10`

## 2. Recommended UI Structure

### User Details Page

Add a tabbed interface or scrollable sections for "Activity History":

1. **Shipments Tab**: Displays a table of shipments filtered by the current user.
2. **Estimates Tab**: Displays a table of shipping estimates (leads) filtered by the current user.

## 3. Implementation Steps

### Step 1: Define API Service Methods

Create helper functions to fetch these resources. Ensure you handle the strict RBAC permissions (the backend requires both `user:read` and the resource permission).

```typescript
// services/adminUserActivity.ts

export const fetchUserShipments = async (userId: string, filters: any = {}) => {
  const query = new URLSearchParams({
    userId,
    page: filters.page || "1",
    limit: filters.limit || "10",
    ...(filters.status && { status: filters.status }),
    ...(filters.search && { search: filters.search }),
    ...(filters.startDate && { startDate: filters.startDate }),
    ...(filters.endDate && { endDate: filters.endDate }),
  });

  const response = await fetch(`/api/admin/shipments?${query}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
};

export const fetchUserLeads = async (userId: string, filters: any = {}) => {
  const query = new URLSearchParams({
    userId,
    page: filters.page || "1",
    limit: filters.limit || "10",
    ...(filters.search && { search: filters.search }),
  });

  const response = await fetch(`/api/admin/leads?${query}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
};
```

### Step 2: Create Filter Components

A consistent filter bar above each table is recommended:

- **Search (Text Input)**: Debounced search by tracking number/email.
- **Status (Dropdown)**: Map the backend `ShipmentStatus` enum to user-friendly labels.
- **Date Range (Date Pickers)**: Filter by `startDate` and `endDate`.

### Step 3: Implement the Shipment Table

Display expanded data returned by the server:

- **Tracking No.**: `customTrackingNumber` (linked to shipment detail view).
- **Service**: `${serviceName} (${serviceType})`
- **Customer**: User name/email from the `user` object.
- **Addresses**: Summary of `pickupAddress` and `dropoffAddress` (e.g., "Poznań, PL" -> "Warszawa, PL").
- **Status Badge**: Use color coding based on `shipmentStatus`.

### Step 4: Implement the Estimate Table

Focus on follow-up potential:

- **Created At**: Timestamp of the estimate.
- **Route**: Summary of pickup/dropoff from the payload.
- **Contact**: Display user details (id/userCode/email).
- **Conversion Status**: Show whether `converted` is `true` or `false`.

## 4. State Management Considerations

- **Loading State**: Show a skeleton or spinner during the fetch.
- **Empty State**: Add a clear "No shipments found for this user" message with a CTA (e.g., "Create Proxy Shipment").
- **Pagination**: Use standard pagination logic to handle the `pagination` object returned in the response (`total`, `totalPages`, `page`).

## 5. Security Check

Ensure that the user role requesting these endpoints has:

- `user:read`
- `shipment:read` (for shipments)
- `leads:read` (for estimates)

If a `403 Forbidden` error occurs, verify the role's permissions in the Role Management section of the admin panel.
