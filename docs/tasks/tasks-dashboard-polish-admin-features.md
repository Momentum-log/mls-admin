# Tasks — Dashboard UI Polish & Admin Features Enhancement

## 1. Prerequisites & Refactoring

- [ ] Update `utils/format-date.ts` to support 12-hour time formatting with minutes.
- [ ] Update `utils/format-address.ts` (if exists) or create a helper for `City, CC` route strings.
- [ ] Implement `useDeleteLead`, `useDeleteEstimate`, and `useDeleteUser` hooks in their respective hook modules.

## 2. Dashboard Overhaul

- [ ] **Fix "LMP" Bug**: Identify and remove the "LMP" text from stat cards.
- [ ] **Stat Card Row**:
  - [ ] Set uniform heights for all 5 cards.
  - [ ] Apply "Premium" high-contrast styling to the **Revenue** card.
  - [ ] Rename "In Transit" to **"Active Shipments"**.
- [ ] **Activity Section**:
  - [ ] Add section titles above activity cards.
  - [ ] Add "Copy Tracking #" icon and "See All" label to Recent Shipments.
  - [ ] Enable independent card heights for Row 2.

## 3. Data Display & User Identity

- [ ] **User/Guest Identity**:
  - [ ] Dashboard: Update recent activity rows to show `Name (User Code)` or `Guest`.
  - [ ] Lead/Shipment Pages: Standardize the identity column.
- [ ] **Routes**: Update tables to show `City, CountryCode`.
- [ ] **Timestamps**: Apply 12-hour formatted strings across all tables and sheets.
- [ ] **Phone Formatting**: Ensure the `+` prefix is present in all phone displays.

## 4. Search & Logic Fixes

- [ ] **Guest ID Search**:
  - [ ] Update `useLeads` query to include `guestId` if search term matches guest format.
  - [ ] Update `useShipments` query to include `guestId` logic.
- [ ] **Conversion Badge**: Update the Leads table to display "Shipment Created" status when correlated.

## 5. Admin Actions & Safety

- [ ] **Confirmation Dialogs**: Integrate `ConfirmDialog` into:
  - [ ] Users Page (Delete User action).
  - [ ] Leads Page (Delete Lead action).
  - [ ] User Details Page (Delete Estimate action).
- [ ] **Context Menus**: Add copy icons next to "Copy User Code" text in dropdown menus.

## 6. Verification & Final Polish

- [ ] Verify 12-hour time is consistent across the app.
- [ ] Test Guest ID search with sample guest IDs.
- [ ] Assert that delete actions trigger prompts correctly.
- [ ] Update `changelog.md` to version `0.7.2` (Minor update).
