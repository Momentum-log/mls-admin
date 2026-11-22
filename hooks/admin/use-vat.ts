import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  getBillingSettings,
  getFxStatus,
  getHiddenServices,
  getShipmentTax,
  getUserBillingProfile,
  getVatAlertSettings,
  getVatMatrix,
  getVatMatrixVersion,
  getVatReviews,
  publishVatMatrix,
  refreshFxRates,
  resolveVatReview,
  revertVatMatrix,
  updateBillingEnforced,
  updateFxSettings,
  updateHiddenServices,
  updateVatAlertSettings,
} from "@/lib/api/admin/vat";
import { getApiErrorMessage } from "@/lib/api-error";
import type {
  FxSettingsUpdate,
  HiddenServices,
  PublishVatMatrixPayload,
  VatReviewFilter,
} from "@/types/vat";

const MATRIX_KEY = ["vat-matrix"];
const REVIEWS_KEY = ["vat-reviews"];
const FX_KEY = ["fx-status"];
const HIDDEN_KEY = ["hidden-services"];
const ALERTS_KEY = ["vat-alert-settings"];
const BILLING_KEY = ["billing-settings"];

export const useVatMatrix = () => useQuery({ queryKey: MATRIX_KEY, queryFn: getVatMatrix });

export const useVatMatrixVersion = (id: string | null) =>
  useQuery({
    queryKey: [...MATRIX_KEY, "version", id],
    queryFn: () => getVatMatrixVersion(id as string),
    enabled: !!id,
  });

const useMatrixMutation = <V,>(
  mutationFn: (variables: V) => Promise<unknown>,
  success: string,
  failure: string,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => toast.success(success),
    onError: (error) => toast.error(getApiErrorMessage(error, failure)),
    onSettled: () => queryClient.invalidateQueries({ queryKey: MATRIX_KEY }),
  });
};

export const usePublishVatMatrix = () =>
  useMatrixMutation(
    (payload: PublishVatMatrixPayload) => publishVatMatrix(payload),
    "New VAT matrix version is live",
    "Could not publish the VAT matrix",
  );

export const useRevertVatMatrix = () =>
  useMatrixMutation(
    ({ id, reason }: { id: string; reason: string }) => revertVatMatrix(id, reason),
    "Reverted: the old cells are live as a new version",
    "Could not revert the VAT matrix",
  );

/** Refreshed every minute so the sidebar badge follows new alerts. */
export const useVatReviews = (status: VatReviewFilter, enabled = true) =>
  useQuery({
    queryKey: [...REVIEWS_KEY, status],
    queryFn: () => getVatReviews(status),
    enabled,
    refetchInterval: 60_000,
  });

export const useResolveVatReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) => resolveVatReview(id, note),
    onSuccess: () => toast.success("Review resolved"),
    onError: (error) => toast.error(getApiErrorMessage(error, "Could not resolve the review")),
    onSettled: () => queryClient.invalidateQueries({ queryKey: REVIEWS_KEY }),
  });
};

export const useShipmentTax = (shipmentId: string | null) =>
  useQuery({
    queryKey: ["shipment-tax", shipmentId],
    queryFn: () => getShipmentTax(shipmentId as string),
    enabled: !!shipmentId,
  });

export const useFxStatus = (enabled = true) =>
  useQuery({ queryKey: FX_KEY, queryFn: getFxStatus, enabled });

export const useUpdateFxSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: FxSettingsUpdate) => updateFxSettings(payload),
    onSuccess: (status) => {
      queryClient.setQueryData(FX_KEY, status);
      toast.success("Exchange-rate settings saved");
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Could not save the settings")),
  });
};

export const useRefreshFxRates = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: refreshFxRates,
    onSuccess: (status) => {
      queryClient.setQueryData(FX_KEY, status);
      toast.success("Rates refreshed from NBP");
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Could not reach NBP")),
  });
};

export const useHiddenServices = (enabled = true) =>
  useQuery({ queryKey: HIDDEN_KEY, queryFn: getHiddenServices, enabled });

export const useUpdateHiddenServices = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (hidden: HiddenServices) => updateHiddenServices(hidden),
    onSuccess: (hidden) => {
      queryClient.setQueryData(HIDDEN_KEY, hidden);
      toast.success("Hidden services saved");
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Could not save the list")),
  });
};

export const useVatAlertSettings = (enabled = true) =>
  useQuery({ queryKey: ALERTS_KEY, queryFn: getVatAlertSettings, enabled });

export const useUpdateVatAlertSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (emails: string[]) => updateVatAlertSettings(emails),
    onSuccess: (settings) => {
      queryClient.setQueryData(ALERTS_KEY, settings);
      toast.success("Alert recipients saved");
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Could not save the recipients")),
  });
};

export const useBillingSettings = (enabled = true) =>
  useQuery({ queryKey: BILLING_KEY, queryFn: getBillingSettings, enabled });

export const useUpdateBillingEnforced = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (enforced: boolean) => updateBillingEnforced(enforced),
    onSuccess: (status) => {
      queryClient.setQueryData(BILLING_KEY, status);
      toast.success("Billing setting saved");
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Could not save the setting")),
  });
};

export const useUserBillingProfile = (userId: string | null) =>
  useQuery({
    queryKey: ["user-billing-profile", userId],
    queryFn: () => getUserBillingProfile(userId as string),
    enabled: !!userId,
  });
