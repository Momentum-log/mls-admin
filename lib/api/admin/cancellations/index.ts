import apiClient from "../../index";
import { unwrapList } from "@/lib/api/_shared/envelope";
import type { Paged } from "@/types/api";
import type {
  CancellationFilters,
  CancellationRequest,
} from "@/types/cancellation";

const BASE_ROUTE = "/admin/cancellation-requests";

/** The cancellation queue, newest first. */
export const getCancellationRequests = async (
  filters: CancellationFilters,
): Promise<Paged<CancellationRequest>> => {
  const { data } = await apiClient.get<unknown>(BASE_ROUTE, { params: filters });
  return unwrapList<CancellationRequest>(data, "requests");
};

/**
 * Approves a cancellation. The server cancels a confirmed courier pickup with
 * the carrier first and answers 502 if the carrier refuses, in which case
 * nothing changed.
 */
export const approveCancellation = async (
  id: string,
  notes?: string,
): Promise<CancellationRequest> => {
  const { data } = await apiClient.post<CancellationRequest>(
    `${BASE_ROUTE}/${id}/approve`,
    notes ? { notes } : {},
  );
  return data;
};

/** Rejects a cancellation; the reason is emailed to the customer. */
export const rejectCancellation = async (
  id: string,
  reason: string,
): Promise<CancellationRequest> => {
  const { data } = await apiClient.post<CancellationRequest>(
    `${BASE_ROUTE}/${id}/reject`,
    { reason },
  );
  return data;
};
