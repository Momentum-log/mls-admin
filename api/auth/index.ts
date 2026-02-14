import apiClient from "../index";
import { LoginPayload, AuthResponse, User } from "@/types/auth";

export const login = async (data: LoginPayload): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>("/auth/login", data);
  return response.data;
};

export const logout = async (): Promise<void> => {
  await apiClient.post("/auth/logout");
};

/**
 * Fetches the currently authenticated admin's profile.
 * The API returns the admin object directly at the top level.
 */
export const getMe = async (): Promise<User> => {
  const response = await apiClient.get<User>("/auth/me");
  return response.data;
};
