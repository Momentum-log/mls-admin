import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUsers,
  updateUserStatus,
  verifyUser,
  deleteUser,
} from "@/api/users";
import { UserFilter, UpdateUserStatusPayload } from "@/types/user";
import { toast } from "react-hot-toast";
import { getApiErrorMessage } from "@/lib/api-error";

/**
 * Hook to fetch a paginated list of users with optional filters.
 */
export const useUsers = (filters: UserFilter) => {
  return useQuery({
    queryKey: ["users", filters],
    queryFn: () => getUsers(filters),
    placeholderData: (previousData) => previousData,
  });
};

/**
 * Mutation hook for any moderation status change — ban, restore, flag, warn.
 */
export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string;
      data: UpdateUserStatusPayload;
    }) => updateUserStatus(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User status updated successfully");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Failed to update user status"));
    },
  });
};

/**
 * Mutation hook for manually verifying a user.
 */
export const useVerifyUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => verifyUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User verified successfully");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Failed to verify user"));
    },
  });
};

/**
 * Mutation hook for deleting a user.
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User deleted successfully");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Failed to delete user"));
    },
  });
};
