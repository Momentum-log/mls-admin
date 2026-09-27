"use client";

import { cloneElement, isValidElement, type ReactElement } from "react";
import { usePermissions } from "@/hooks/use-permissions";

interface CanProps {
  /** Permission(s) required. A single string, or several. */
  do: string | string[];
  /**
   * With several permissions, require all of them rather than any one.
   * Some server routes chain two guards — `GET /admin/shipments` needs both
   * `user:read` and `shipment:read` — so "any" would be too permissive.
   */
  all?: boolean;
  /** Super Admin only, ignoring granted permissions. */
  superAdminOnly?: boolean;
  /**
   * What to do when the check fails.
   *
   * `hide` removes the control. `disable` renders it greyed out with a
   * tooltip naming the missing permission, which is usually kinder — staff
   * learn the capability exists and can ask for access, rather than
   * concluding the feature is missing. Use `hide` when the control's mere
   * presence would be confusing or leak something.
   */
  fallback?: "hide" | "disable";
  children: ReactElement<{ disabled?: boolean; title?: string }>;
}

/**
 * Gates a control on the current admin's permissions.
 *
 * This mirrors what the server will allow, so an admin is not offered a
 * button that answers 403. It is not a security boundary — every admin
 * mutation is independently gated by `requirePermission` server-side.
 *
 * ```tsx
 * <Can do="shipment:write"><Button>Delete</Button></Can>
 * <Can do={["user:read", "shipment:read"]} all>…</Can>
 * <Can do="carrier:write" fallback="disable"><Button>Save</Button></Can>
 * ```
 */
export function Can({
  do: required,
  all = false,
  superAdminOnly = false,
  fallback = "hide",
  children,
}: CanProps) {
  const { hasAllPermissions, hasAnyPermission, isSuperAdmin, isLoading } =
    usePermissions();

  const ids = Array.isArray(required) ? required : [required];

  // While the session is loading nothing is known, so show nothing rather
  // than flashing a control that is about to vanish.
  if (isLoading) return null;

  const allowed = superAdminOnly
    ? isSuperAdmin
    : all
      ? hasAllPermissions(ids)
      : hasAnyPermission(ids);

  if (allowed) return children;
  if (fallback === "hide") return null;

  const reason = superAdminOnly
    ? "Super Admin only"
    : `Requires ${ids.join(all ? " and " : " or ")}`;

  if (!isValidElement(children)) return null;

  return cloneElement(children, { disabled: true, title: reason });
}

/**
 * Imperative form, for cases a wrapper cannot express — a `disabled`
 * expression combining permissions with other state, or a handler that must
 * bail early.
 */
export function useCan() {
  const { hasPermission, hasAllPermissions, hasAnyPermission, isSuperAdmin } =
    usePermissions();

  return { can: hasPermission, canAll: hasAllPermissions, canAny: hasAnyPermission, isSuperAdmin };
}
