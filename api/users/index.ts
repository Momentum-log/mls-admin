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

/**
 * Deletes a user profile and all associated data.
 *
 * @param userId - The UUID of the user to delete.
 */
export const deleteUser = async (userId: string): Promise<void> => {
  await apiClient.delete(`/users/${userId}`);
};

/**
 * Force deletes a user and cascades the deletion to all linked data.
 *
 * @param userId - The UUID of the user to delete.
 */
export const forceDeleteUser = async (userId: string): Promise<void> => {
  await apiClient.post(`/admin/users/${userId}/cascade`);
};

/**
 * Bulk deletes multiple users.
 *
 * @param ids - Array of user UUIDs to delete.
 * @param force - If true, bypasses safe delete checks.
 */
export const bulkDeleteUsers = async (
  ids: string[],
  force = false,
): Promise<void> => {
  await apiClient.post("/admin/users/bulk-delete", { ids, force });
};
