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
} from "lucide-react";
import { usePermissions } from "@/hooks/use-permissions";

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    permission: "dashboard:read",
  },
  {
    label: "Users",
    icon: Users,
    href: "/dashboard/users",
    permission: "user:read",
  },
  {
    label: "Staff & Roles",
    icon: Users,
    href: "/dashboard/staff",
    permission: "staff:read",
  },
  {
    label: "Shipments",
    icon: Package,
    href: "/dashboard/shipments",
    permission: "shipment:read",
  },
  {
    label: "Marketing Leads",
    icon: Mail,
    href: "/dashboard/leads",
    permission: "leads:read",
  },
  {
    label: "Carriers",
    icon: Truck,
    href: "/dashboard/carriers",
    permission: "carrier:read",
  },
];

/**
 * Admin sidebar navigation — light theme with brand-blue active states.
 * Enforces RBAC visibility and locking.
 */
export function AdminSidebar() {
  const pathname = usePathname();
  const { hasPermission } = usePermissions();

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-white border-r border-border">
      <div className="px-3 py-2 flex-1">
        <Link href="/dashboard" className="flex items-center pl-3 mb-14">
          <Image
            src="/images/logo-landscape.svg"
            alt="Momentum Logistics"
            width={180}
            height={40}
            priority
          />
        </Link>
        <div className="space-y-1">
          {routes.map((route) => {
            const isAllowed = hasPermission(route.permission);

            return (
              <Link
                key={route.href}
                href={isAllowed ? route.href : "#"}
                onClick={(e) => {
                  if (!isAllowed) {
                    e.preventDefault();
                    // Optional: toast warning
                  }
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
    </div>
  );
}
