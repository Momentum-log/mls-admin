import apiClient from "../index";
import {
  User,
  UserListResponse,
  UserFilter,
  BanUserPayload,
} from "@/types/user";

/**
 * Fetches a paginated list of users with optional filtering.
 */
export const getUsers = async (
  params: UserFilter,
): Promise<UserListResponse> => {
  const response = await apiClient.get<UserListResponse>("/users", { params });
  return response.data;
};

/**
 * Fetches a single user by searching their userCode.
 * Since there is no dedicated GET /users/:id endpoint yet,
 * this uses the search parameter to look up by user code.
 *
 * @param userCode - The unique user code (e.g., "MLS-U-15O8B2W6").
 * @returns The matching User, or null if not found.
 */
export const getUserByCode = async (userCode: string): Promise<User | null> => {
  const response = await apiClient.get<UserListResponse>("/users", {
    params: { search: userCode, limit: 1 },
  });
  const match = response.data.users.find((u) => u.userCode === userCode);
  return match ?? null;
};

/**
 * Updates a user's status (ban/flag/warn).
 */
export const banUser = async (
  userId: string,
  data: BanUserPayload,
): Promise<void> => {
  await apiClient.put(`/users/${userId}/status`, data);
};

/**
 * Manually verifies a user's identity.
 */
export const verifyUser = async (userId: string): Promise<void> => {
  await apiClient.post(`/users/${userId}/verify`);
};
