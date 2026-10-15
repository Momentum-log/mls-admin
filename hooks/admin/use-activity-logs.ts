import { useQuery } from "@tanstack/react-query";
import { getActivityLogs } from "@/lib/api/admin/activity-logs";
import type { ActivityLogFilters } from "@/types/activity-log";

/**
 * The audit log.
 *
 * @param filters - Paging and filters.
 * @param enabled - Stay idle until the caller has what it needs (e.g. a staff id).
 */
export const useActivityLogs = (filters: ActivityLogFilters, enabled = true) => {
  return useQuery({
    queryKey: ["activity-logs", filters],
    queryFn: () => getActivityLogs(filters),
    placeholderData: (previous) => previous,
    enabled,
  });
};
