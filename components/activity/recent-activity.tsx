"use client";

import { useState } from "react";
import { useActivityLogs } from "@/hooks/admin/use-activity-logs";
import { useCan } from "@/components/auth/can";
import { formatDateTime } from "@/utils/format-date";
import { Pager } from "@/components/admin/pager";
import { ActivityDetails, formatAction } from "./activity-details";
import { History, Loader2 } from "lucide-react";

/**
 * What one staff member has done, newest first. Reading the log needs
 * `staff:read`, the same as the staff page itself.
 */
export function RecentActivity({ adminId }: { adminId: string }) {
  const [page, setPage] = useState(1);
  const { can } = useCan();
  const allowed = can("staff:read");
  const { data, isLoading, isFetching } = useActivityLogs(
    { adminId, page, limit: 15 },
    allowed,
  );
  const entries = data?.data ?? [];

  if (!allowed) {
    return <p className="text-sm text-muted-foreground">Requires staff:read.</p>;
  }
  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-brand-blue" />
      </div>
    );
  }
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
        <History className="h-8 w-8 opacity-30" />
        <p className="text-sm">No recorded activity.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ol className="space-y-3">
        {entries.map((entry) => (
          <li key={entry.id} className="rounded-md border p-3">
            <div className="flex justify-between gap-3 text-sm">
              <span className="font-medium">{formatAction(entry.action)}</span>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formatDateTime(entry.timestamp)}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">{entry.resource}</span>
            <div className="mt-1">
              <ActivityDetails details={entry.details} />
            </div>
          </li>
        ))}
      </ol>
      <Pager page={page} pagination={data?.pagination} onPageChange={setPage} isLoading={isFetching} />
    </div>
  );
}
