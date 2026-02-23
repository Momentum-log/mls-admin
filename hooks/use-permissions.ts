import { useMe } from "./auth/use-auth";

/**
 * Hook to check if the currently logged-in admin has a specific permission.
 */
export const usePermissions = () => {
  const { data: user, isLoading } = useMe();

  const hasPermission = (permissionId: string): boolean => {
    // Super Admin has all permissions
    if (user?.role === "Super Admin") return true;

    // Check if the permission exists in the user's permission array
    return user?.permissions?.includes(permissionId) ?? false;
  };

  const hasAnyPermission = (permissionIds: string[]): boolean => {
    if (user?.role === "Super Admin") return true;
    return permissionIds.some((id) => user?.permissions?.includes(id));
  };

  const hasAllPermissions = (permissionIds: string[]): boolean => {
    if (user?.role === "Super Admin") return true;
    return permissionIds.every((id) => user?.permissions?.includes(id));
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isLoading,
    permissions: user?.permissions || [],
    role: user?.role,
  };
};
