import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getLeads, getUserLeads, deleteLead } from "@/api/leads";
import { LeadFilter, UserLeadFilter } from "@/types/leads";
import { toast } from "react-hot-toast";
import { getApiErrorMessage } from "@/lib/api-error";

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

/**
 * Hook to delete a shipping estimate lead.
 */
export const useDeleteLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteLead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["user-leads"] });
      toast.success("Lead deleted successfully");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Failed to delete lead"));
    },
  });
};
