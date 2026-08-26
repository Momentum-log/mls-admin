export interface User {
  id: string;
  email: string;
  name: string;
  userCode?: string;
  status: "ACTIVE" | "FLAGGED" | "WARNED" | "BANNED";
  banType: "NONE" | "PARTIAL" | "FULL";
  is_verified: boolean;
  is_phone_verified: boolean;
  createdAt: string;
  /** Last time the user logged in. May be null if never logged in. */
  lastLoginAt?: string | null;
  /** Last time the user was active. May be null if never active yet. */
  lastActiveAt?: string | null;
}

export interface UserListResponse {
  users: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UserFilter {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export type UserStatus = "ACTIVE" | "FLAGGED" | "WARNED" | "BANNED";
export type BanType = "NONE" | "PARTIAL" | "FULL";

/**
 * Payload for `PUT /admin/users/:id/status`.
 *
 * Mirrors the server's `UserStatusUpdate`. An earlier revision typed `status`
 * as the literal `"BANNED"`, which made banning irreversible from the UI —
 * there was no shape that could express restoring an account.
 *
 * `banType` should be `NONE` for any non-banned status.
 */
export interface UpdateUserStatusPayload {
  status: UserStatus;
  banType?: BanType;
}

/** @deprecated Use `UpdateUserStatusPayload`. */
export type BanUserPayload = UpdateUserStatusPayload;
