"use client";

import { useState } from "react";
import {
  useStaff,
  useCreateStaff,
  useSuspendStaff,
  useEnableStaff,
  useDeleteStaff,
  useAssignStaffRole,
  useRoles,
} from "@/hooks/staff/use-staff";
import { Staff } from "@/types/staff";
import { formatDate } from "@/utils/format-date";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
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
  MoreHorizontal,
  ShieldOff,
  ShieldCheck,
  Trash2,
  Edit,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import StaffDetailSheet from "@/components/staff/staff-detail-sheet";
import { PermissionSelector } from "@/components/ui/permission-selector";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export default function StaffTable() {
  const { data: staffList, isLoading } = useStaff();
  const { data: roles } = useRoles();

  const { mutate: createStaff, isPending: isCreating } = useCreateStaff();
  const { mutate: suspendStaff } = useSuspendStaff();
  const { mutate: enableStaff } = useEnableStaff();
  const { mutate: deleteStaff } = useDeleteStaff();
  const { mutate: assignRole } = useAssignStaffRole();

  const [createOpen, setCreateOpen] = useState(false);
  const [isInlineRole, setIsInlineRole] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: "",
    email: "",
    roleId: "",
    inlineRole: { name: "", permissions: [] as string[] },
  });

  const [confirmAction, setConfirmAction] = useState<{
    type: "suspend" | "enable" | "delete";
    staff: Staff;
  } | null>(null);

  const [assignRoleOpen, setAssignRoleOpen] = useState<{
    staff: Staff;
    roleId: string;
    notify: boolean;
  } | null>(null);

  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleRowClick = (staff: Staff, e?: React.MouseEvent) => {
    setSelectedStaff(staff);
    setIsSheetOpen(true);
  };

  const handleCreate = () => {
    if (!newStaff.name || !newStaff.email) return;
    if (!isInlineRole && !newStaff.roleId) return;
    if (isInlineRole && !newStaff.inlineRole.name) return;

    createStaff(
      {
        name: newStaff.name,
        email: newStaff.email,
        roleId: isInlineRole ? undefined : newStaff.roleId,
        inlineRole: isInlineRole ? newStaff.inlineRole : undefined,
      },
      {
        onSuccess: () => {
          setCreateOpen(false);
          setIsInlineRole(false);
          setNewStaff({
            name: "",
            email: "",
            roleId: "",
            inlineRole: { name: "", permissions: [] },
          });
        },
      },
    );
  };

  const handleConfirmAction = () => {
    if (!confirmAction) return;
    if (confirmAction.type === "suspend") suspendStaff(confirmAction.staff.id);
    if (confirmAction.type === "enable") enableStaff(confirmAction.staff.id);
    if (confirmAction.type === "delete") deleteStaff(confirmAction.staff.id);
    setConfirmAction(null);
  };

  const handleAssignRole = () => {
    if (!assignRoleOpen) return;
    assignRole(
      {
        id: assignRoleOpen.staff.id,
        payload: {
          roleId: assignRoleOpen.roleId,
          notify: assignRoleOpen.notify,
        },
      },
      { onSuccess: () => setAssignRoleOpen(null) },
    );
  };

  // Prevent actions on yourself or Super Admin
  const isProtected = (s: Staff) => s.role.name === "Super Admin";

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Staff Members</h3>
        <Button onClick={() => setCreateOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Add Staff
        </Button>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Admin Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                </TableCell>
              </TableRow>
            ) : staffList?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No staff members found.
                </TableCell>
              </TableRow>
            ) : (
              staffList?.map((s) => (
                <TableRow
                  key={s.id}
                  className="group cursor-pointer hover:bg-muted/50"
                  onClick={(e) => handleRowClick(s, e)}
                >
                  <TableCell className="font-mono text-sm">
                    {s.adminCode}
                  </TableCell>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell>{s.email}</TableCell>
                  <TableCell>{s.role.name}</TableCell>
                  <TableCell>
                    {s.isActive ? (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100/80">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="destructive">Suspended</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {s.lastActive ? formatDate(s.lastActive) : "Never"}
                  </TableCell>
                  <TableCell
                    className="text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {!isProtected(s) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleRowClick(s)}>
                            <Edit className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              setAssignRoleOpen({
                                staff: s,
                                roleId: s.role.id,
                                notify: true,
                              })
                            }
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Change Role
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {s.isActive ? (
                            <DropdownMenuItem
                              className="text-orange-600 focus:text-orange-600"
                              onClick={() =>
                                setConfirmAction({ type: "suspend", staff: s })
                              }
                            >
                              <ShieldOff className="mr-2 h-4 w-4" />
                              Suspend
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              className="text-green-600 focus:text-green-600"
                              onClick={() =>
                                setConfirmAction({ type: "enable", staff: s })
                              }
                            >
                              <ShieldCheck className="mr-2 h-4 w-4" />
                              Enable
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={() =>
                              setConfirmAction({ type: "delete", staff: s })
                            }
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
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

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Staff Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={newStaff.name}
                onChange={(e) =>
                  setNewStaff({ ...newStaff, name: e.target.value })
                }
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={newStaff.email}
                onChange={(e) =>
                  setNewStaff({ ...newStaff, email: e.target.value })
                }
                placeholder="john@example.com"
              />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Create Custom Role</Label>
                  <p className="text-[0.7rem] text-muted-foreground">
                    Define permissions inline for this staff member as a new
                    role
                  </p>
                </div>
                <Switch
                  checked={isInlineRole}
                  onCheckedChange={setIsInlineRole}
                />
              </div>

              {isInlineRole ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="space-y-2">
                    <Label>New Role Name</Label>
                    <Input
                      value={newStaff.inlineRole.name}
                      onChange={(e) =>
                        setNewStaff({
                          ...newStaff,
                          inlineRole: {
                            ...newStaff.inlineRole,
                            name: e.target.value,
                          },
                        })
                      }
                      placeholder="e.g., Customer Support Tier 2"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Permissions</Label>
                    <ScrollArea className="h-[250px] rounded-md border p-4">
                      <PermissionSelector
                        selectedPermissions={newStaff.inlineRole.permissions}
                        onChange={(perms) =>
                          setNewStaff({
                            ...newStaff,
                            inlineRole: {
                              ...newStaff.inlineRole,
                              permissions: perms,
                            },
                          })
                        }
                      />
                    </ScrollArea>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Initial Role</Label>
                  <Select
                    value={newStaff.roleId}
                    onValueChange={(val) =>
                      setNewStaff({ ...newStaff, roleId: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles?.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={
                isCreating ||
                !newStaff.name ||
                !newStaff.email ||
                (!isInlineRole && !newStaff.roleId) ||
                (isInlineRole && !newStaff.inlineRole.name)
              }
            >
              {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isInlineRole ? "Create Role & Staff" : "Create Staff"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!assignRoleOpen}
        onOpenChange={(open) => !open && setAssignRoleOpen(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Change Role for {assignRoleOpen?.staff.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Select New Role</Label>
                <Select
                  value={assignRoleOpen?.roleId}
                  onValueChange={(val) =>
                    setAssignRoleOpen((prev) =>
                      prev ? { ...prev, roleId: val } : null,
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles?.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notify Staff Member</Label>
                  <p className="text-xs text-muted-foreground">
                    Send an email notification about this role change
                  </p>
                </div>
                <Switch
                  checked={assignRoleOpen?.notify}
                  onCheckedChange={(checked) =>
                    setAssignRoleOpen((prev) =>
                      prev ? { ...prev, notify: checked } : null,
                    )
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignRoleOpen(null)}>
              Cancel
            </Button>
            <Button onClick={handleAssignRole}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {confirmAction && (
        <ConfirmDialog
          open={!!confirmAction}
          onOpenChange={(open) => !open && setConfirmAction(null)}
          title={
            confirmAction.type === "suspend"
              ? "Suspend Staff"
              : confirmAction.type === "enable"
                ? "Enable Staff"
                : "Delete Staff"
          }
          description={
            confirmAction.type === "suspend"
              ? `Are you sure you want to suspend ${confirmAction.staff.name}? They will lose access immediately.`
              : confirmAction.type === "enable"
                ? `Restore access for ${confirmAction.staff.name}?`
                : `Are you sure you want to permanently delete ${confirmAction.staff.name}? This action cannot be undone.`
          }
          confirmLabel={confirmAction.type === "delete" ? "Delete" : "Confirm"}
          destructive={
            confirmAction.type === "delete" || confirmAction.type === "suspend"
          }
          onConfirm={handleConfirmAction}
        />
      )}

      <StaffDetailSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        staff={selectedStaff}
      />
    </div>
  );
}
