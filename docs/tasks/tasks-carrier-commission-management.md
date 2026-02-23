# Task List: Carrier & Commission Management Integration

## Phase 1: Carrier Management (Backend Integration)

### 1. Carrier Types & API

- [ ] Create `types/carriers.ts`: Define `Carrier`, `Commission`, and payload interfaces.
- [ ] Create `api/carriers/index.ts`: Implement `getCarriers`, `createCarrier`, `updateCarrier`, `deleteCarrier`, `updateCommissions`.
- [ ] Create `hooks/carriers/use-carriers.ts`: React Query hooks for all operations.

### 2. Carrier List Page (`/dashboard/carriers`)

- [ ] Add "Carriers" to `AdminSidebar`.
- [ ] Create `app/dashboard/carriers/page.tsx` with a data table.
- [ ] Implement columns: Name, Status (Badge), API Key (masked), Actions.
- [ ] Add "Create Carrier" button triggering a sheet/modal.

### 3. Carrier Detail Sheet

- [ ] Create `components/carriers/carrier-detail-sheet.tsx`.
- [ ] Implement form for Name, Base URL, API Key, API Secret, Active Status.
- [ ] Handle creation (POST) and update (PUT) variants.

### 4. Delete & Validation

- [ ] Implement delete action with `ConfirmDialog` guard.
- [ ] Handle backend error if deletion is blocked (show Toast).

## Phase 2: Commission Management

### 5. Commission Editor UI

- [ ] Create `components/carriers/commission-editor.tsx`.
- [ ] Design 4-column/grid layout for: Local, Export, Import, International.
- [ ] Implement "Type" selector (PERCENT / FIXED).
- [ ] Implement "Value" input.
- [ ] Implement "Currency" selector (PLN/EUR) with CL02 rule enforcement:
  - PLN only allowed for Local stage.
  - EUR allowed for all.
  - Disable currency input if Type is PERCENT.

### 6. Integration

- [ ] Embed `CommissionEditor` into the `CarrierDetailSheet` (or a separate tab).
- [ ] Wire up `updateCommissions` API call.
- [ ] Add validation to ensure rules are met before saving.

## Phase 3: Operations & Deletion Enhancements

### 7. Enhanced Deletion Endpoints

- [ ] Update `api/users/index.ts` with `forceDeleteUser` (`/cascade`) and `bulkDeleteUsers`.
- [ ] Update `api/shipments/index.ts` with `forceDeleteShipment` and `bulkDeleteShipments`.
- [ ] Update `api/leads/index.ts` with `bulkDeleteLeads`.
- [ ] Update corresponding hooks.

### 8. UI for Advanced Deletion

- [ ] Update `UserDetailSheet`: Add "Force Delete" options to the specialized admin actions menu.
- [ ] Update `UsersPage`, `ShipmentsPage`, `LeadsPage`:
  - Add row selection checkboxes.
  - Add "Bulk Actions" bar (appears when items selected).
  - Wired up "Delete Selected" button.

## Phase 4: Lead Conversion Tracking

### 9. Type & API Updates

- [ ] Update `AdminShipment` type to include `estimateId`.
- [ ] Update `AdminLead` type if needed (backend sets `converted` flag).

### 10. Dashboard & Leads UI

- [ ] Update `LeadsPage`: Refine `ConversionBadge` to rely primarily on `lead.converted` flag (backend truth).
- [ ] Update `EstimateDetailSheet`: If converted, show link/button to the created shipment.

## Phase 5: Verification & Polish

### 11. Final Review

- [ ] Verify sidebar highlights persist for nested routes.
- [ ] Test Carrier creation with real credentials (if avail) or mocks.
- [ ] Test Commission updates with valid/invalid currency combinations.
- [ ] Verify Dashboard stats (`activeShipments`, `leads`) display correctly.
