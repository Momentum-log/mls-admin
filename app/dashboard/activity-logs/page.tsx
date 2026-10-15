"use client";

import { useState } from "react";
import { useActivityLogs } from "@/hooks/admin/use-activity-logs";
import { useStaff } from "@/hooks/staff/use-staff";
import { useDebounce } from "@/hooks/use-debounce";
import { formatDateTime } from "@/utils/format-date";
import { Pager } from "@/components/admin/pager";
import { ActivityDetails, formatAction } from "@/components/activity/activity-details";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { History, Loader2, Search } from "lucide-react";

/**
 * Everything staff and customers did that the server audits: sign-ins,
 * settings changes, approvals, deletions. Read-only.
 */
export default function ActivityLogsPage() {
  const [actorType, setActorType] = useState("ALL");
  const [adminId, setAdminId] = useState("ALL");
  const [action, setAction] = useState("");
  const debouncedAction = useDebounce(action, 400);
  const [page, setPage] = useState(1);
  const limit = 30;

  const { data: staff = [] } = useStaff();
  const { data, isLoading, isFetching } = useActivityLogs({
    actorType: actorType === "ALL" ? undefined : actorType,
    adminId: adminId === "ALL" ? undefined : adminId,
    action: debouncedAction.trim().toUpperCase().replaceAll(" ", "_"),
    page,
    limit,
  });
  const entries = data?.data ?? [];

  const resetPage = <T,>(set: (value: T) => void) => (value: T) => {
    set(value);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Activity Log</h2>
        <p className="text-muted-foreground">Who did what, newest first.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-8 w-64"
            placeholder="Action, e.g. approve refund"
            value={action}
            onChange={(e) => resetPage(setAction)(e.target.value)}
          />
        </div>
        <Select value={actorType} onValueChange={resetPage(setActorType)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Staff and customers</SelectItem>
            <SelectItem value="ADMIN">Staff only</SelectItem>
            <SelectItem value="USER">Customers only</SelectItem>
          </SelectContent>
        </Select>
        <Select value={adminId} onValueChange={resetPage(setAdminId)}>
          <SelectTrigger className="w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Any staff member</SelectItem>
            {staff.map((member) => (
              <SelectItem key={member.id} value={member.id}>
                {member.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[170px]">When</TableHead>
              <TableHead>Who</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>IP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-brand-blue" />
                </TableCell>
              </TableRow>
            ) : entries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <History className="h-10 w-10 opacity-20" />
                    <p className="font-medium">Nothing recorded for these filters.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              entries.map((entry) => (
                <TableRow key={entry.id} className="align-top">
                  <TableCell className="text-sm whitespace-nowrap">
                    {formatDateTime(entry.timestamp)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {entry.admin ? (
                      <>
                        <span className="font-medium">{entry.admin.name}</span>
                        <span className="block text-xs text-muted-foreground">
                          {entry.admin.email}
                        </span>
                      </>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        {entry.actorType === "USER" ? "Customer" : entry.actorType}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    <span className="font-medium">{formatAction(entry.action)}</span>
                    <span className="block text-xs text-muted-foreground">{entry.resource}</span>
                  </TableCell>
                  <TableCell>
                    <ActivityDetails details={entry.details} />
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {entry.ipAddress ?? "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Pager page={page} pagination={data?.pagination} onPageChange={setPage} isLoading={isFetching} />
    </div>
  );
}
