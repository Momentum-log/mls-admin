"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUsers, useBanUser, useVerifyUser } from "@/hooks/users/use-users";
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
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

  const { data, isLoading } = useUsers({
    page,
    limit: 10,
    search: debouncedSearch,
    status: status === "ALL" ? undefined : status,
  });

  const { mutate: banUser } = useBanUser();
  const { mutate: verifyUser } = useVerifyUser();

  // Dialog state
  const [confirmAction, setConfirmAction] = useState<{
    type: "ban" | "verify";
    user: User;
  } | null>(null);

  const handleConfirm = () => {
    if (!confirmAction) return;
    if (confirmAction.type === "ban") {
      banUser({
        userId: confirmAction.user.id,
        data: { status: "BANNED", banType: "FULL" },
      });
    } else {
      verifyUser(confirmAction.user.id);
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
          <SelectTrigger className="w-[180px]">
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
              <TableHead>Name</TableHead>
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
                          Copy User Code
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() =>
                            setConfirmAction({ type: "verify", user })
                          }
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Manual Verify
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() =>
                            setConfirmAction({ type: "ban", user })
                          }
                        >
                          <ShieldAlert className="mr-2 h-4 w-4" />
                          Ban User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1 || isLoading}
        >
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {page}
          {data?.pagination?.totalPages
            ? ` of ${data.pagination.totalPages}`
            : ""}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => p + 1)}
          disabled={
            !data ||
            data.users.length < 10 ||
            page >= (data.pagination?.totalPages ?? Infinity) ||
            isLoading
          }
        >
          Next
        </Button>
      </div>

      {/* Confirm Dialog for ban/verify */}
      {confirmAction && (
        <ConfirmDialog
          open={!!confirmAction}
          onOpenChange={(open) => {
            if (!open) setConfirmAction(null);
          }}
          title={
            confirmAction.type === "ban" ? "Ban User" : "Manually Verify User"
          }
          description={
            confirmAction.type === "ban"
              ? `Are you sure you want to ban ${confirmAction.user.name}? This will restrict their access.`
              : `Manually verify ${confirmAction.user.name}'s email? This action cannot be undone.`
          }
          confirmLabel={confirmAction.type === "ban" ? "Ban" : "Verify"}
          destructive={confirmAction.type === "ban"}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
}
