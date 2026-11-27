import apiClient from "../../index";
import type {
  BillingProfile,
  BillingSettingsStatus,
  FxSettingsUpdate,
  FxStatus,
  HiddenServices,
  HideRateRules,
  PublishVatMatrixPayload,
  PublishVatMatrixResult,
  ShipmentTax,
  VatAlertSettings,
  VatMatrixOverview,
  VatMatrixVersion,
  VatReview,
  VatReviewFilter,
  VatReviewList,
  VatSimulation,
  VatSimulationInput,
} from "@/types/vat";

export const getVatMatrix = async (): Promise<VatMatrixOverview> => {
  const { data } = await apiClient.get<VatMatrixOverview>("/admin/vat-matrix");
  return data;
};

export const getVatMatrixVersion = async (id: string): Promise<VatMatrixVersion> => {
  const { data } = await apiClient.get<VatMatrixVersion>(`/admin/vat-matrix/versions/${id}`);
  return data;
};

/** Publishes a new version; versions are never edited in place. */
export const publishVatMatrix = async (
  payload: PublishVatMatrixPayload,
): Promise<PublishVatMatrixResult> => {
  const { data } = await apiClient.post<PublishVatMatrixResult>("/admin/vat-matrix", payload);
  return data;
};

/** Publishes an old version's content as a new version. */
export const revertVatMatrix = async (
  id: string,
  reason: string,
): Promise<PublishVatMatrixResult> => {
  const { data } = await apiClient.post<PublishVatMatrixResult>(
    `/admin/vat-matrix/versions/${id}/revert`,
    { reason },
  );
  return data;
};

export const getVatReviews = async (status: VatReviewFilter): Promise<VatReviewList> => {
  const { data } = await apiClient.get<VatReviewList>("/admin/vat-reviews", {
    params: { status },
  });
  return data;
};

export const resolveVatReview = async (id: string, note: string): Promise<VatReview> => {
  const { data } = await apiClient.post<VatReview>(`/admin/vat-reviews/${id}/resolve`, { note });
  return data;
};

export const getShipmentTax = async (shipmentId: string): Promise<ShipmentTax> => {
  const { data } = await apiClient.get<ShipmentTax>(`/admin/shipments/${shipmentId}/tax`);
  return data;
};

export const getFxStatus = async (): Promise<FxStatus> => {
  const { data } = await apiClient.get<FxStatus>("/admin/settings/fx");
  return data;
};

export const updateFxSettings = async (payload: FxSettingsUpdate): Promise<FxStatus> => {
  const { data } = await apiClient.put<FxStatus>("/admin/settings/fx", payload);
  return data;
};

/** Fetches the newest NBP rates now. */
export const refreshFxRates = async (): Promise<FxStatus> => {
  const { data } = await apiClient.post<FxStatus>("/admin/settings/fx/refresh");
  return data;
};

export const getHiddenServices = async (): Promise<HiddenServices> => {
  const { data } = await apiClient.get<{ hidden: HiddenServices }>("/admin/settings/hidden-services");
  return data.hidden;
};

/** Replaces the whole list. */
export const updateHiddenServices = async (hidden: HiddenServices): Promise<HiddenServices> => {
  const { data } = await apiClient.put<{ hidden: HiddenServices }>(
    "/admin/settings/hidden-services",
    { hidden },
  );
  return data.hidden;
};

export const getVatAlertSettings = async (): Promise<VatAlertSettings> => {
  const { data } = await apiClient.get<VatAlertSettings>("/admin/settings/vat-alerts");
  return data;
};

export const updateVatAlertSettings = async (emails: string[]): Promise<VatAlertSettings> => {
  const { data } = await apiClient.put<VatAlertSettings>("/admin/settings/vat-alerts", { emails });
  return data;
};

export const getBillingSettings = async (): Promise<BillingSettingsStatus> => {
  const { data } = await apiClient.get<BillingSettingsStatus>("/admin/settings/billing");
  return data;
};

export const updateBillingEnforced = async (enforced: boolean): Promise<BillingSettingsStatus> => {
  const { data } = await apiClient.put<BillingSettingsStatus>("/admin/settings/billing", {
    enforced,
  });
  return data;
};

export const getUserBillingProfile = async (userId: string): Promise<BillingProfile | null> => {
  const { data } = await apiClient.get<{ profile: BillingProfile | null }>(
    `/admin/users/${userId}/billing-profile`,
  );
  return data.profile;
};

export const getHideRules = async (): Promise<HideRateRules> => {
  const { data } = await apiClient.get<{ rules: HideRateRules }>("/admin/settings/hide-rules");
  return data.rules;
};

export const updateHideRules = async (rules: HideRateRules): Promise<HideRateRules> => {
  const { data } = await apiClient.put<{ rules: HideRateRules }>("/admin/settings/hide-rules", {
    rules,
  });
  return data.rules;
};

/** What VAT a journey gets under the live matrix, next to the built-in defaults. */
export const simulateVat = async (input: VatSimulationInput): Promise<VatSimulation> => {
  const { data } = await apiClient.post<VatSimulation>("/admin/vat-matrix/simulate", input);
  return data;
};
