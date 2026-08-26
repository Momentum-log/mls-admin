import { useMemo } from "react";
import { useMe } from "./auth/use-auth";
import { SUPERUSER_WILDCARD, SUPER_ADMIN_ROLE_NAME } from "@/lib/rbac";

/**
 * Normalises whatever `/auth/me` returned into a string array.
 *
 * `Role.permissions` is a Prisma `Json` column, so nothing at the database
 * level guarantees its shape. A role saved with a stringified array would
 * arrive here as a string, and `"...".includes("user:write")` does substring
 * matching — which would silently grant permissions that were never assigned.
 * Parsing defensively closes that off.
 *
 * @param raw - The `permissions` value from the session payload.
 */
function normalisePermissions(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.filter((p): p is string => typeof p === "string");
  }

  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed)
        ? parsed.filter((p): p is string => typeof p === "string")
        : [];
    } catch {
      return [];
    }
  }

  return [];
}

/**
 * Permission checks for the current admin session.
 *
 * Mirrors the server's `RbacService.hasPermission` exactly — a permission is
 * granted by the `*` wildcard, an exact match, or a `<resource>:*` wildcard.
 * Keeping the two in step matters: this layer decides what an admin is shown,
 * and the server decides what they can actually do. Divergence means either
 * controls that 403 on click, or controls hidden from someone entitled to use
 * them.
 *
 * This is a usability boundary, not a security one. The server enforces
 * independently.
 */
export const usePermissions = () => {
  const { data: user, isLoading } = useMe();

  const permissions = useMemo(
    () => normalisePermissions(user?.permissions),
    [user?.permissions],
  );

  /**
   * Super Admin is identified by the wildcard rather than the role name.
   * Matching on the name broke the moment anyone renamed the role — it
   * simultaneously revoked super-admin access and unlocked the staff rows
   * that were protected by the same comparison. The name check is kept only
   * as a fallback for a session whose permissions failed to load.
   */
  const isSuperAdmin =
    permissions.includes(SUPERUSER_WILDCARD) ||
    (permissions.length === 0 && user?.role === SUPER_ADMIN_ROLE_NAME);

  const hasPermission = useMemo(
    () =>
      (permissionId?: string): boolean => {
        if (isSuperAdmin) return true;
        if (!permissionId) return false;
        if (permissions.includes(permissionId)) return true;

        // `shipment:*` grants `shipment:read`, `shipment:write`, and so on.
        const resource = permissionId.split(":")[0];
        return permissions.includes(`${resource}:*`);
      },
    [permissions, isSuperAdmin],
  );

  const hasAnyPermission = useMemo(
    () =>
      (permissionIds: string[]): boolean =>
        isSuperAdmin || permissionIds.some((id) => hasPermission(id)),
    [hasPermission, isSuperAdmin],
  );

  const hasAllPermissions = useMemo(
    () =>
      (permissionIds: string[]): boolean =>
        isSuperAdmin || permissionIds.every((id) => hasPermission(id)),
    [hasPermission, isSuperAdmin],
  );

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isSuperAdmin,
    isLoading,
    permissions,
    role: user?.role,
  };
};
