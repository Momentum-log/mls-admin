"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useUsers,
  useUpdateUserStatus,
  useVerifyUser,
  useDeleteUser,
} from "@/hooks/users/use-users";
import { useDebounce } from "@/hooks/use-debounce";
import { User } from "@/types/user";
import { formatDate, formatRelativeTime } from "@/utils/format-date";
import CopyButton from "@/components/ui/copy-button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  ShieldAlert,
  CheckCircle,
  Loader2,
  Eye,
  BadgeCheck,
  BadgeX,
  Trash2,
  Copy,
  ShieldCheck,
} from "lucide-react";
import { Can } from "@/components/auth/can";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/** Confirmation copy per moderation action. */
const CONFIRM_COPY = {
  ban: {
    title: "Ban User",
    description: (name: string) =>
      `Ban ${name}? They lose access immediately. This is reversible — a banned user can be restored from the same menu.`,
    confirmLabel: "Ban",
    destructive: true,
  },
  unban: {
    title: "Restore Access",
    description: (name: string) =>
      `Restore ${name} to active? Their account and ban type are cleared and they can sign in again.`,
    confirmLabel: "Restore",
    destructive: false,
  },
  verify: {
    title: "Manually Verify User",
    description: (name: string) =>
      `Manually verify ${name}'s email? This cannot be undone.`,
    confirmLabel: "Verify",
    destructive: false,
  },
  delete: {
    title: "Delete User",
    description: (name: string) =>
      `Permanently delete ${name}? All their shipments, estimates, and data are lost forever.`,
    confirmLabel: "Delete",
    destructive: true,
  },
} as const;

/**
 * Users management page with search, filtering, pagination,
 * inline verification badges, copy buttons, and shadcn ConfirmDialog.
 */
export default function UsersPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("ALL");

  const debouncedSearch = useDebounce(search, 500);

  const [limit, setLimit] = useState(20);

  const { data, isLoading } = useUsers({
    page,
    limit,
    search: debouncedSearch,
    status: status === "ALL" ? undefined : status,
  });

  const { mutate: updateStatus } = useUpdateUserStatus();
  const { mutate: verifyUser } = useVerifyUser();
  const { mutate: deleteUser } = useDeleteUser();

  // Dialog state
  const [confirmAction, setConfirmAction] = useState<{
    type: "ban" | "unban" | "verify" | "delete";
    user: User;
  } | null>(null);

  const handleConfirm = () => {
    if (!confirmAction) return;
    const userId = confirmAction.user.id;

    switch (confirmAction.type) {
      case "ban":
        updateStatus({ userId, data: { status: "BANNED", banType: "FULL" } });
        break;
      case "unban":
        // Clearing banType alongside the status matters — leaving it set
        // would restore the account with a ban type still recorded against it.
        updateStatus({ userId, data: { status: "ACTIVE", banType: "NONE" } });
        break;
      case "verify":
        verifyUser(userId);
        break;
      case "delete":
        deleteUser(userId);
        break;
    }
    setConfirmAction(null);
  };

  /** Navigate to user details using userCode. */
  const navigateToUser = (user: User) => {
    const slug = user.userCode || user.id;
    router.push(`/dashboard/users/${slug}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Users</h2>
      </div>
      <div className="flex items-center space-x-2">
        <Input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-45">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="FLAGGED">Flagged</SelectItem>
            <SelectItem value="WARNED">Warned</SelectItem>
            <SelectItem value="BANNED">Banned</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-75">Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>User Code</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Last Login</TableHead>
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
            ) : data?.users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              data?.users.map((user: User) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <button
                      onClick={() => navigateToUser(user)}
                      className="font-medium text-brand-blue hover:underline cursor-pointer text-left"
                    >
                      {user.name}
                    </button>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">{user.email}</span>
                      {user.is_verified ? (
                        <BadgeCheck className="h-4 w-4 text-green-500 shrink-0" />
                      ) : (
                        <BadgeX className="h-4 w-4 text-red-500 shrink-0" />
                      )}
                      <CopyButton text={user.email} tooltipText="Copy email" />
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.userCode && (
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-mono">
                          {user.userCode}
                        </span>
                        <CopyButton
                          text={user.userCode}
                          tooltipText="Copy user code"
                        />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDate(user.createdAt)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {user.lastLoginAt
                      ? formatRelativeTime(user.lastLoginAt)
                      : "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {user.lastActiveAt
                      ? formatRelativeTime(user.lastActiveAt)
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => navigateToUser(user)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            navigator.clipboard.writeText(
                              user.userCode || user.id,
                            )
                          }
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Copy User Code
                        </DropdownMenuItem>
                        <Can do="user:write">
                          <DropdownMenuSeparator />
                        </Can>
                        <Can do="user:write">
                          <DropdownMenuItem
                            onClick={() =>
                              setConfirmAction({ type: "verify", user })
                            }
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Manual Verify
                          </DropdownMenuItem>
                        </Can>
                        {/* Banning is reversible now — a banned user gets a
                            restore action instead of a second ban. */}
                        <Can do="user:write">
                          {user.status === "BANNED" ? (
                            <DropdownMenuItem
                              className="text-green-700 focus:text-green-700"
                              onClick={() =>
                                setConfirmAction({ type: "unban", user })
                              }
                            >
                              <ShieldCheck className="mr-2 h-4 w-4" />
                              Restore Access
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() =>
                                setConfirmAction({ type: "ban", user })
                              }
                            >
                              <ShieldAlert className="mr-2 h-4 w-4" />
                              Ban User
                            </DropdownMenuItem>
                          )}
                        </Can>
                        <Can do="user:write">
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={() =>
                              setConfirmAction({ type: "delete", user })
                            }
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete User
                          </DropdownMenuItem>
                        </Can>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="mt-4 flex items-center justify-between px-2">
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground whitespace-nowrap">
            Showing page {page} of {data?.pagination.totalPages ?? 1} (
            {data?.pagination.total ?? 0} total users)
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              Rows per page:
            </span>
            <Select
              value={limit.toString()}
              onValueChange={(val) => {
                setLimit(parseInt(val));
                setPage(1);
              }}
            >
              <SelectTrigger className="h-8 w-17.5">
                <SelectValue placeholder={limit.toString()} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="30">30</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || isLoading}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= (data?.pagination.totalPages ?? 1) || isLoading}
          >
            Next
          </Button>
        </div>
      </div>
      {confirmAction && (
        <ConfirmDialog
          open={!!confirmAction}
          onOpenChange={(open) => {
            if (!open) setConfirmAction(null);
          }}
          title={CONFIRM_COPY[confirmAction.type].title}
          description={CONFIRM_COPY[confirmAction.type].description(
            confirmAction.user.name,
          )}
          confirmLabel={CONFIRM_COPY[confirmAction.type].confirmLabel}
          destructive={CONFIRM_COPY[confirmAction.type].destructive}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
}
