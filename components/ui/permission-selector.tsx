"use client";

import { useAvailablePermissions } from "@/hooks/staff/use-staff";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface PermissionSelectorProps {
  selectedPermissions: string[];
  onChange: (permissions: string[]) => void;
  className?: string;
}

/**
 * A grouped checkbox selector for system permissions.
 * Fetches available permissions from the API.
 */
export function PermissionSelector({
  selectedPermissions,
  onChange,
  className,
}: PermissionSelectorProps) {
  const { data: permissionGroups, isLoading } = useAvailablePermissions();

  const togglePermission = (id: string) => {
    if (selectedPermissions.includes(id)) {
      onChange(selectedPermissions.filter((p) => p !== id));
    } else {
      onChange([...selectedPermissions, id]);
    }
  };

  const toggleGroup = (groupId: string, permissionIds: string[]) => {
    const allSelected = permissionIds.every((id) =>
      selectedPermissions.includes(id),
    );
    if (allSelected) {
      onChange(selectedPermissions.filter((id) => !permissionIds.includes(id)));
    } else {
      const newPermissions = Array.from(
        new Set([...selectedPermissions, ...permissionIds]),
      );
      onChange(newPermissions);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 border rounded-lg border-dashed">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mr-2" />
        <span className="text-sm text-muted-foreground">
          Loading permissions...
        </span>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {permissionGroups?.map((group) => (
        <div key={group.group} className="space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-border">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-brand-blue" />
              {group.group}
            </h4>
            <button
              type="button"
              onClick={() =>
                toggleGroup(
                  group.group,
                  group.permissions.map((p) => p.id),
                )
              }
              className="text-xs text-brand-blue hover:underline font-medium"
            >
              {group.permissions.every((p) =>
                selectedPermissions.includes(p.id),
              )
                ? "Deselect All"
                : "Select All"}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {group.permissions.map((permission) => (
              <div
                key={permission.id}
                className={cn(
                  "relative flex items-start space-x-3 rounded-lg border p-4 transition-all hover:border-brand-blue/30 cursor-pointer",
                  selectedPermissions.includes(permission.id)
                    ? "bg-brand-blue/5 border-brand-blue/30"
                    : "bg-white border-border",
                )}
                onClick={() => togglePermission(permission.id)}
              >
                <div className="flex h-5 items-center">
                  <Checkbox
                    checked={selectedPermissions.includes(permission.id)}
                    onChange={() => togglePermission(permission.id)}
                    className="data-[state=checked]:bg-brand-blue data-[state=checked]:border-brand-blue"
                  />
                </div>
                <div className="grid gap-1.5 leading-none">
                  <Label
                    className={cn(
                      "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer",
                      selectedPermissions.includes(permission.id)
                        ? "text-brand-blue"
                        : "text-foreground",
                    )}
                  >
                    {permission.name}
                  </Label>
                  <p className="text-xs text-muted-foreground leading-normal">
                    {permission.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
