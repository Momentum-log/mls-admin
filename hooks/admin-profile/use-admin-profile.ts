import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  getMyProfile,
  updateMyPassword,
  getMyActivityLogs,
} from "@/lib/api/profile";
import { ActivityLogsResponse } from "@/types/profile";
import { getApiErrorMessage } from "@/lib/api-error";

export const useMyProfile = () => {
  return useQuery({
    queryKey: ["my-profile"],
    queryFn: getMyProfile,
  });
};

export const useUpdateMyPassword = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateMyPassword,
    onSuccess: () => {
      // Clears the forced-change lock and starts the 30-day wait on the profile.
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      toast.success("Password updated successfully");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Failed to update password"));
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
