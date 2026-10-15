export interface ActivityLog {
  id: string;
  adminId: string | null;
  userId: string | null;
  actorType: "ADMIN" | "USER";
  action: string;
  resource: string;
  /** Free-form JSON the server stores with the action; sometimes a JSON string. */
  details?: unknown;
  ipAddress?: string;
  timestamp: string;
}

export interface ActivityLogsResponse {
  logs: ActivityLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
