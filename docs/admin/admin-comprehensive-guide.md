# Momentum Logistics Service: Comprehensive Admin Guide

Welcome to the Momentum Logistics Service (MLS) Administrator Guide. This comprehensive document serves as your operational manual for navigating the dashboard, managing users, fulfilling shipments, and administering the system's Role-Based Access Control (RBAC).

---

## 1. Dashboard Overview

The **Dashboard** is your primary operational hub. When you log in, you will be presented with high-level metrics related to the logistics system.

- **Key Statistics**: Quickly view active shipments, successful deliveries, pending estimates, and newly captured marketing leads.
- **Recent Activity**: A feed of recent significant actions affecting shipments and user accounts.

_Permission required to view this section: `dashboard:read`_

---

## 2. Managing Users

The **Users** tab provides a comprehensive list of all registered end-users in the system.

- **Viewing Users**: The user table lists registered accounts, their statuses, and contact details. Clicking a user row will display their complete profile and shipment history.
- **Editing Users**: If you have the appropriate access, you can edit user profiles, suspend access for bad actors, or issue system warnings.

_Permissions required to view this section: `user:read` or `user:write`_

---

## 3. Managing Shipments

The **Shipments** tab is the core operational feature of MLS.

- **Viewing Shipments**: Explore the complete lifecycle of all packages. You can filter by status (e.g., Pending, In Transit, Delivered, Cancelled) to easily track the status of critical shipments.
- **Editing Shipments**: Administrators can manually override shipment statuses, modify customs details in exceptional cases, or process partial/full refunds for cancelled shipments.

_Permissions required to view this section: `shipment:read` or `shipment:write`_

---

## 4. Managing Carriers & Logistics

The **Carriers** section dictates how the system interfaces with delivery partners (e.g., FedEx, DHL).

- **Carrier Configurations**: View API integrations, tracking settings, and base URL configurations.
- **Programmatic Slugs**: Each carrier must be mapped to a backend adapter via a **Slug** (e.g., `fedex`, `dhl`). You can select from standard adapters or choose **"Other / Custom..."** to enter a new, lowercase programmatic key for new integrations.
- **System Health Warnings**: If no active carriers are configured with a valid slug, or if any carrier is missing its slug assignment, the system will display a warning banner at the top of the Carriers page.
- **Commissions & Rates**: Configure the percentage commission MLS charges on top of base carrier rates. To adjust commissions, simply enter the whole number (e.g., `10` for 10%) and save changes.

_Permissions required to view this section: `carrier:read` or `carrier:write`_

---

## 5. Marketing, Leads & Emails

- **Marketing & Leads**: From the shipping estimator on the frontend, users who request quotes but do not immediately convert are stored as Leads. You can view these entries and export their contact information for remarketing. Once a shipment is eventually created for that lead, they are marked as 'converted'.
  - _Permissions required: `leads:read` or `leads:write`_
- **Emails & Settings**: View and modify the system email templates (e.g., Welcome Emails, Shipment Updates). The system utilizes Brevo/SMTP for delivery.
  - _Permissions required: `email:read` or `email:write`_

---

## 6. Staff Administration & Role-Based Access Control (RBAC)

The **Staff** section is exclusively for managing backend administrators. Our system operates on granular Role-Based Access Control (RBAC), meaning security is defined by roles constructed from individual permissions.

_Permissions required to view this section: `staff:read` or `staff:write`_

### Understanding Permissions

A core set of permissions dictates what an administrator can see or do. If an administrator is missing a specific permission, corresponding UI elements (including parts of this documentation) will be completely hidden from their interface.

**Dashboard**

- `dashboard:read` - Allows the user to view high-level dashboard metrics, statistics, and reports.

**Users**

- `user:read` - Allows the user to view the list and details of registered users.
- `user:write` - Allows the user to block, warn, suspend or modify information for registered users.

**Shipments**

- `shipment:read` - Allows the user to view all shipments, rates, and customs details.
- `shipment:write` - Allows the user to update shipment statuses, override shipments, or refund payments.

**Staff Administration**

- `staff:read` - Allows the user to view all administrative staff and roles.
- `staff:write` - Allows the user to create, edit, suspend staff and manage system roles.

**Carriers**

- `carrier:read` - Allows the user to view carrier settings, integrations, and local commissions.
- `carrier:write` - Allows the user to modify carrier configurations, toggle visibility, and update commission rates.

**Marketing & Leads**

- `leads:read` - Allows the user to view captured shipping estimate leads and their contact information.
- `leads:write` - Allows the user to manage lead entries or export lead information.

**Emails & Settings**

- `email:read` - Allows the user to read system email template configurations.
- `email:write` - Allows the user to modify and save changes to email templates.

---

### Managing System Roles

A **Role** is simply a designated container for multiple permissions. (e.g., A "Support Agent" role might have `user:read` and `shipment:read` but no `write` permissions).

**To create a new role or rule:**

1. Navigate to the **Roles** tab under the Staff section.
2. Click **Create Role**.
3. Provide a clear Role Name (e.g., "Accountant") and a Description.
4. Go through the dynamically rendered permission checkboxes and select only the exact permissions needed.
5. Click **Save**.

**To edit a role:**

1. Click the edit icon next to an existing role in the table.
2. Adjust the permissions checkboxes. Note that changes apply immediately to anyone holding that role upon their next API request.
3. _Note: You cannot delete the foundational "Super Admin" role, nor can you delete roles currently assigned to active staff._

---

### Managing Staff & Staff Leaders

**To create a staff member/leader:**

1. Navigate to the **Staff** directory.
2. Click **Add Staff**.
3. Input the required administrative details (Name, Email).
4. Assign them an existing Role from the dropdown.
5. Select whether they should be notified via email of their new account and role assignment.
6. Click **Save**.

If an administrator's duties change, simply edit their profile and assign them a different Role. Their access will instantly adjust (and documentation will automatically hide or reveal sections based on their new permissions tier).

---

_END OF GUIDE. This profile drawer will automatically hide sections you do not have permission to view. If you believe your access is restricted in error, please contact a Super Admin._
