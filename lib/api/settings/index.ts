import apiClient from "../index";
import {
  GlobalCommissionSettings,
  CarrierCommissionSettings,
} from "@/types/settings";

export const getGlobalCommissionSettings =
  async (): Promise<GlobalCommissionSettings> => {
    const { data } = await apiClient.get<GlobalCommissionSettings>(
      "/admin/settings/global-commission",
    );
    return data;
  };

export const updateGlobalCommissionSettings = async (
  payload: Partial<GlobalCommissionSettings>,
): Promise<GlobalCommissionSettings> => {
  const { data } = await apiClient.put<GlobalCommissionSettings>(
    "/admin/settings/global-commission",
    payload,
  );
  return data;
};

export const getCarrierCommissionSettings = async (
  carrierId: string,
): Promise<CarrierCommissionSettings> => {
  const { data } = await apiClient.get<CarrierCommissionSettings>(
    `/admin/settings/commission/${carrierId}`,
  );
  return data;
};

export const updateCarrierCommissionSettings = async (
  carrierId: string,
  payload: Partial<CarrierCommissionSettings>,
): Promise<CarrierCommissionSettings> => {
  const { data } = await apiClient.put<CarrierCommissionSettings>(
    `/admin/settings/commission/${carrierId}`,
    payload,
  );
  return data;
};
