import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  approveCancellation,
  getCancellationRequests,
  rejectCancellation,
} from "@/lib/api/admin/cancellations";
import { getApiErrorMessage } from "@/lib/api-error";
import type { CancellationFilters } from "@/types/cancellation";

const KEY = ["cancellation-requests"];

export const useCancellationRequests = (filters: CancellationFilters) => {
  return useQuery({
    queryKey: [...KEY, filters],
    queryFn: () => getCancellationRequests(filters),
    placeholderData: (previous) => previous,
  });
};

/** Approval can open a refund, so the refund queue is refreshed too. */
export const useApproveCancellation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      approveCancellation(id, notes),
    onSuccess: (result) => {
      toast.success(
        result.refundRequestId
          ? "Shipment cancelled. A refund request is waiting in Refunds."
          : "Shipment cancelled.",
      );
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Could not approve the cancellation"));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: KEY });
      queryClient.invalidateQueries({ queryKey: ["refund-requests"] });
      queryClient.invalidateQueries({ queryKey: ["shipments"] });
    },
  });
};

export const useRejectCancellation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      rejectCancellation(id, reason),
    onSuccess: () => {
      toast.success("Cancellation rejected. The customer has been emailed.");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Could not reject the cancellation"));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: KEY });
    },
  });
};
