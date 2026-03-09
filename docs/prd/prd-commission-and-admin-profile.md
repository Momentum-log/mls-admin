# PRD: Commission Thresholds & Admin Profile Tracking

## 1. Introduction / Overview

This PRD outlines the requirements for integrating two major features into the MLS Admin Panel: **Hierarchical Commission Thresholds** and **Admin Profile & Activity Tracking**.
The Commission Thresholds feature ensures a guaranteed minimum profit on shipments by applying flat-rate minimum commissions. These are applied hierarchically with root fallbacks, carrier fallbacks, and specific route stages (Local, Export, Import, International) along with smart EUR currency auto-conversion.
The Admin Profile feature empowers staff members to view their profile, change their passwords, and view their personal activity history directly from a clean UI side drawer.

## 2. Goals

- Provide admins with granular control over minimum commission thresholds at the global, carrier, and route-specific levels to maintain profitability on low-cost shipments.
- Ensure automated and manual currency conversion (PLN to EUR) can be easily toggled for threshold fees in the UI.
- Enable admins to quickly self-manage their profiles and passwords without interrupting their workflow.
- Provide a simple timeline-based activity tracking view for admins to monitor their actions.

## 3. User Stories

- As an admin, I want to set a global fallback minimum commission, so that no cheap shipment bypasses profitability.
- As an admin, I want to set specific minimum flat rates per carrier and per route stage (Local, Export, Import, International).
- As an admin, I want the system to automatically calculate EUR thresholds from PLN by default, but let me toggle a switch to manually override the values.
- As an admin, I want to click my avatar to open a side drawer showing my profile information.
- As an admin, I want to change my password securely from my profile side drawer.
- As an admin, I want to view a simple timeline of my recent system activities with a "Load More" button within the profile drawer.

## 4. Features / Tasks

### Commission Thresholds (CM)

- CM01: Create UI for **Global Commission Thresholds** (PLN threshold, flat PLN fee, manual EUR toggle, manual EUR threshold/fee).
- CM02: Update **Carrier Settings** UI to support Carrier-level fallback thresholds and manual EUR toggles.
- CM03: Update **Route Settings** UI to support Route-specific minimums for all 4 stages (_Local, Export, Import, International_) including their respective manual EUR toggles.
- CM04: Integrate frontend components with `GET /api/admin/settings/commission/:carrierId` and `PUT` endpoints to correctly fetch/save carrier threshold data.
- CM05: Integrate frontend components with `GET /api/admin/settings/global-commission` and `PUT` endpoints for global commission settings.

### Admin Profile (AP)

- AP01: Implement a **Side Drawer** component that triggers when an admin clicks their avatar in the top navbar.
- AP02: Fetch and display admin profile details inside the side drawer using `GET /api/admin/staff/me/profile`.
- AP03: Implement a "Change Password" form within the side drawer that hits `PUT /api/admin/staff/me/password` using `oldPassword` and `newPassword`.
- AP04: Form Validation: Ensure the change password form includes validation (min 8 characters) and blocks attempts to change the email.

### Activity Tracking (AT)

- AT01: Implement an "Activity Log" section integrated seamlessly within the profile Side Drawer.
- AT02: Fetch admin activity logs using the `GET /api/admin/staff/me/activity` endpoint.
- AT03: Design the log view as a minimalist timeline or list displaying recent actions sorted chronologically.
- AT04: Add a "Load More" pagination button beneath the timeline to fetch previous activities seamlessly using page params.

## 5. Non-Goals (Out of Scope)

- Integration or configuration of the PayU payment gateway (handled by the backend or a separate ticket).
- Features for editing admin email addresses (explicitly unsupported/blocked by backend for self-service).
- Creating a sophisticated data table with complex filters/sorting for the generic activity log (a simple timeline is preferred).

## 6. Design Considerations

- **Layout Flow:** The Profile MUST be integrated into a Side Drawer to avoid full-page navigation context loss.
- **Aesthetics & Styling:** Adhere strictly to the project's design philosophy—no gradients, use consistent CSS variables, maintain flat and modern minimalistic looks.
- **Dynamic Fields:** Form inputs for manual EUR overrides should ONLY be visible or enabled when the corresponding "Auto-calculate" toggle is turned on/set to manual.

## 7. Technical Considerations

- **Error Handling:** Gracefully handle and display API validation errors, particularly for the Change Password form incorrect `oldPassword`.
- **Performance:** Activity Logs should be lazily loaded based on the "Load More" button to avoid unnecessary front-end data bloat. Ensure components remain decoupled into `hooks/` and UI layers.

## 8. Success Metrics

- 100% of newly configured carrier rates applying appropriate flat-fee threshold rules without rendering issues.
- Admins can successfully modify their passwords without encountering feedback glitches in the UI.
- Activity timeline correctly reflects recent requests, excluding ignored GET request polls/stats routes.

## 9. Open Questions

- None at this time.
