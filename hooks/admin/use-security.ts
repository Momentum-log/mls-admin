import { useMutation } from "@tanstack/react-query";
import { rotateSuperAdminPassword } from "@/api/admin/security";
import toast from "react-hot-toast";

/**
 * Hook to manage the Super Admin password rotation mutation.
 * Handles loading states and provides toast feedback on success or error.
 */
export const useRotatePassword = () => {
  return useMutation({
    mutationFn: (resetKey: string) => rotateSuperAdminPassword(resetKey),
    onSuccess: (data) => {
      toast.success(
        data.message || "Success! Check your email for the new password.",
        {
          duration: 5000,
        },
      );
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.title ||
        "Failed to rotate password. Please check your reset key.";
      toast.error(errorMessage);
    },
  });
};
