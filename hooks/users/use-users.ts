import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUsers,
  getUserByCode,
  banUser,
  verifyUser,
  deleteUser,
} from "@/api/users";
import { UserFilter, BanUserPayload } from "@/types/user";
import { toast } from "react-hot-toast";

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
 * Hook to fetch a single user by their unique userCode.
 * Uses the search endpoint as a workaround until a dedicated
 * GET /users/:code endpoint is available.
 *
 * @param userCode - The unique user code (e.g., "MLS-U-15O8B2W6").
 */
export const useUserByCode = (userCode: string) => {
  return useQuery({
    queryKey: ["user", userCode],
    queryFn: () => getUserByCode(userCode),
    enabled: !!userCode,
  });
};

/**
 * Mutation hook for banning/flagging a user.
 */
export const useBanUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: BanUserPayload }) =>
      banUser(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User status updated successfully");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to update user status",
      );
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
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to verify user");
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
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete user");
    },
  });
};
