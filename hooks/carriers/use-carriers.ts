import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCarriers,
  createCarrier,
  updateCarrier,
  deleteCarrier,
  updateCommissions,
} from "@/lib/api/carriers";
import { toast } from "react-hot-toast";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  CreateCarrierPayload,
  UpdateCarrierPayload,
  UpdateCommissionsPayload,
} from "@/types/carriers";

// ─── HOOKS ───────────────────────────────────────────────────────────────────

export const useCarriers = () => {
  return useQuery({
    queryKey: ["carriers"],
    queryFn: getCarriers,
    placeholderData: (previousData) => previousData,
  });
};

export const useCreateCarrier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCarrierPayload) => createCarrier(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["carriers"] });
      toast.success("Carrier profile created successfully");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Failed to create carrier"));
    },
  });
};

export const useUpdateCarrier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCarrierPayload }) =>
      updateCarrier(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["carriers"] });
      toast.success("Carrier updated successfully");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Failed to update carrier"));
    },
  });
};

export const useDeleteCarrier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCarrier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["carriers"] });
      toast.success("Carrier deleted successfully");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Failed to delete carrier"));
    },
  });
};

export const useUpdateCommissions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateCommissionsPayload;
    }) => updateCommissions(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["carriers"] });
      toast.success("Commission rules updated successfully");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Failed to update commissions"));
    },
  });
};
