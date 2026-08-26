import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getShipments,
  createProxyShipment,
  bypassPayment,
  overrideStatus,
  getUserShipments,
  deleteShipment,
  bulkDeleteShipments,
} from "@/api/shipments";
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
      queryClient.invalidateQueries({ queryKey: ["shipments"] });
      toast.success("Shipment status updated!");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Failed to update status"));
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
