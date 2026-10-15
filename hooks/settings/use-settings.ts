import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  getGlobalCommissionSettings,
  updateGlobalCommissionSettings,
  getCarrierCommissionSettings,
  getDhlSettings,
  updateDhlSettings,
  getReminderSettings,
  updateReminderSettings,
  getInvoiceExpiration,
  updateInvoiceExpiration,
} from "@/lib/api/settings";
import {
  DhlSettings,
  ReminderSettings,
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
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Failed to update global settings"));
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

export const useDhlSettings = (enabled = true) => {
  return useQuery({ queryKey: ["dhl-settings"], queryFn: getDhlSettings, enabled });
};

export const useUpdateDhlSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<DhlSettings>) => updateDhlSettings(payload),
    onSuccess: (settings) => {
      queryClient.setQueryData(["dhl-settings"], settings);
      toast.success("DHL settings saved");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Failed to save DHL settings"));
    },
  });
};

export const useReminderSettings = (enabled = true) => {
  return useQuery({
    queryKey: ["reminder-settings"],
    queryFn: getReminderSettings,
    enabled,
  });
};

export const useUpdateReminderSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<ReminderSettings>) => updateReminderSettings(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminder-settings"] });
      toast.success("Payment reminder settings saved");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Failed to save reminder settings"));
    },
  });
};

export const useInvoiceExpiration = () => {
  return useQuery({ queryKey: ["invoice-expiration"], queryFn: getInvoiceExpiration });
};

export const useUpdateInvoiceExpiration = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (hours: number) => updateInvoiceExpiration(hours),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoice-expiration"] });
      toast.success("Invoice payment window saved");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Failed to save the payment window"));
    },
  });
};
