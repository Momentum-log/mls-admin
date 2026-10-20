import apiClient from "../index";
import {
  Carrier,
  CreateCarrierPayload,
  RateCardRow,
  SaveCarrierSettingsPayload,
} from "@/types/carriers";

// ─── CARRIER PROFILE CRUD ────────────────────────────────────────────────────

/**
 * Fetches all available carriers (e.g. UPS, FedEx, InPost).
 * Sensitive fields (API KEY / SECRET) are masked (e.g. "sk_live_...e4r5").
 *
 * @returns List of all carrier profiles.
 */
export const getCarriers = async (): Promise<Carrier[]> => {
  const { data } = await apiClient.get<Carrier[]>("/admin/carriers/get-all-carriers");
  return data;
};

/**
 * Fetches a single carrier by ID.
 *
 * @param id - Carrier ID.
 */
export const getSingleCarrier = async (id: string): Promise<Carrier> => {
  const { data } = await apiClient.get<Carrier>(
    `/admin/carriers/get-single-carrier/${id}`,
  );
  return data;
};

/**
 * Creates a new carrier configuration.
 * Usually requires API Key / Secret from the provider.
 *
 * @param payload - Basic carrier details.
 */
export const createCarrier = async (
  payload: CreateCarrierPayload,
): Promise<Carrier> => {
  const { data } = await apiClient.post<Carrier>(
    "/admin/carriers/create-new-carrier",
    payload,
  );
  return data;
};

/**
 * Deletes a carrier profile.
 * BLOCKED if the carrier has *any* active shipments associated with it.
 *
 * @param id - Carrier ID (UUID).
 */
export const deleteCarrier = async (id: string): Promise<void> => {
  await apiClient.delete(`/admin/carriers/delete-carrier/${id}`);
};

// ─── ONE-STEP SAVE (PROFILE, COMMISSIONS CL02, THRESHOLDS) ───────────────────

/**
 * Saves the carrier sheet in one write: any of profile, commissions and
 * thresholds. Thresholds need `staff:write` as well as `carrier:write`.
 *
 * @param id - Carrier id.
 * @param body - The parts to save; at least one.
 * @returns The updated carrier, secrets masked.
 */
export const saveCarrierSettings = async (
  id: string,
  body: SaveCarrierSettingsPayload,
): Promise<Carrier> => {
  const { data } = await apiClient.put<Carrier>(
    `/admin/carriers/update-carrier-settings/${id}`,
    body,
  );
  return data;
};

// ─── RATE CARD (carriers with no rates API, e.g. DPD) ────────────────────────

/** A carrier's whole rate card, sorted by lane, service and weight. */
export const getRateCard = async (slug: string): Promise<RateCardRow[]> => {
  const { data } = await apiClient.get<{ rows: RateCardRow[] }>(
    `/admin/carriers/rate-card/${slug}`,
  );
  return data.rows;
};

/** Replaces the whole rate card in one save; returns it as saved. */
export const replaceRateCard = async (
  slug: string,
  rows: RateCardRow[],
): Promise<RateCardRow[]> => {
  const { data } = await apiClient.put<{ rows: RateCardRow[] }>(
    `/admin/carriers/rate-card/${slug}`,
    { rows },
  );
  return data.rows;
};
