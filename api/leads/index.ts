import apiClient from "../index";
import { LeadListResponse, LeadFilter, UserLeadFilter } from "@/types/leads";
import { AdminLeadListResponse } from "@/types/admin-user-resources";

export const getLeads = async (
  params: LeadFilter,
): Promise<AdminLeadListResponse> => {
  const response = await apiClient.get<AdminLeadListResponse>("/leads", {
    params,
  });
  return response.data;
};

/**
 * Fetches a paginated list of leads (shipping estimates) for a specific user.
 * Uses the shared `/leads` endpoint with a `userId` filter.
 *
 * @param params - Filter params including required userId.
 * @returns Paginated lead list with actual API shape (`data` array).
 */
export const getUserLeads = async (
  params: UserLeadFilter,
): Promise<AdminLeadListResponse> => {
  const response = await apiClient.get<AdminLeadListResponse>("/leads", {
    params,
  });
  return response.data;
};

/**
 * Deletes a shipping estimate lead.
 *
 * @param id - The UUID of the lead to delete.
 */
export const deleteLead = async (id: string): Promise<void> => {
  await apiClient.delete(`/leads/${id}`);
};

/**
 * Bulk deletes multiple leads.
 *
 * @param ids - Array of lead UUIDs to delete.
 */
export const bulkDeleteLeads = async (ids: string[]): Promise<void> => {
  await apiClient.post("/admin/leads/bulk-delete", { ids });
};
