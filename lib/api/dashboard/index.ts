import apiClient from "../index";
import { DashboardStats } from "@/types/dashboard";

/**
 * Fetches dashboard statistics from the admin API.
 *
 * @returns Dashboard stats including user, shipment, and revenue counts.
 */
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await apiClient.get<DashboardStats>("/admin/dashboard/stats");
  return response.data;
};
