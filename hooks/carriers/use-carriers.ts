import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCarriers,
  createCarrier,
  deleteCarrier,
  saveCarrierSettings,
} from "@/lib/api/carriers";
import { toast } from "react-hot-toast";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  CreateCarrierPayload,
  SaveCarrierSettingsPayload,
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

/**
 * Saves the carrier sheet in one request, so profile, commissions and
 * thresholds land together or not at all.
 */
export const useSaveCarrierSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: SaveCarrierSettingsPayload }) =>
      saveCarrierSettings(id, body),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["carriers"] });
      queryClient.invalidateQueries({ queryKey: ["carrier-commission-settings", id] });
      toast.success("Carrier saved");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Failed to save carrier"));
    },
  });
};
