# PRD: Admin User Management - User-Specific Resources (v10.2)

## 1. Introduction / Overview

This document outlines the requirements for adding new administrative capabilities to view and manage shipments and shipping estimates (leads) belonging to specific users. While admins can currently view users and perform some actions, they lack a dedicated way to drill down into a specific user's activity history (shipments and estimates) with full filtering and pagination.

The goal is to provide two new resources accessible via filtered list endpoints that allow admins to audit, support, and convert user activities more efficiently.

## 2. Goals

- Provide a dedicated view of a specific user's shipments.
- Provide a dedicated view of a specific user's shipping estimates (leads).
- Support full parity with main lists (pagination, status filtering, date ranges).
- Implement strict RBAC requiring both user-level and resource-level access.
- Return expanded data sets for improved administrative visibility.

## 3. User Stories

- **As an Admin**, I want to see all shipments for a specific user so I can investigate their shipping history or resolve issues.
- **As an Admin**, I want to see all shipping estimates for a specific user so I can follow up on potential leads and offer support for conversions.
- **As a Support Agent**, I want to filter these lists by status or date so I can find specific records quickly.

## 4. Features / Tasks

### Shipment Management (AS)

- **AS06: Implement Shipment Listing Endpoint**
  - Create `GET /api/admin/shipments` in `AdminShipmentController`.
  - Support query parameters: `page`, `limit`, `search` (tracking number, user name/email), `status`, `userId`, `startDate`, and `endDate`.
- **AS07: Expanded Shipment Response**
  - Ensure the list returns expanded details: full pickup/dropoff addresses, `user` summary, and basic tracking status if available.

### Lead Management (AL)

- **AL02: Update Lead Listing Endpoint**
  - Update `listLeads` in `AdminLeadController` to support a `userId` filter.
  - Support query parameters: `page`, `limit`, `search`, `converted`, `userId`, `startDate`, and `endDate`.
- **AL03: Expanded Lead Response**
  - Include full estimate payload details (pickup/dropoff summary) in the list response.

### Routing & Security (RT)

- **RT04: Register Shipment List Route**
  - Register `GET /api/admin/shipments` in `admin.routes.ts`.
  - Apply strict RBAC: Require BOTH `user:read` and `shipment:read` permissions.
- **RT05: Register/Update Estimate List Route**
  - Register `GET /api/admin/estimates` (or update `/leads`) in `admin.routes.ts`.
  - Apply strict RBAC: Require BOTH `user:read` and `shipment:read` permissions.

### Documentation (DH)

- **DH06: Update Admin API Specifications**
  - Add `GET /api/admin/shipments` and updated `/leads` to `admin.openapi.json`.
- **DH07: Update User Management Guide**
  - Add details on how to use these filtered lists to view user-specific data.

## 5. Non-Goals (Out of Scope)

- No modifications to the public user API (only admin endpoints).
- No frontend UI implementation in this PRD (API only).
- No batch operations on shipments/leads from these lists for now.

## 6. Design Considerations

- The response format should be consistent with the existing `listUsers` and `listTemplates` patterns (data array + pagination object).
- Dates should be handled as ISO strings in query parameters.

## 7. Technical Considerations

- Use Prisma's `where` clause to dynamically build the query based on provided filters.
- Enforce strict permission chaining in the route registration using the `requirePermission` middleware.
- Ensure efficient querying by indexing `userId` and `createdAt` in the database if not already done (Prisma schema check).

## 8. Success Metrics

- Reduced time for admins to locate a specific user's shipments/estimates.
- Successful audit of 100% of user-specific lookups via existing `AuditLog` integration.

## 9. Open Questions

- Should `estimates` and `leads` remain separate routes or use a single `/estimates` endpoint? (Decided: Update existing `/leads` logic or alias it).
- Is `shipment:read` the correct secondary permission for estimates? (Decided: Yes, as they are pre-shipment records).
