# MLS Admin Ecosystem: Comprehensive Specification (PRD)

## 1. Executive Summary

The MLS Admin Ecosystem is the central nervous system of the Momentum Logistics Service. It empowers administrators with full visibility, control over user behavior, shipment lifecycle management, and strategic marketing tools. This document outlines the current feature set and the vision for the future pipeline.

## 2. Target Audience

- **Super Administrators**: Root access, security managers.
- **Staff (Support/Ops)**: Daily shipment and user management.
- **Marketing/Leads Team**: Retargeting and conversion optimization.
- **Developers**: System health and integration monitoring.

---

## 3. Current Implementation (Phase 1: Foundation)

### 3.1. Authentication & RBAC

- **Role-Based Access Control**: Granular permission keys (e.g., `user:write`, `shipment:read`).
- **Super Admin Security**: Daily automated password rotation via `scripts/super-admin-rotator.ts`.
- **Developer Mode**: Secure toggle for raw database/Prisma Studio access.

### 3.2. User Management & Moderation

- **3-Tier Moderation**: Ability to Flag, Warn, or Ban (Partial/Full) users.
- **Manual Recovery**: Overriding automated verification statuses for support cases.
- **Audit Logging**: Every administrative action is logged with IP tracking for compliance.

### 3.3. Shipment Lifecycle Management

- **Proxy Creation**: Creating deliveries on behalf of customers.
- **Financial Bypass**: Manually marking shipments as "PAID" for external wire transfers.
- **Sync Guards**: Manually overriding carrier statuses and disabling automated tracking sync when necessary.

### 3.4. Marketing Intelligence

- **Estimate Persistence**: Capturing every quote generated (Guest/User) as a potential lead.
- **Lead Dashboard**: Filtering abandoned estimates for retargeting campaigns.

---

## 4. Pipeline Roadmap (Phase 2 & 3: Intelligence & Scale)

### 4.1. Advanced AI & Predictive Operations [PIPELINE]

- **Predictive Latency Alerts**: AI-driven alerts for potential delays based on carrier historical performance and weather data.
- **Route Optimization AI**: Recommending carriers not just by price, but by "Reliability Score" for specific routes.
- **Demand Forecasting**: Predictive dashboard for monthly shipment volumes to aid in carrier contract negotiations.

### 4.2. Financial & Sustainable Logistics [PIPELINE]

- **Green Logistics Module**: Carbon footprint tracking for every shipment. Labeling carriers/routes as "Eco-Friendly."
- **Automated Invoicing**: Generating and emailing professional PDF invoices/receipts upon payment bypass or standard completion.
- **Cost-to-Serve Analysis**: Financial dashboard identifying high-maintenance users vs. high-margin routes.

### 4.3. Transparency & Trust (Web3 Integration) [PIPELINE]

- **Immutable Audit Logs**: Migrating critical audit logs to a private blockchain or Merkle-tree based storage to ensure absolute data integrity.
- **Digital Proof of Delivery (dPoD)**: Support for digital signatures and photo evidence stored as encrypted assets.

### 4.4. Operational Efficiency [PIPELINE]

- **Bulk Operations**: CSV/Excel import for thousands of proxy shipments. Bulk status updates for mass-delay events.
- **Integrated Support Helpdesk**: A "Live Chat" bridge between admins and logged-in users directly within the panel.
- **Multi-Factor Authentication (MFA)**: Mandatory TOTP/Email MFA for all admin accounts.

---

## 5. Non-Functional Requirements

- **Performance**: Any dashboard stat query must resolve in <300ms (via materialized views or caching).
- **Scalability**: Architecture must support 100+ concurrent staff members and 1M+ monthly estimates.
- **Security**: Regular automated audits of permissions and role assignments.

## 6. Definition of Done for Future Features

1.  Full Zod validation for new schemas.
2.  OpenAPI documentation updated in `admin.openapi.json`.
3.  Audit Log integration for the new feature.
4.  Verification via `scripts/test-[feature].ts`.
