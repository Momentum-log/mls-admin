import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "@/lib/api/dashboard";

/**
 * React Query hook that fetches and caches dashboard statistics.
 * Data is refreshed every 5 minutes.
 */
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStats,
    staleTime: 1000 * 60 * 5,
  });
};
