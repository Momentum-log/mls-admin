# PRD - Super Admin Password Rotation

## 1. Introduction / Overview

This feature implements a manual password rotation mechanism for the Super Admin account. While the system automatically rotates the password every 24 hours, this manual trigger allows the Super Admin to pre-emptively rotate the password in case of suspected compromise or emergency using a deterministically generated **Weekly Reset Key** sent via email.

The trigger will be available both within the authenticated **Dashboard** (Settings > Security) and on the **Login Page** (for emergency recovery).

## 2. Goals

- Provide a secure, manual way to rotate the Super Admin password.
- Enable emergency access recovery via the login page using the Weekly Reset Key.
- Ensure high-friction UI (confirmation dialogs) to prevent accidental invalidation of credentials.
- Maintain a non-persistent security model where reset keys are never stored in the database.

## 3. User Stories

- **As a Super Admin**, I want to manually rotate my password from the security settings if I suspect someone else has access to it.
- **As a Super Admin**, if I didn't receive the daily rotation email or lost access, I want to be able to trigger a new rotation directly from the login page using my secret Weekly Reset Key.
- **As a Developer**, I want the rotation trigger to be high-friction and clearly communicate that it will invalidate existing credentials immediately.

## 4. Features / Tasks

### API Integration (SI)

- **SI01**: Implement `rotatePassword(resetKey: string)` function in `api/admin/security.ts` (or equivalent).
- **SI02**: Create a specialized `useRotatePassword` hook using TanStack Query to handle the mutation, loading states, and toast notifications.

### Dashboard UI (UI)

- **UI01**: Create a new `/dashboard/security` page (or add to an existing Settings page).
- **UI02**: Implement a "Security" section with a "Super Admin Password Rotation" card.
- **UI03**: Add an input field for the "Weekly Reset Key" (masked by default).
- **UI04**: Implement a "Rotate Super Admin Password" button.
- **UI05**: Integrate `ConfirmDialog` to show a destructive warning before proceeding: _"Are you sure? This will immediately invalidate the current Super Admin password."_
- **UI06**: Update `AdminSidebar` to include a "Security" link (visible only to Super Admins).

### Login UI (LI)

- **LI01**: Add a "Rotate Super Admin Access" link on the `LoginPage` below the "Forgot password?" button.
- **LI02**: Implement a modal or inline form on the `LoginPage` to enter the **Weekly Reset Key**.
- **LI03**: Reuse the `ConfirmDialog` logic on the login page for the rotation trigger.
- **LI04**: Show a success toast on the login page after successful rotation: _"Success! Check your email for the new password."_

### Maintenance (MS)

- **MS01**: Update `changelog.md` with the new Password Rotation feature.
- **MS02**: Ensure the Reset Key is never cached or stored in browser state (localStorage/sessionStorage).

## 5. Non-Goals (Out of Scope)

- Regular staff password rotation (this is for Super Admin only).
- Reset key generation (this is handled by the server).
- Database storage of reset keys.

## 6. Design Considerations

- **High Contrast**: Use `destructive` red for the rotation button to indicate high impact.
- **Input Masking**: The Weekly Reset Key input should behave like a password field or sensitive code field.
- **Feedback**: Use `react-hot-toast` for immediate feedback.
- **Loading State**: The button should show a spinner and be disabled during the API call (which may take 1-3 seconds due to hashing and email sending).

## 7. Technical Considerations

- **Endpoint**: `${BASE_URL}/api/admin/security/rotate` (POST).
- **Public Access**: The endpoint is public as verified by the user, but guarded by the deterministic `resetKey`.
- **RBAC**: Although the endpoint is public, the server-side logic handles ensuring it only affects the Super Admin account.

## 8. Success Metrics

- 100% success rate for manual rotations given a valid key.
- Zero accidental rotations (prevented by confirmation dialogs).
- Accessibility of rotation from both login page and dashboard.

## 9. Open Questions

- Should the "Security" link in the sidebar be inside a "Settings" dropdown?
- Should we add a rate limit specifically for the public rotation endpoint? (Assumed to be handled server-side).
