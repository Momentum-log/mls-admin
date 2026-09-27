"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Package,
  Mail,
  Truck,
  Lock,
  Shield,
  MapPin,
  Route,
  Warehouse,
  UsersRound,
} from "lucide-react";
import { usePermissions } from "@/hooks/use-permissions";

interface NavRoute {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  /** Permission required to reach this route. */
  permission?: string;
  /**
   * Restricted to the Super Admin regardless of granted permissions.
   *
   * The Security page previously guarded on a `system:security` permission
   * that does not exist in the server's catalog. It could never be granted,
   * so it always evaluated false — the right outcome by accident. This states
   * the intent instead.
   */
  superAdminOnly?: boolean;
}

interface NavGroup {
  heading: string;
  routes: NavRoute[];
}

/**
 * Grouped navigation.
 *
 * Locked entries stay visible rather than disappearing, so staff can see what
 * exists and ask for access instead of wondering whether a feature is missing.
 */
const navGroups: NavGroup[] = [
  {
    heading: "Operations",
    routes: [
      {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/dashboard",
        permission: "dashboard:read",
      },
      {
        label: "Shipments",
        icon: Package,
        href: "/dashboard/shipments",
        permission: "shipment:read",
      },
      {
        label: "Multi-Leg Ops",
        icon: Warehouse,
        href: "/dashboard/multi-leg",
        permission: "shipment:read",
      },
      {
        label: "Address Requests",
        icon: MapPin,
        href: "/dashboard/address-requests",
        permission: "user:read",
      },
    ],
  },
  {
    heading: "Growth",
    routes: [
      {
        label: "Users",
        icon: Users,
        href: "/dashboard/users",
        permission: "user:read",
      },
      {
        label: "Marketing Leads",
        icon: Mail,
        href: "/dashboard/leads",
        permission: "leads:read",
      },
    ],
  },
  {
    heading: "Configuration",
    routes: [
      {
        label: "Carriers",
        icon: Truck,
        href: "/dashboard/carriers",
        permission: "carrier:read",
      },
      {
        label: "Hub & Routing",
        icon: Route,
        href: "/dashboard/hub",
        permission: "staff:read",
      },
    ],
  },
  {
    heading: "System",
    routes: [
      {
        label: "Staff & Roles",
        icon: UsersRound,
        href: "/dashboard/staff",
        permission: "staff:read",
      },
      {
        label: "Security",
        icon: Shield,
        href: "/dashboard/security",
        superAdminOnly: true,
      },
    ],
  },
];

/**
 * Admin sidebar navigation — light theme with brand-blue active states.
 * Enforces RBAC visibility and locking.
 */
export function AdminSidebar() {
  const pathname = usePathname();
  const { hasPermission, isSuperAdmin } = usePermissions();

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-white border-r border-border overflow-y-auto">
      <div className="px-3 py-2 flex-1">
        <Link href="/dashboard" className="flex items-center pl-3 mb-10">
          <Image
            src="/images/logo-landscape.svg"
            alt="Momentum Logistics"
            width={180}
            height={40}
            priority
          />
        </Link>

        {navGroups.map((group) => (
          <div key={group.heading} className="mb-6 last:mb-0">
            <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
              {group.heading}
            </p>
            <div className="space-y-1">
              {group.routes.map((route) => {
                const isAllowed = route.superAdminOnly
                  ? isSuperAdmin
                  : hasPermission(route.permission ?? "");

                return (
                  <Link
                    key={route.href}
                    href={isAllowed ? route.href : "#"}
                    aria-disabled={!isAllowed}
                    title={
                      isAllowed
                        ? undefined
                        : route.superAdminOnly
                          ? "Super Admin only"
                          : `Requires ${route.permission}`
                    }
                    onClick={(e) => {
                      if (!isAllowed) e.preventDefault();
                    }}
                    className={cn(
                      "text-sm group flex p-3 w-full justify-start font-medium rounded-lg transition",
                      !isAllowed
                        ? "opacity-50 grayscale cursor-not-allowed text-muted-foreground hover:bg-transparent"
                        : (
                              route.href === "/dashboard"
                                ? pathname === "/dashboard"
                                : pathname.startsWith(route.href)
                            )
                          ? "bg-brand-blue/10 text-brand-blue"
                          : "text-muted-foreground hover:text-brand-blue hover:bg-brand-blue/5 cursor-pointer",
                    )}
                  >
                    <div className="flex items-center flex-1">
                      <route.icon className="h-5 w-5 mr-3" />
                      {route.label}
                      {!isAllowed && (
                        <Lock className="ml-auto h-4 w-4 text-muted-foreground/60" />
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
