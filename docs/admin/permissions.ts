export const PERMISSIONS = [
  {
    group: "Dashboard",
    permissions: [
      {
        id: "dashboard:read",
        name: "View Dashboard Overview",
        description:
          "Allows the user to view high-level dashboard metrics, statistics, and reports.",
      },
    ],
  },
  {
    group: "Users",
    permissions: [
      {
        id: "user:read",
        name: "View Users",
        description:
          "Allows the user to view the list and details of registered users.",
      },
      {
        id: "user:write",
        name: "Edit Users",
        description:
          "Allows the user to block, warn, suspend or modify information for registered users.",
      },
    ],
  },
  {
    group: "Shipments",
    permissions: [
      {
        id: "shipment:read",
        name: "View Shipments",
        description:
          "Allows the user to view all shipments, rates, and customs details.",
      },
      {
        id: "shipment:write",
        name: "Edit Shipments",
        description:
          "Allows the user to update shipment statuses, override shipments, or refund payments.",
      },
    ],
  },
  {
    group: "Staff Administration",
    permissions: [
      {
        id: "staff:read",
        name: "View Staff & Roles",
        description:
          "Allows the user to view all administrative staff and roles.",
      },
      {
        id: "staff:write",
        name: "Edit Staff & Roles",
        description:
          "Allows the user to create, edit, suspend staff and manage system roles.",
      },
    ],
  },
  {
    group: "Carriers",
    permissions: [
      {
        id: "carrier:read",
        name: "View Carriers",
        description:
          "Allows the user to view carrier settings, integrations, and local commissions.",
      },
      {
        id: "carrier:write",
        name: "Edit Carriers",
        description:
          "Allows the user to modify carrier configurations, toggle visibility, and update commission rates.",
      },
    ],
  },
  {
    group: "Marketing & Leads",
    permissions: [
      {
        id: "leads:read",
        name: "View Leads",
        description:
          "Allows the user to view captured shipping estimate leads and their contact information.",
      },
      {
        id: "leads:write",
        name: "Edit Leads",
        description:
          "Allows the user to manage lead entries or export lead information.",
      },
    ],
  },
  {
    group: "Inquiries",
    permissions: [
      {
        id: "inquiries:read",
        name: "View Inquiries",
        description:
          "Allows the user to view contact-form inquiries and their details.",
      },
      {
        id: "inquiries:write",
        name: "Manage Inquiries",
        description:
          "Allows the user to triage inquiries between pending, contacted, and resolved.",
      },
    ],
  },
  {
    group: "Emails & Settings",
    permissions: [
      {
        id: "email:read",
        name: "View Email Templates",
        description:
          "Allows the user to read system email template configurations.",
      },
      {
        id: "email:write",
        name: "Edit Email Templates",
        description:
          "Allows the user to modify and save changes to email templates.",
      },
    ],
  },
];
