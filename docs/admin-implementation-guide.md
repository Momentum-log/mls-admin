# Admin Implementation Guide (Master Index)

This document serves as the central hub for all technical documentation related to the MLS Admin Panel.

## 📚 Core Documentation

- **[OpenAPI Specification](../docs/admin.openapi.json)**: Complete API reference for all `/api/admin` endpoints.
- **[Environment Setup & Super Admin](../docs/admin/environment-setup-guide.md)**: How to configure Super Admins for Local, Staging, and Production.

## 🛠 Feature Guides

Detailed implementation guides for specific admin modules:

- **[User Management](../docs/admin/user-management-guide.md)**
  - List users, filtering, and pagination.
  - Moderation: Banning, warning, and flagging users.
  - Manual verification flows.
  - Profile auditing and updates.

- **[Staff & Role Management](../docs/admin/staff-management-guide.md)**
  - Creating and managing staff accounts.
  - **[Role Hierarchy & Permissions](../docs/admin/role-management-guide.md)**: Understanding RBAC, Super Admin privileges, and permission keys.

- **[Shipment Management](../docs/admin/shipment-management-guide.md)**
  - **Proxy Creation**: Creating shipments on behalf of users.
  - **Payment Bypass**: Manually marking shipments as paid.
  - **Status Overrides**: Forcing status updates and managing tracking sync.

- **[Marketing Leads](../docs/admin/marketing-leads-guide.md)**
  - Accessing and filtering shipping estimates (leads).
  - Understanding the data structure for retargeting.

## 🔐 Authentication & Security

All admin endpoints (except login) require a **Bearer Token** in the authorization header.

```http
Authorization: Bearer <your_jwt_token>
```

### Developer Mode

The API supports a "Developer Mode" toggle `/api/admin/developer-mode` which can be used to expose raw database tools (like Prisma Studio) safely in the admin UI if implemented.

## 📧 Email System

Admins can manage email templates and send one-off emails via `/api/admin/emails`. See the **OpenAPI Spec** for payload details.
