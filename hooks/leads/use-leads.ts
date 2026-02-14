import { useQuery } from "@tanstack/react-query";
import { getLeads, getUserLeads } from "@/api/leads";
import { LeadFilter, UserLeadFilter } from "@/types/leads";

export const useLeads = (filters: LeadFilter) => {
  return useQuery({
    queryKey: ["leads", filters],
    queryFn: () => getLeads(filters),
    placeholderData: (previousData) => previousData,
  });
};

/**
 * Hook to fetch a paginated list of leads (estimates) for a specific user.
 * Only fires the query when `userId` is truthy.
 *
 * @param filters - Filter params including required userId.
 */
export const useUserLeads = (filters: UserLeadFilter) => {
  return useQuery({
    queryKey: ["user-leads", filters],
    queryFn: () => getUserLeads(filters),
    enabled: !!filters.userId,
    placeholderData: (previousData) => previousData,
  });
};
