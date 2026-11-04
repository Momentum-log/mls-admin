import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCarriers,
  createCarrier,
  deleteCarrier,
  saveCarrierSettings,
  getRateCard,
  replaceRateCard,
  setCarriersFulfilmentMode,
} from "@/lib/api/carriers";
import { toast } from "react-hot-toast";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  CreateCarrierPayload,
  FulfilmentMode,
  RateCardRow,
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

export const useRateCard = (slug: string | null) => {
  return useQuery({
    queryKey: ["carrier-rate-card", slug],
    queryFn: () => getRateCard(slug!),
    enabled: Boolean(slug),
  });
};

/** Replaces a carrier's whole rate card. */
export const useReplaceRateCard = (slug: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (rows: RateCardRow[]) => replaceRateCard(slug, rows),
    onSuccess: (rows) => {
      queryClient.setQueryData(["carrier-rate-card", slug], rows);
      toast.success(`Rate card saved (${rows.length} rows)`);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Failed to save rate card"));
    },
  });
};

/** Sets Automatic or Manual on the chosen carriers in one save. */
export const useSetCarriersFulfilmentMode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ mode, carrierIds }: { mode: FulfilmentMode; carrierIds: string[] }) =>
      setCarriersFulfilmentMode(mode, carrierIds),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["carriers"] });
      const label = result.mode === "MANUAL" ? "Manual" : "Automatic";
      const names = result.updated.map((c) => c.name).join(", ");
      toast.success(names ? `${label}: ${names}` : "Nothing changed");
      for (const skipped of result.skipped) {
        toast(`${skipped.name} stays Manual: ${skipped.reason}`);
      }
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Failed to update fulfilment"));
    },
  });
};
