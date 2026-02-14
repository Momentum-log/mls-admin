"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, Package, Mail } from "lucide-react";

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    label: "Users",
    icon: Users,
    href: "/dashboard/users",
  },
  {
    label: "Shipments",
    icon: Package,
    href: "/dashboard/shipments",
  },
  {
    label: "Marketing Leads",
    icon: Mail,
    href: "/dashboard/leads",
  },
];

/**
 * Admin sidebar navigation — light theme with brand-blue active states.
 */
export function AdminSidebar() {
  const pathname = usePathname();

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
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer rounded-lg transition",
                pathname === route.href
                  ? "bg-brand-blue/10 text-brand-blue"
                  : "text-muted-foreground hover:text-brand-blue hover:bg-brand-blue/5",
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className="h-5 w-5 mr-3" />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
