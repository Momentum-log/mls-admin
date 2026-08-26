"use client";

import { usePathname, useRouter } from "next/navigation";
import { usePermissions } from "@/hooks/use-permissions";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

/**
 * Permissions required to open each route.
 *
 * An array means every listed permission is required, matching routes where
 * the server chains more than one `requirePermission` guard. Getting this
 * wrong in the permissive direction lets an admin open a page whose every
 * request then 403s.
 */
const routePermissions: Record<string, string | string[]> = {
  // The server chains `user:read` AND `shipment:read` on GET /admin/shipments.
  "/dashboard/shipments": ["user:read", "shipment:read"],
  // Likewise `user:read` AND `leads:read` on GET /admin/leads.
  "/dashboard/leads": ["user:read", "leads:read"],
  "/dashboard/multi-leg": "shipment:read",
  "/dashboard/users": "user:read",
  "/dashboard/address-requests": "user:read",
  "/dashboard/staff": "staff:read",
  "/dashboard/carriers": "carrier:read",
  "/dashboard/hub": "staff:read",
  // Not a typo — the server gates even the GET on `staff:write`.
  "/dashboard/settings": "staff:write",
  "/dashboard/emails": "email:read",
  "/dashboard/inquiries": "inquiries:read",
  "/dashboard/activity-logs": "staff:read",
  "/dashboard/invoices": "shipment:read",
  "/dashboard/refunds": "shipment:read",
  "/dashboard/tax-rules": "shipment:read",
  // Least specific, so it only applies to the overview itself and to any
  // sub-route not named above.
  "/dashboard": "dashboard:read",
};

/**
 * Routes always reachable by an authenticated admin, regardless of grants.
 * `/dashboard/security` self-guards on Super Admin inside the page.
 */
const UNGUARDED = ["/dashboard/denied", "/dashboard/security"];

/**
 * Redirects to the access-denied screen when the current admin lacks the
 * permissions for the route they opened.
 *
 * The sidebar already greys out what they cannot reach; this catches direct
 * URL entry. Neither is a security boundary — the server enforces separately.
 */
export function PermissionGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { hasAllPermissions, isLoading } = usePermissions();

  const isUnguarded = UNGUARDED.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  // Longest match wins. `/dashboard` is a prefix of every other entry, so
  // picking the first match would make the guard depend on key order.
  const guardedRoute = isUnguarded
    ? undefined
    : Object.keys(routePermissions)
        .filter(
          (route) => pathname === route || pathname.startsWith(`${route}/`),
        )
        .sort((a, b) => b.length - a.length)[0];

  const required = guardedRoute ? routePermissions[guardedRoute] : undefined;
  const isAuthorized =
    !required ||
    hasAllPermissions(Array.isArray(required) ? required : [required]);

  useEffect(() => {
    if (isLoading || isAuthorized) return;
    router.push("/dashboard/denied");
  }, [isLoading, isAuthorized, router]);

  if (isLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
      </div>
    );
  }

  // Render nothing while the redirect is in flight, so restricted content
  // never flashes on screen.
  if (!isAuthorized) return null;

  return <>{children}</>;
}
