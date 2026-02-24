# Product Requirements Document: Dynamic Carrier Management (Admin Panel)

## 1. Introduction / Overview
The MLS system is migrating from a static environment-based carrier activation (`ACTIVE_CARRIERS`) to a dynamic, database-driven approach. This allows administrators to toggle carriers and map them to backend adapters (via `slugs`) without server restarts or code changes.

## 2. Goals
- Provide a UI for administrators to assign programmatic slugs to carriers.
- Display a global warning if no carriers are active to prevent silent failures in shipping estimates.
- Support a fixed set of carrier adapters initially: **FedEx**, **DHL**, and **InPost**.
- Ensure manual mapping of existing data is intuitive.

## 3. User Stories
- **As an admin**, I want to select a slug from a dropdown when configuring a carrier so that I don't make typos that break the integration.
- **As an admin**, I want to see a clear warning on my dashboard if I accidentally disable all shipping providers.
- **As an admin**, I want to toggle carriers on/off instantly via the "Active" switch.

## 4. Features / Tasks

### Carrier Configuration (FE01)
- **Slug Dropdown**: Add a mandatory dropdown in the [CarrierDetailSheet](file:///Users/adedotungabriel/work/me/mls/mls-admin/components/carriers/carrier-detail-sheet.tsx#43-296) with values: `fedex`, `dhl`, `inpost`.
- **Validation**: Ensure a slug is selected before allowing a carrier to be saved/created.
- **Type Sync**: Update the frontend [Carrier](file:///Users/adedotungabriel/work/me/mls/mls-admin/types/carriers.ts#20-39) interface to include the `slug` property.

### Global Monitoring (GM01)
- **Active Carrier Check**: Implement a logic to check if at least one carrier has `isActive: true` and a valid `slug`.
- **Dashboard Warning**: Display a prominent banner or badge on the Dashboard and Carriers page if zero carriers are operational.

### Carrier Management UI (CM01)
- **Table Extension**: Add a "Slug" column to the carriers table to quickly identify adapter mapping.
- **Status Indicator**: Enhance the "Status" badge to reflect both `isActive` and whether a slug is assigned.

## 5. Non-Goals
- Automatic migration of existing carrier strings to slugs (Admin will handle this manually).
- Dynamic creation of new adapter slugs from the UI (Requires backend code).

## 6. Technical Considerations
- The `slug` must match the backend's expected adapter key exactly.
- Existing carriers in the database might have a `null` slug initially; the UI must highlight these as "Configuration Required".

## 7. Success Metrics
- 100% of configured carriers have a valid slug assigned.
- Zero users encounter empty rates due to "Active" carriers having no assigned adapter slug.
