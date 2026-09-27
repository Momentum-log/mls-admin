import apiClient from "../index";
import {
  UserListResponse,
  UserFilter,
  UpdateUserStatusPayload,
} from "@/types/user";

/**
 * Fetches a paginated list of users with optional filtering.
 */
export const getUsers = async (
  params: UserFilter,
): Promise<UserListResponse> => {
  const response = await apiClient.get<UserListResponse>("/admin/users", {
    params,
  });
  return response.data;
};

/**
 * Updates a user's moderation status.
 *
 * Handles the whole range the server accepts — active, flagged, warned and
 * banned, with a full or partial ban — so restoring an account is the same
 * call as banning one.
 *
 * @param userId - The user to update.
 * @param data - Target status, plus ban type when banning.
 */
export const updateUserStatus = async (
  userId: string,
  data: UpdateUserStatusPayload,
): Promise<void> => {
  await apiClient.put(`/admin/users/${userId}/status`, data);
};

/**
 * Manually verifies a user's identity.
 */
export const verifyUser = async (userId: string): Promise<void> => {
  await apiClient.post(`/admin/users/${userId}/verify`);
};

/**
 * Deletes a user profile and all associated data.
 *
 * @param userId - The UUID of the user to delete.
 */
export const deleteUser = async (userId: string): Promise<void> => {
  await apiClient.delete(`/admin/users/${userId}`);
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
