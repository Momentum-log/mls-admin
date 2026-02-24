"use client";

import { usePermissions } from "@/hooks/use-permissions";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  LayoutDashboard,
  Users,
  Package,
  Truck,
  Mail,
  Shield,
  Settings,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * DocsViewer Component
 * Renders a permission-aware guide for the admin dashboard.
 * Each section is only visible if the user has the relevant permissions.
 */
export function DocsViewer() {
  const { hasAnyPermission } = usePermissions();

  const sections = [
    {
      id: "dashboard",
      title: "Dashboard Overview",
      icon: LayoutDashboard,
      permissions: ["dashboard:read", "dashboard:write"],
      content: (
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            The <strong>Dashboard</strong> is your primary operational hub. When
            you log in, you will be presented with high-level metrics related to
            the logistics system.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Key Statistics:</strong> Quickly view active shipments,
              successful deliveries, pending estimates, and newly captured
              marketing leads.
            </li>
            <li>
              <strong>Recent Activity:</strong> A feed of recent significant
              actions affecting shipments and user accounts.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "users",
      title: "Managing Users",
      icon: Users,
      permissions: ["user:read", "user:write"],
      content: (
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            The <strong>Users</strong> tab provides a comprehensive list of all
            registered end-users in the system.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Viewing Users:</strong> The user table lists registered
              accounts, their statuses, and contact details. Clicking a user row
              will display their complete profile and shipment history.
            </li>
            <li>
              <strong>Editing Users:</strong> If you have the appropriate
              access, you can edit user profiles, suspend access for bad actors,
              or issue system warnings.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "shipments",
      title: "Managing Shipments",
      icon: Package,
      permissions: ["shipment:read", "shipment:write"],
      content: (
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            The <strong>Shipments</strong> tab is the core operational feature
            of MLS.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Viewing Shipments:</strong> Explore the complete lifecycle
              of all packages. You can filter by status (e.g., Pending, In
              Transit, Delivered, Cancelled).
            </li>
            <li>
              <strong>Editing Shipments:</strong> Administrators can manually
              override shipment statuses, modify customs details, or process
              refunds.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "carriers",
      title: "Managing Carriers",
      icon: Truck,
      permissions: ["carrier:read", "carrier:write"],
      content: (
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            The <strong>Carriers</strong> section dictates how the system
            interfaces with delivery partners (e.g., FedEx, DHL).
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Carrier Configurations:</strong> View API integrations,
              tracking settings, and base URL configurations.
            </li>
            <li>
              <strong>Commissions & Rates:</strong> Configure the percentage
              commission MLS charges. Enter whole numbers (e.g., 10 for 10%).
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "marketing",
      title: "Marketing & Leads",
      icon: Mail,
      permissions: ["leads:read", "leads:write"],
      content: (
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            Users who request quotes but do not immediately convert are stored
            as <strong>Leads</strong>.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Lead Management:</strong> View captured shipping estimate
              leads and their contact information.
            </li>
            <li>
              <strong>Conversion:</strong> Once a shipment is eventually created
              for that lead, they are marked as 'converted'.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "emails",
      title: "Emails & Settings",
      icon: Settings,
      permissions: ["email:read", "email:write"],
      content: (
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>Manage the system email templates and integration settings.</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Email Templates:</strong> View and modify templates for
              Welcome Emails, Shipment Updates, etc.
            </li>
            <li>
              <strong>Integration:</strong> The system utilizes Brevo/SMTP for
              delivery.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "rbac",
      title: "Staff Administration & RBAC",
      icon: Shield,
      permissions: ["staff:read", "staff:write"],
      content: (
        <div className="space-y-4 text-sm text-muted-foreground">
          <p>
            Our system operates on granular{" "}
            <strong>Role-Based Access Control (RBAC)</strong>. Security is
            defined by roles constructed from individual permissions.
          </p>

          <div className="bg-muted/50 p-3 rounded-md space-y-2">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              How to Create a New Role
            </h4>
            <ol className="list-decimal pl-5 space-y-1">
              <li>
                Navigate to <strong>Staff & Roles</strong>.
              </li>
              <li>
                Click <strong>Create Role</strong>.
              </li>
              <li>Provide a Name and Description.</li>
              <li>Select the exact permissions needed from the checkboxes.</li>
              <li>
                Click <strong>Save</strong>.
              </li>
            </ol>
          </div>

          <div className="bg-muted/50 p-3 rounded-md space-y-2">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Managing Staff Leaders
            </h4>
            <ol className="list-decimal pl-5 space-y-1">
              <li>
                Navigate to the <strong>Staff</strong> directory.
              </li>
              <li>
                Click <strong>Add Staff</strong>.
              </li>
              <li>
                Input details and assign a <strong>Role</strong>.
              </li>
              <li>Optionally notify the user via email.</li>
            </ol>
          </div>
        </div>
      ),
    },
  ];

  const visibleSections = sections.filter((section) =>
    hasAnyPermission(section.permissions),
  );

  if (visibleSections.length === 0) {
    return (
      <div className="py-10 text-center">
        <p className="text-muted-foreground">
          You don't have permission to view any guides.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-1 mb-4">
        <BookOpen className="h-5 w-5 text-brand-blue" />
        <h3 className="font-bold text-lg tracking-tight">
          Admin Guide & Tutorials
        </h3>
      </div>

      <Accordion type="single" collapsible className="w-full">
        {visibleSections.map((section) => (
          <AccordionItem
            key={section.id}
            value={section.id}
            className="border-b border-border/40"
          >
            <AccordionTrigger className="hover:no-underline py-4 hover:bg-muted/30 px-2 rounded-md transition-all group">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-brand-blue/5 text-brand-blue group-hover:bg-brand-blue/10 transition-colors">
                  <section.icon className="h-4 w-4" />
                </div>
                <span className="font-medium text-sm">{section.title}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-6 px-4">
              {section.content}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
