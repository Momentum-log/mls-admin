import apiClient from "../../index";
import type {
  FulfilmentQueue,
  FulfilmentSettings,
  ManualLabelPayload,
  ManualLabelResponse,
} from "@/types/fulfilment";

/** Paid shipments waiting for staff to book the label, oldest first. */
export const getFulfilmentQueue = async (): Promise<FulfilmentQueue> => {
  const { data } = await apiClient.get<FulfilmentQueue>("/admin/fulfilment-queue");
  return data;
};

/** Saves the label PDF and tracking number; the customer is emailed the label. */
export const uploadManualLabel = async (
  shipmentId: string,
  payload: ManualLabelPayload,
): Promise<ManualLabelResponse> => {
  const { data } = await apiClient.post<ManualLabelResponse>(
    `/admin/shipments/${shipmentId}/manual-label`,
    payload,
  );
  return data;
};

export const getFulfilmentSettings = async (): Promise<FulfilmentSettings> => {
  const { data } = await apiClient.get<FulfilmentSettings>("/admin/settings/fulfilment");
  return data;
};

export const updateFulfilmentSettings = async (
  payload: Partial<FulfilmentSettings>,
): Promise<FulfilmentSettings> => {
  const { data } = await apiClient.put<FulfilmentSettings>(
    "/admin/settings/fulfilment",
    payload,
  );
  return data;
};
