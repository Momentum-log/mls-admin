import apiClient from "../index";
import {
  Carrier,
  CreateCarrierPayload,
  UpdateCarrierPayload,
  UpdateCommissionsPayload,
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
 * Updates an existing carrier profile.
 * Can be used to rotate keys, change active status, or rename.
 *
 * @param id - Carrier ID (UUID).
 * @param payload - Partial update fields.
 */
export const updateCarrier = async (
  id: string,
  payload: UpdateCarrierPayload,
): Promise<Carrier> => {
  const { data } = await apiClient.put<Carrier>(
    `/admin/carriers/update-carrier/${id}`,
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

// ─── COMMISSION MANAGEMENT (CL02 RULES) ──────────────────────────────────────

/**
 * Updates the commission structure for a specific carrier.
 * Covers all 4 stages: Local (PL-PL), Export (PL-World), Import (World-PL), International (World-World).
 *
 * @param id - Carrier ID (UUID).
 * @param payload - Full 4-stage commission config.
 */
export const updateCommissions = async (
  id: string,
  payload: UpdateCommissionsPayload,
): Promise<Carrier> => {
  const { data } = await apiClient.put<Carrier>(
    `/admin/carriers/update-carrier-commissions/${id}`,
    payload,
  );
  return data;
};
