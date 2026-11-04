import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  getFulfilmentQueue,
  getFulfilmentSettings,
  updateFulfilmentSettings,
  uploadManualLabel,
} from "@/lib/api/admin/fulfilment";
import { getApiErrorMessage } from "@/lib/api-error";
import type { FulfilmentSettings, ManualLabelPayload } from "@/types/fulfilment";

const QUEUE_KEY = ["fulfilment-queue"];
const SETTINGS_KEY = ["fulfilment-settings"];

/**
 * The queue is re-read every minute so the sidebar count and the page follow
 * new payments without a reload.
 */
export const useFulfilmentQueue = (enabled = true) =>
  useQuery({
    queryKey: QUEUE_KEY,
    queryFn: getFulfilmentQueue,
    enabled,
    refetchInterval: 60_000,
  });

export const useUploadManualLabel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ shipmentId, payload }: { shipmentId: string; payload: ManualLabelPayload }) =>
      uploadManualLabel(shipmentId, payload),
    onSuccess: (result) => toast.success(result.message, { duration: 6000 }),
    onError: (error) => toast.error(getApiErrorMessage(error, "Could not save the label")),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUEUE_KEY });
      queryClient.invalidateQueries({ queryKey: ["shipments"] });
    },
  });
};

export const useFulfilmentSettings = () =>
  useQuery({ queryKey: SETTINGS_KEY, queryFn: getFulfilmentSettings });

export const useUpdateFulfilmentSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<FulfilmentSettings>) => updateFulfilmentSettings(payload),
    onSuccess: (settings) => {
      queryClient.setQueryData(SETTINGS_KEY, settings);
      toast.success("Fulfilment settings saved");
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "Could not save the fulfilment settings")),
  });
};
