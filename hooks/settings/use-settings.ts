import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  getGlobalCommissionSettings,
  updateGlobalCommissionSettings,
  getCarrierCommissionSettings,
  updateCarrierCommissionSettings,
} from "@/api/settings";
import {
  GlobalCommissionSettings,
  CarrierCommissionSettings,
} from "@/types/settings";

export const useGlobalCommissionSettings = () => {
  return useQuery({
    queryKey: ["global-commission-settings"],
    queryFn: getGlobalCommissionSettings,
  });
};

export const useUpdateGlobalCommissionSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateGlobalCommissionSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["global-commission-settings"],
      });
      toast.success("Global commission settings updated");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to update global settings",
      );
    },
  });
};

export const useCarrierCommissionSettings = (carrierId: string | null) => {
  return useQuery({
    queryKey: ["carrier-commission-settings", carrierId],
    queryFn: () => getCarrierCommissionSettings(carrierId!),
    enabled: !!carrierId,
  });
};

export const useUpdateCarrierCommissionSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      carrierId,
      payload,
    }: {
      carrierId: string;
      payload: Partial<CarrierCommissionSettings>;
    }) => updateCarrierCommissionSettings(carrierId, payload),
    onSuccess: (_, { carrierId }) => {
      queryClient.invalidateQueries({
        queryKey: ["carrier-commission-settings", carrierId],
      });
      // Might want to silently update without toast if it's part of a larger save, but can keep toast.
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          "Failed to update carrier threshold settings",
      );
    },
  });
};
