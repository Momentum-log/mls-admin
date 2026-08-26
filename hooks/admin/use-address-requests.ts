import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  approveAddressRequest,
  getAddressRequestById,
  getAddressRequests,
  rejectAddressRequest,
} from "@/api/admin/address-requests";
import {
  AddressRequestListFilters,
  ApproveAddressRequestPayload,
  RejectAddressRequestPayload,
} from "@/types/address-request";
import { toast } from "react-hot-toast";
import { getApiErrorMessage } from "@/lib/api-error";

export const useAddressRequests = (filters: AddressRequestListFilters) => {
  return useQuery({
    queryKey: ["address-requests", filters],
    queryFn: () => getAddressRequests(filters),
    placeholderData: (previousData) => previousData,
  });
};

export const useAddressRequestDetails = (
  requestId?: string,
  enabled = true,
) => {
  return useQuery({
    queryKey: ["address-request", requestId],
    queryFn: () => getAddressRequestById(requestId as string),
    enabled: enabled && !!requestId,
  });
};

export const useApproveAddressRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      requestId,
      payload,
    }: {
      requestId: string;
      payload?: ApproveAddressRequestPayload;
    }) => approveAddressRequest(requestId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["address-requests"] });
      queryClient.invalidateQueries({
        queryKey: ["address-request", variables.requestId],
      });
      toast.success("Address request approved");
    },
    onError: (error, variables) => {
      queryClient.invalidateQueries({ queryKey: ["address-requests"] });
      if (variables?.requestId) {
        queryClient.invalidateQueries({
          queryKey: ["address-request", variables.requestId],
        });
      }
      toast.error(
        getApiErrorMessage(error, "Failed to approve address request"),
      );
    },
  });
};

export const useRejectAddressRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      requestId,
      payload,
    }: {
      requestId: string;
      payload: RejectAddressRequestPayload;
    }) => rejectAddressRequest(requestId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["address-requests"] });
      queryClient.invalidateQueries({
        queryKey: ["address-request", variables.requestId],
      });
      toast.success("Address request rejected");
    },
    onError: (error, variables) => {
      queryClient.invalidateQueries({ queryKey: ["address-requests"] });
      if (variables?.requestId) {
        queryClient.invalidateQueries({
          queryKey: ["address-request", variables.requestId],
        });
      }
      toast.error(
        getApiErrorMessage(error, "Failed to reject address request"),
      );
    },
  });
};
