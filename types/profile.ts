import type { User } from "@/types/auth";

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

/** `GET /admin/staff/me/profile`. */
export interface MyProfile extends User {
  adminCode?: string;
  /** A temporary password is in use: the console is locked until it is replaced. */
  mustChangePassword: boolean;
  passwordChangedAt: string | null;
  /** When the next self-service change opens up; null when one is allowed now. */
  nextPasswordChangeAt: string | null;
}
