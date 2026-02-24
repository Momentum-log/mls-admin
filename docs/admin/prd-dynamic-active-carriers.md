# Product Requirements Document: Dynamic Active Carriers

## 1. Introduction / Overview

Currently, the MLS backend relies on a static `.env` variable (`ACTIVE_CARRIERS`) to know which shipping providers (e.g., FedEx) to fetch rates from during the shipping estimate process. This creates a hard dependency on developer intervention for turning carriers on or off, and it is highly prone to typos because it relies on mathematical casing.

The goal of this feature is to migrate the "active" status and adapter routing logic entirely to the PostgreSQL database. This allows administrators to dynamically toggle carriers on/off directly from the dashboard and explicitly map them to hardcoded adapter keys (`slug`), eliminating human error and the need for server restarts.

## 2. Goals

- Eliminate the use of the `ACTIVE_CARRIERS` environment variable.
- Introduce an `isActive` boolean and a programmable `slug` to the `Carrier` database schema.
- Update the `getShippingEstimate` endpoint to fetch available carriers from the database instead of the environment context.
- Ensure the system throws a clear 400 error if a user requests an estimate but no carriers are currently active in the database.

## 3. User Stories

- As an administrator, I want to toggle a carrier on or off in the database without needing a developer to edit `.env` variables or restart the server.
- As an administrator, I want to select a predefined programmatic `slug` (e.g., `fedex`) when creating a carrier so I don't accidentally break the integration with a typo in the display name.
- As a client requesting a shipping estimate, if the admin has turned off all carriers, I want to receive a clear error indicating that no shipping methods are available right now.

## 4. Features / Tasks

**Database Schema Updates**

- DB01: Modify `schema.prisma` `Carrier` model.
- DB02: Add `isActive` boolean field (default to `true`).
- DB03: Add `slug` string field (must be unique). This represents the exact adapter name (e.g., `fedex`, `dhl`).
- DB04: Run `npx prisma migrate dev --name add_carrier_slug_and_active_status`.

**Shipping Estimate Controller (Backend)**

- SE01: Refactor `getShippingEstimate` in `src/controllers/shipment.controller.ts`.
- SE02: Query the database for `prisma.carrier.findMany({ where: { isActive: true } })`.
- SE03: If the active carriers list is empty, return a `400` error with message `"No shipping methods are currently available."`
- SE04: Loop through the active carriers array. Use a `switch` statement on the `carrier.slug` to determine which adapter to call (e.g., `case 'fedex': fedexAdapter.getRates()`).
- SE05: Map `slug` to the displayed `name` dynamically in the combined rates response.

**Carrier Management Controller (Admin API)**

- CA01: Update POST and PUT carrier routes (`src/controllers/carriers.controller.ts`) to accept/validate the new `slug` and `isActive` fields inside the Zod schemas.
- CA02: Prevent admins from setting a `slug` that does not have a corresponding backend adapter string (must validate against an enum of `["fedex"]` initially).

**Environment Cleanup**

- EN01: Remove `ACTIVE_CARRIERS` from `src/config/env.ts`.
- EN02: Remove `ACTIVE_CARRIERS` from `.env.example`, `.env`, and documentation setups.

## 5. Non-Goals (Out of Scope)

- No automated database migration or seeding scripts will be written to map the old data; the admin is responsible for manually reconfiguring the carrier in the dashboard after deployment.
- No frontend updates to the React/Next UI are included in this PRD (only API route preparations are included).
- Implementation of new shipping adapters (e.g., DHL, UPS) is not part of this scope.

## 6. Technical Considerations

- **Important Regression Note**: `src/services/pricing.service.ts` currently looks up commissions by `name`. You should refactor this to look up by `slug` or `id` instead to ensure absolute reliability regardless of what the admin types in the display name field.
- **Downtime Notice**: Because old carriers in the DB will NOT have a `slug` initially, the admin must go in immediately post-deployment, delete the old FedEx record, and recreate it with the correct `slug` assignment, or manually patch the DB record. You MUST clearly note this in the Changelog/Setup Instructions.

## 7. Success Metrics

- 100% of estimate rate requests verify active carrier routing exclusively via the `Carrier` database table.
- Deletion of the `ACTIVE_CARRIERS` environment variable without breaking the estimate generation process.

## 8. Open Questions

- Should we write a small database script (`npm run sync-carriers`) to retroactively map existing carriers in production to the new schema just in case, or do we stick strictly to the manual admin update approach as outlined?
