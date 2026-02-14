# Admin System Workflow & Security Guide

This document outlines the architecture, security flows, and usage instructions for the MLS Admin System.

## 1. Authentication & Super Admin

The Admin System uses a high-security authentication flow, particularly for the **Super Admin**.

### Super Admin (The "Root" User)

- **Static Identity**: The Super Admin uses a single, immutable email address (e.g., `admin@momentumlogservices.com`). This is embedded in the system and cannot be changed via the dashboard.
- **Daily Rotation**: The password for this account is **automatically reset every 24 hours** by a system script.
- **Login**: The new password is sent to the Super Admin's email.
- **Restrictions**: The Super Admin cannot manually change their own password via the UI—it is strictly managed by the system.

### Staff/Admin Authentication

- **Creation**: Staff accounts are created by the Super Admin (or delegated admins).
- **Welcome Flow**: Upon creation, the staff member receives an email containing:
  - Login Email
  - Generated Password
  - Role & Expectations
- **Password Management**: Unlike the Super Admin, **Staff can and should change their own passwords**. Their passwords do _not_ rotate automatically.
- **Tracking**:
  - **Last Logged In**: Recorded when a session starts.
  - **Last Active**: Recorded on _every_ API call to track engagement.

## 2. Roles & Developer Mode

### Role-Based Access Control (RBAC)

Every Admin is assigned a specific Role (e.g., `SUPPORT`, `FINANCE`).

- **Admins cannot change their own role.**
- **Staff Management**: Admins (with permission) can view a list of other staff members but **cannot see themselves** in that list or edit their own profile properties (except password).

### Developer Mode

By default, **no admin** (including Super Admin) has direct write access to sensitive database operations.

- **Default State**: Read-only or business-logic-only access.
- **Toggle**: Admins can toggle "Developer Mode" ON.
- **Effect**: Grants elevated permissions (e.g., direct DB edits, raw SQL view) for the duration of the mode.
- **Auditing**: Toggling this mode is strictly logged.

## 3. Auditing & Identity

To maintain accountability, **all** actions are tracked.

- **Unique Identity**: Every admin has a unique `adminCode`.
- **Attribution**: Every log entry identifies _who_ performed the action (Email/Code).
- **Timestamp**: Precise time of action is recorded.

## 4. Workflows

### Creating a New Staff Member

1.  Super Admin goes to "Staff Management".
2.  Clicks "Add Staff".
3.  Enters Email, Name, Role.
4.  **System Action**:
    - Creates account with generated password.
    - Sends "Welcome to MLS Team" email with credentials.
    - Sets status to "Pending Login".

### Creating Proxy Shipments

1.  Admin selects a User.
2.  Fills Shipment Form _as_ that user.
3.  Instead of paying, Admin clicks "Send Payment Link".
4.  User receives email to complete the transaction.

## 5. Technical Implementation Details

- **Schema**: `Admin` table includes `adminCode`, `lastActive`, `lastLogin`, `developerMode`.
- **Middleware**: `ActivityTracker` updates `lastActive` silently on requests.
- **Services**: `SecurityService` handles audit logs and rotation. `RbacService` restricts access based on `developerMode` flag.
