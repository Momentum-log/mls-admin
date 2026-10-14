/**
 * System-wide audit log (`GET /admin/activity-logs`).
 */

export interface ActivityLogEntry {
  id: string;
  adminId: string | null;
  userId: string | null;
  actorType: "ADMIN" | "USER" | string;
  action: string;
  resource: string;
  details: unknown;
  ipAddress: string | null;
  timestamp: string;
  admin: { id: string; name: string; email: string; adminCode?: string } | null;
}

export interface ActivityLogFilters {
  adminId?: string;
  userId?: string;
  actorType?: string;
  action?: string;
  page: number;
  limit: number;
}
