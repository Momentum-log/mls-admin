import apiClient from "../index";
import { User } from "@/types/auth";
import { ActivityLogsResponse } from "@/types/profile";

export const getMyProfile = async (): Promise<User> => {
  const { data } = await apiClient.get<User>("/staff/me/profile");
  return data;
};

export const updateMyPassword = async (payload: any): Promise<void> => {
  await apiClient.put("/staff/me/password", payload);
};

export const getMyActivityLogs = async (params: {
  page?: number;
  limit?: number;
}): Promise<ActivityLogsResponse> => {
  const { data } = await apiClient.get<ActivityLogsResponse>(
    "/staff/me/activity",
    { params },
  );
  return data;
};
