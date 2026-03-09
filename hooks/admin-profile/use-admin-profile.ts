import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  getMyProfile,
  updateMyPassword,
  getMyActivityLogs,
} from "@/api/profile";
import { ActivityLogsResponse } from "@/types/profile";

export const useMyProfile = () => {
  return useQuery({
    queryKey: ["my-profile"],
    queryFn: getMyProfile,
  });
};

export const useUpdateMyPassword = () => {
  return useMutation({
    mutationFn: updateMyPassword,
    onSuccess: () => {
      toast.success("Password updated successfully");
    },
    onError: (error: any) => {
      const msg =
        error.response?.data?.details ||
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Failed to update password";
      toast.error(msg);
    },
  });
};

export const useMyActivityLogs = (params: {
  page?: number;
  limit?: number;
}) => {
  return useQuery<ActivityLogsResponse>({
    queryKey: ["my-activity-logs", params],
    queryFn: () => getMyActivityLogs(params),
  });
};
