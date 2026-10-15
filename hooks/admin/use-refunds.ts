import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  approveRefund,
  completeRefund,
  getRefundRequests,
  rejectRefund,
  requestInvoiceRefund,
} from "@/lib/api/admin/refunds";
import { getApiErrorMessage } from "@/lib/api-error";
import type { ApproveRefundPayload, RefundFilters } from "@/types/refund";

const KEY = ["refund-requests"];

export const useRefundRequests = (filters: RefundFilters) => {
  return useQuery({
    queryKey: [...KEY, filters],
    queryFn: () => getRefundRequests(filters),
    placeholderData: (previous) => previous,
    // Gateway refunds settle by webhook, so a sent refund changes on its own.
    refetchInterval: 30_000,
  });
};

/**
 * Every refund mutation can change an invoice and a shipment's payment
 * status, so all three caches are refreshed whatever the outcome — a gateway
 * failure also changes the request (back to pending, with a reason).
 */
const useRefundMutation = <V,>(
  mutationFn: (variables: V) => Promise<unknown>,
  failure: string,
  success?: string,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (result) => {
      const message =
        (result as { message?: string } | undefined)?.message ?? success;
      if (message) toast.success(message);
    },
    onError: (error) => toast.error(getApiErrorMessage(error, failure)),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: KEY });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoice"] });
      queryClient.invalidateQueries({ queryKey: ["shipments"] });
    },
  });
};

export const useApproveRefund = () =>
  useRefundMutation(
    ({ id, payload }: { id: string; payload: ApproveRefundPayload }) =>
      approveRefund(id, payload),
    "The refund was not sent",
  );

export const useRejectRefund = () =>
  useRefundMutation(
    ({ id, reason }: { id: string; reason: string }) => rejectRefund(id, reason),
    "Could not reject the refund",
    "Refund request rejected",
  );

export const useCompleteRefund = () =>
  useRefundMutation(
    ({ id, externalRefundId }: { id: string; externalRefundId?: string }) =>
      completeRefund(id, { externalRefundId }),
    "Could not mark the refund complete",
    "Refund marked as paid out",
  );

export const useRequestInvoiceRefund = () =>
  useRefundMutation(
    ({ invoiceId, reason }: { invoiceId: string; reason: string }) =>
      requestInvoiceRefund(invoiceId, reason),
    "Could not open the refund request",
    "Refund request opened. Approve it in Refunds.",
  );
