"use client";

import { usePathname, useRouter } from "next/navigation";
import { usePermissions } from "@/hooks/use-permissions";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const routePermissions: Record<string, string> = {
  "/dashboard/users": "user:read",
  "/dashboard/staff": "staff:read",
  "/dashboard/shipments": "shipment:read",
  "/dashboard/leads": "leads:read",
  "/dashboard/carriers": "carrier:read",
  "/dashboard/settings": "email:read",
};

/**
 * Guard component that redirects to /dashboard/denied if the user
 * lacks permission for the current sub-route.
 */
export function PermissionGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { hasPermission, isLoading } = usePermissions();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    // Find if current path starts with any of our guarded routes
    const guardedRoute = Object.keys(routePermissions).find(
      (route) => pathname === route || pathname.startsWith(`${route}/`),
    );

    if (guardedRoute) {
      if (!hasPermission(routePermissions[guardedRoute])) {
        router.push("/dashboard/denied");
      } else {
        setIsAuthorized(true);
      }
    } else {
      setIsAuthorized(true);
    }
  }, [pathname, isLoading, hasPermission, router]);

  if (isLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
      </div>
    );
  }

  if (
    !isAuthorized &&
    Object.keys(routePermissions).some((route) => pathname.startsWith(route))
  ) {
    return null; // Don't flash unauthorized content while redirecting
  }

  return <>{children}</>;
}
