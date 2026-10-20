import apiClient from "../index";
import { unwrapOne } from "@/lib/api/_shared/envelope";
import { hasStatus } from "@/lib/api-error";
import {
  GlobalCommissionSettings,
  CarrierCommissionSettings,
  DhlSettings,
  ReminderSettings,
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

export const getDhlSettings = async (): Promise<DhlSettings> => {
  const { data } = await apiClient.get<DhlSettings>("/admin/settings/dhl");
  return data;
};

/** Changes any subset of the DHL settings and returns the full set. */
export const updateDhlSettings = async (
  payload: Partial<DhlSettings>,
): Promise<DhlSettings> => {
  const { data } = await apiClient.put<DhlSettings>("/admin/settings/dhl", payload);
  return data;
};

export const getReminderSettings = async (): Promise<ReminderSettings> => {
  const { data } = await apiClient.get<unknown>("/admin/reminder-settings");
  return unwrapOne<ReminderSettings>(data);
};

export const updateReminderSettings = async (
  payload: Partial<ReminderSettings>,
): Promise<ReminderSettings> => {
  const { data } = await apiClient.put<unknown>(
    "/admin/reminder-settings/payment",
    payload,
  );
  return unwrapOne<ReminderSettings>(data);
};

/**
 * How long a new invoice stays payable, in hours.
 *
 * Returns null when the server has no read endpoint for it yet (older
 * servers only accept writes), so the page can say "not known" instead of
 * failing.
 */
export const getInvoiceExpiration = async (): Promise<number | null> => {
  try {
    const { data } = await apiClient.get<unknown>(
      "/admin/settings/invoice-expiration",
    );
    const hours = Number(unwrapOne<{ durationHours?: number }>(data, "data")?.durationHours);
    return Number.isFinite(hours) ? hours : null;
  } catch (error) {
    if (hasStatus(error, 404)) return null;
    throw error;
  }
};

export const updateInvoiceExpiration = async (durationHours: number): Promise<void> => {
  await apiClient.post("/admin/settings/invoice-expiration", { durationHours });
};
