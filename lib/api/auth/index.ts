import apiClient from "../index";
import { LoginPayload, AuthResponse, User } from "@/types/auth";

/**
 * Authenticates an admin and returns the admin profile plus a bearer token.
 *
 * @param data - Email and password.
 * @returns The admin object and a JWT valid for one hour.
 */
export const login = async (data: LoginPayload): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>("/admin/auth/login", data);
  return response.data;
};

/**
 * Ends the admin session.
 *
 * The API exposes no admin logout route — `/api/auth/logout-user` is the
 * customer endpoint and rejects an admin token. Admin tokens are stateless
 * and expire server-side after an hour, so ending a session is purely a
 * client-side teardown: drop the cookie and clear the query cache.
 *
 * Kept as an async no-op so `useLogout` retains its mutation shape and the
 * caller does not have to special-case it.
 */
export const logout = async (): Promise<void> => {
  return Promise.resolve();
};

/**
 * Fetches the currently authenticated admin's profile.
 * The API returns the admin object directly at the top level.
 */
export const getMe = async (): Promise<User> => {
  const response = await apiClient.get<User>("/admin/auth/me");
  return response.data;
};
