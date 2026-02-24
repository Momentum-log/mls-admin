# Code Cleanup Report - 2026-02-24 - Admin Dashboard Cleanup

- **Date:** 2026-02-24
- **Reviewer:** Antigravity (AI)
- **Topic:** Shared Admin Components & Redundant Logic
- **Detected Language(s) / Platform(s):** TypeScript, React (Next.js)

---

## Executive Summary

The codebase has evolved rapidly with several management modules (Users, Staff, Carriers, Shipments). While the implementation is largely clean, there are growing patterns of redundancy in confirmation logic and potentially dead code in the API layer. This cleanup focuses on merging overlapping UI components and identifying unused API/Hook exports.

---

## Cleanup Findings

### 1. High Redundancy: Confirmation Dialog Fragmentation

- **Severity:** High
- **Category:** Redundant Code
- **Location:**
  - `components/admin/delete-resource-dialog.tsx` (all)
  - `components/ui/confirm-dialog.tsx` (all)
- **Description:** Two separate components exist to handle user confirmation. `ConfirmDialog` is a generic wrapper around `AlertDialog`, while `DeleteResourceDialog` is a specialized version with a "Force Delete" toggle. Most pages (Users, Staff, Carriers) use `ConfirmDialog`, but `ShipmentDetailSheet` uses `DeleteResourceDialog`.
- **Cost:** High cognitive load for developers choosing between them; duplicated styling/logic for Dialog state management.
- **Cleanup Options:**
  - **Merge:** Enhance `ConfirmDialog` to support an optional `footerExtra` or specifically a `forceToggle` prop, then delete `DeleteResourceDialog`.
  - **Inline:** If only one sheet uses the special "Force" logic, inline that specific logic into code where it's used and use the standard `ConfirmDialog` for the rest.
  - **Collapse:** Turn `DeleteResourceDialog` into a "Strategy" or "Variant" of `ConfirmDialog` to reuse the base structure.

### 2. Redundant API Implementations: User Search

- **Severity:** Medium
- **Category:** Redundant Code / Unnecessary Indirection
- **Location:**
  - `api/users/index.ts` (Line 27, `getUserByCode`)
  - `hooks/users/use-users.ts` (Line 30, `useUserByCode`)
- **Description:** `getUserByCode` is a wrapper around the generic `getUsers` endpoint with a specific search filter. While it provides a cleaner API name, it duplicates the filtering logic that the generic `useUsers` hook can already perform.
- **Cost:** Maintenance surface area. If the search parameter name changes in the backend, multiple locations need updates.
- **Cleanup Options:**
  - **Delete:** Remove `getUserByCode` API and `useUserByCode` hook; use the generic `useUsers` with parameters in the Detail page.
  - **Collapse:** Refactor the Detail page to simply use the list hook with a `limit: 1` and `search` filter.
  - **Replace:** If a dedicated endpoint `GET /users/:code` is added (as hinted in comments), replace these workarounds entirely.

### 3. Potential Dead Code: Carriers "Update Commissions" Redundancy

- **Severity:** Medium
- **Category:** Redundant Code
- **Location:**
  - `api/carriers/index.ts` (Line 57 vs Line 87)
  - `components/carriers/carrier-detail-sheet.tsx` (Line 136-137)
- **Description:** The `updateCarrier` and `updateCommissions` are called sequentially in the UI. Depending on the backend implementation, `updateCarrier` might already accept commission data, or `updateCommissions` might be redundant if the main update handles all fields.
- **Cost:** Dual network requests where one might suffice; complex "loading" state management in the UI (waiting for two mutations).
- **Cleanup Options:**
  - **Merge:** Consolidate into a single `updateCarrier` call that includes commissions (requires backend alignment).
  - **Merge (UI only):** Use a single mutation hook that orchestrates both calls if they must remain separate APIs.
  - **Delete:** If the backend `PUT /carriers/:id` already handles commissions, remove the dedicated `update-carrier-commissions` endpoint usage.

### 4. Fragmented Bulk Actions

- **Severity:** Medium
- **Category:** Redundant Code
- **Location:**
  - `api/shipments/index.ts` (Line 84, `bulkDeleteShipments`)
  - `api/users/index.ts` (Line 76, `bulkDeleteUsers`)
- **Description:** Every management module is implementing its own bulk delete API and associated hook logic.
- **Cost:** Inconsistent implementation of bulk actions; boilerplate bloat.
- **Cleanup Options:**
  - **Generalize:** Create a generic `useBulkAction` hook in `hooks/use-bulk-action.ts`.
  - **Collapse:** Use a shared `AdminResourceAPI` that handles common operations (get, delete, bulkDelete) for all resource types.
  - **Merge:** Consolidate specific "Bulk Delete Bar" components into one reusable component (only one currently exists: `components/admin/bulk-delete-bar.tsx`).

### 5. API Surface Area: User vs Admin Shipment Endpoints

- **Severity:** Low
- **Category:** indirection Sprawl
- **Location:**
  - `api/shipments/index.ts` (Line 74, mixed `/admin/shipments` and `/shipments`)
- **Description:** The logic for choosing between `/admin/shipments` and `/shipments` is currently scattered inside individual API functions based on parameters (e.g., `force` flag).
- **Cost:** Cognitive load when debugging permissions or endpoint routing.
- **Cleanup Options:**
  - **Centralize:** Define a clear separation between `AdminAPI` and `PublicAPI` folders or classes.
  - **Collapse:** Use a single endpoint that respects the user's role/permissions token on the backend.
  - **Simplify:** Remove the conditional URL building in the client; always point to the appropriate resource-based URL.

---

## Final Recommendation

1. **Delete** `components/admin/delete-resource-dialog.tsx` and integrate its "Force" functionality into `components/ui/confirm-dialog.tsx`.
2. **Consolidate** the `getUserByCode` logic. The comment in `api/users/index.ts` line 21 admits it's a "workaround until a dedicated endpoint is available". Until then, it's cleaner to use the standard filterable query.
3. **Audit** the `updateCarrier` vs `updateCommissions` flow. If the backend supports it, sending all data in one request will simplify the frontend state significantly.
