# PRD — Dashboard UI Polish & Admin Features Enhancement

## 1. Introduction / Overview

The **Momentum Logistics Service (MLS)** Admin Dashboard is undergoing a visual and functional modernization. This phase focuses on refining the dashboard's "at-a-glance" metrics, standardizing data formatting for the Polish and International markets, and introducing critical data management tools (deletion and advanced search) for administrators.

## 2. Goals & Objectives

- **Visual Excellence**: Transition to a vibrant, high-contrast dashboard that feels premium and "alive."
- **Data Precision**: Implement standard 12-hour time formatting and locale-aware route/phone identification.
- **Operational Control**: Enable admins to clean up system data (leads, estimates, users) with proper safety guards (confirmation dialogs).
- **Enhanced Search**: Bridge the gap between guest activities and admin oversight by enabling Guest ID searching.

## 3. User Stories

- **Admin Oversight**: "I want to see my revenue metrics highlighted more prominently than regular shipment counts."
- **Customer Support**: "I need to quickly track down a guest estimate using the ID provided by the customer over the phone."
- **Data Hygiene**: "I want to remove test users or stale marketing leads to keep our conversion analytics accurate."
- **Information Density**: "I want to see exactly which city and country a shipment is heading to without clicking into details."

## 4. Feature Requirements

### 4.1 Dashboard UI Redesign

- **Stat Cards (Row 1)**:
  - **Uniformity**: All 5 cards in the top row MUST have the same height.
  - **Revenue Highlight**: The Revenue card should use a distinct style (e.g., deep brand-blue or high-contrast dark theme) to stand out.
  - **Renaming**: Change "In Transit" label to **"Active Shipments"**.
  - **Bug Fix**: Remove/Fix the "LMP" text appearing incorrectly on the first card.
- **Activity Section (Row 2)**:
  - **Titles**: Add descriptive section titles above each activity card.
  - **Layout**: Allow independent heights for cards in this row to accommodate varying list lengths.
  - **Recent Shipments**:
    - Add a "Copy" icon next to tracking numbers.
    - Replace the arrow icon with a clear "See All" button/label.

### 4.2 Enhanced Data Formatting (Application-Wide)

- **Clock**: Switch all timestamps from 24-hour to **12-hour format (AM/PM)**.
- **Precision**: Timestamps for sign-ups and activities must include **minutes** (e.g., "Oct 12, 11:45 PM").
- **Geography**: Display routes as `City, CC` (e.g., `Warsaw, PL → Berlin, DE`).
- **Identity**:
  - Registered Users: `Name (User Code)`.
  - Guests: Explicitly label as `Guest` and show the Guest ID.
- **Phone Numbers**: Force the `+` prefix on all displayed phone numbers.

### 4.3 Search & Conversion Logic

- **Guest Search**: Update search filters on the **Marketing Leads** and **Shipments** pages to query by `guestId`.
- **Conversion Column**:
  - If an estimate has been converted, the column should show **"Shipment Created"** (using the green badge).
  - Use the correlation utility to verify linkage.

### 4.4 Admin Permissions & Safety

- **Delete Actions**:
  - Add "Delete" buttons/menu items for **Marketing Leads**, **Shipping Estimates**, and **Users**.
  - **Safety Grid**: Implement a `ConfirmDialog` for all delete operations to prevent accidental data loss.
- **Clipboard Tools**: Add a visible "Copy" icon next to the "Copy User Code" option in the Users management table dropdown.

## 5. Technical Considerations

- **Utility Functions**:
  - `utils/format-date.ts`: Add support for optional 12-hour formatting.
- **API Integration**:
  - Verification of `DELETE` endpoint availability (Mocking may be required if backend is pending).
- **State Management**:
  - Ensure `ConfirmDialog` state is handled locally within pages to avoid UI flickering.

## 6. Success Metrics

- **Reduced Support Lag**: Admins can find guest records 50% faster.
- **Improved Aesthetics**: Positive feedback on dashboard "premium" feel.
- **Data Accuracy**: Zero accidental deletions thanks to confirmation dialogs.
