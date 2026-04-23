export interface ActivityLog {
  id: string;
  adminId: string | null;
  userId: string | null;
  actorType: "ADMIN" | "USER";
  action: string;
  resource: string;
  details?: any;
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
