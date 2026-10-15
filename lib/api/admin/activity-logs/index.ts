import apiClient from "../../index";
import { unwrapList } from "@/lib/api/_shared/envelope";
import type { Paged } from "@/types/api";
import type { ActivityLogEntry, ActivityLogFilters } from "@/types/activity-log";

/** The system-wide audit log, newest first. */
export const getActivityLogs = async (
  filters: ActivityLogFilters,
): Promise<Paged<ActivityLogEntry>> => {
  const { data } = await apiClient.get<unknown>("/admin/activity-logs", {
    params: { ...filters, action: filters.action || undefined },
  });
  return unwrapList<ActivityLogEntry>(data, "logs");
};
