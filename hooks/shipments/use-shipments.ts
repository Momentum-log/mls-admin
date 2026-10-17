import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getShipments,
  createProxyShipment,
  bypassPayment,
  overrideStatus,
  getUserShipments,
  deleteShipment,
  bulkDeleteShipments,
  getShipmentHistory,
  completeShipment,
} from "@/lib/api/shipments";
import { toast } from "react-hot-toast";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  ShipmentFilter,
  CreateProxyShipmentPayload,
  BypassPaymentPayload,
  OverrideStatusPayload,
  UserShipmentFilter,
} from "@/types/shipment";

export const useShipments = (filters: ShipmentFilter) => {
  return useQuery({
    queryKey: ["shipments", filters],
    queryFn: () => getShipments(filters),
    placeholderData: (previousData) => previousData,
  });
};

/**
 * Hook to fetch a paginated list of shipments for a specific user.
 * Only fires the query when `userId` is truthy.
 *
 * @param filters - Filter params including required userId.
 */
export const useUserShipments = (filters: UserShipmentFilter) => {
  return useQuery({
    queryKey: ["user-shipments", filters],
    queryFn: () => getUserShipments(filters),
    enabled: !!filters.userId,
    placeholderData: (previousData) => previousData,
  });
};

export const useCreateProxyShipment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProxyShipmentPayload) => createProxyShipment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipments"] });
      toast.success("Shipment created successfully!");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Failed to create shipment"));
    },
  });
};

export const useBypassPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      shipmentId,
      data,
    }: {
      shipmentId: string;
      data: BypassPaymentPayload;
    }) => bypassPayment(shipmentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipments"] });
      toast.success("Payment bypassed successfully!");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Failed to bypass payment"));
    },
  });
};

export const useOverrideStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      shipmentId,
      data,
    }: {
      shipmentId: string;
      data: OverrideStatusPayload;
    }) => overrideStatus(shipmentId, data),
    onSuccess: () => {
      toast.success("Shipment status updated!");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Failed to update status"));
    },
    // A failure can arrive after the status was saved (a timeout, a failed
    // email); re-read so the table shows what the server actually holds.
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["shipments"] });
    },
  });
};

/**
 * Hook to delete a shipment.
 */
export const useDeleteShipment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: string | { id: string; force?: boolean }) => {
      const id = typeof variables === "string" ? variables : variables.id;
      const force = typeof variables === "string" ? false : variables.force;
      return deleteShipment(id, force);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipments"] });
      queryClient.invalidateQueries({ queryKey: ["user-shipments"] });
      toast.success("Shipment deleted successfully");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Failed to delete shipment"));
    },
  });
};

export const useBulkDeleteShipments = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, force }: { ids: string[]; force?: boolean }) =>
      bulkDeleteShipments(ids, force),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipments"] });
      queryClient.invalidateQueries({ queryKey: ["user-shipments"] });
      toast.success("Shipments deleted successfully");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Failed to delete shipments"));
    },
  });
};

/**
 * The audit trail for one shipment, loaded when its detail sheet opens.
 */
export const useShipmentHistory = (id: string | null) => {
  return useQuery({
    queryKey: ["shipment-history", id],
    queryFn: () => getShipmentHistory(id as string),
    enabled: !!id,
    retry: false,
  });
};

/**
 * One-click "mark completed": sets COMPLETED and emails the customer.
 */
export const useCompleteShipment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => completeShipment(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["shipments"] });
      queryClient.invalidateQueries({ queryKey: ["user-shipments"] });
      queryClient.invalidateQueries({ queryKey: ["shipment-history", id] });
      toast.success("Shipment completed. The customer has been emailed.");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Failed to complete shipment"));
    },
  });
};
