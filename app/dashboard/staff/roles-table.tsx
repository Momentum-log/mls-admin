"use client";

import { useState } from "react";
import {
  useRoles,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
} from "@/hooks/staff/use-staff";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Plus,
  Info,
  Edit,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PermissionSelector } from "@/components/ui/permission-selector";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Role } from "@/types/staff";
import { SUPER_ADMIN_ROLE_NAME } from "@/lib/rbac";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RolesTable() {
  const { data: roles, isLoading } = useRoles();
  const { mutate: createRole, isPending: isCreating } = useCreateRole();
  const { mutate: updateRole, isPending: isUpdating } = useUpdateRole();
  const { mutate: deleteRole } = useDeleteRole();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleData, setRoleData] = useState({
    name: "",
    permissions: [] as string[],
  });
  const [deleteConfirm, setDeleteConfirm] = useState<Role | null>(null);

  const handleOpenCreate = () => {
    setEditingRole(null);
    setRoleData({ name: "", permissions: [] });
    setDialogOpen(true);
  };

  const handleOpenEdit = (role: Role) => {
    setEditingRole(role);
    setRoleData({ name: role.name, permissions: role.permissions });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!roleData.name) return;

    if (editingRole) {
      updateRole(
        {
          id: editingRole.id,
          payload: { name: roleData.name, permissions: roleData.permissions },
        },
        {
          onSuccess: () => {
            setDialogOpen(false);
          },
        },
      );
    } else {
      createRole(roleData, {
        onSuccess: () => {
          setDialogOpen(false);
          setRoleData({ name: "", permissions: [] });
        },
      });
    }
  };

  const handleDelete = (force: boolean) => {
    if (!deleteConfirm) return;
    deleteRole(deleteConfirm.id, {
      onSuccess: () => setDeleteConfirm(null),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Roles & Permissions</h3>
        <Button onClick={handleOpenCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Create Role
        </Button>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Role Name</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={2} className="h-24 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                </TableCell>
              </TableRow>
            ) : roles?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="h-24 text-center">
                  No roles found.
                </TableCell>
              </TableRow>
            ) : (
              roles?.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium whitespace-nowrap">
                    {r.name}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 text-muted-foreground italic">
                      {r.permissions.length === 0 ? (
                        <span className="text-xs">No permissions assigned</span>
                      ) : (
                        r.permissions.map((p, idx) => (
                          <span
                            key={idx}
                            className="bg-secondary text-secondary-foreground px-2 py-0.5 rounded-md text-[10px] font-mono"
                          >
                            {p}
                          </span>
                        ))
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {r.name !== SUPER_ADMIN_ROLE_NAME && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenEdit(r)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Role
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={() => setDeleteConfirm(r)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Role
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingRole ? "Edit Role" : "Create Custom Role"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Role Name</Label>
              <Input
                value={roleData.name}
                onChange={(e) =>
                  setRoleData({ ...roleData, name: e.target.value })
                }
                placeholder="e.g. Support Agent"
                disabled={editingRole?.name === SUPER_ADMIN_ROLE_NAME}
              />
            </div>
            <div className="space-y-2">
              <Label>Permissions</Label>
              <ScrollArea className="h-[400px] rounded-md border p-4">
                <PermissionSelector
                  selectedPermissions={roleData.permissions}
                  onChange={(perms) =>
                    setRoleData({ ...roleData, permissions: perms })
                  }
                />
              </ScrollArea>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isCreating || isUpdating || !roleData.name}
            >
              {(isCreating || isUpdating) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {editingRole ? "Save Changes" : "Create Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
        title="Delete Role"
        description={`Are you sure you want to delete the "${deleteConfirm?.name}" role? This cannot be undone and will fail if any staff members are currently assigned to it.`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  );
}
