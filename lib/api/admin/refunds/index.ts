import apiClient from "../../index";
import { unwrapList, unwrapOne } from "@/lib/api/_shared/envelope";
import type { Paged } from "@/types/api";
import type {
  ApproveRefundPayload,
  RefundFilters,
  RefundRequest,
} from "@/types/refund";

const BASE_ROUTE = "/admin/refund-requests";

/** Refund requests, newest first. The endpoint pages by offset. */
export const getRefundRequests = async ({
  page,
  limit,
  ...filters
}: RefundFilters): Promise<Paged<RefundRequest>> => {
  const { data } = await apiClient.get<unknown>(BASE_ROUTE, {
    params: { ...filters, limit, offset: (page - 1) * limit },
  });
  return unwrapList<RefundRequest>(data);
};

export interface RefundActionResult {
  request: RefundRequest;
  /** The server's own sentence on what happened, e.g. "Refund sent; it completes when the gateway confirms". */
  message?: string;
}

/**
 * Approves a refund: through the payment gateway by default, or as a manual
 * refund with `manual: true`. A 409 means the request is no longer pending; a
 * 502 means the gateway refused and the request is back in the queue.
 */
export const approveRefund = async (
  id: string,
  payload: ApproveRefundPayload,
): Promise<RefundActionResult> => {
  const { data } = await apiClient.post<{ message?: string }>(
    `${BASE_ROUTE}/${id}/approve`,
    payload,
  );
  return { request: unwrapOne<RefundRequest>(data, "data"), message: data?.message };
};

export const rejectRefund = async (
  id: string,
  rejectionReason: string,
): Promise<void> => {
  await apiClient.post(`${BASE_ROUTE}/${id}/reject`, { rejectionReason });
};

/** Marks a manually-made refund as paid out. */
export const completeRefund = async (
  id: string,
  payload: { externalRefundId?: string; notes?: string },
): Promise<void> => {
  await apiClient.post(`${BASE_ROUTE}/${id}/complete`, payload);
};

/** Opens a refund request on a paid invoice. */
export const requestInvoiceRefund = async (
  invoiceId: string,
  reason: string,
): Promise<void> => {
  await apiClient.post(`/admin/invoices/${invoiceId}/refund-request`, { reason });
};
