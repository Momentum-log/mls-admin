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

export interface BanUserPayload {
  status: "BANNED";
  banType: "FULL" | "PARTIAL";
}
