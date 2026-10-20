import apiClient from "../../index";
import { unwrapList } from "@/lib/api/_shared/envelope";
import type {
  CollectionShipment,
  HubHandoffOptions,
  HubHandoffPayload,
} from "@/types/collection";

const BASE_ROUTE = "/admin/collections";

/**
 * The collection queue: every MLS-collected shipment still in MLS's hands,
 * oldest first, or only those in one status.
 */
export const getCollections = async (
  status?: string,
): Promise<CollectionShipment[]> => {
  const { data } = await apiClient.get<unknown>(BASE_ROUTE, {
    params: status ? { status } : undefined,
  });
  return unwrapList<CollectionShipment>(data).data;
};

/** Waives the collection fee on one shipment. */
export const waiveCollectionFee = async (id: string, reason?: string): Promise<void> => {
  await apiClient.post(`${BASE_ROUTE}/${id}/waive-fee`, reason ? { reason } : {});
};

/** The parcel is physically at the hub. */
export const markCollected = async (id: string): Promise<void> => {
  await apiClient.post(`${BASE_ROUTE}/${id}/mark-collected`);
};

/** Courier dates and nearby service points for handing the parcel to the carrier. */
export const getHubHandoffOptions = async (id: string): Promise<HubHandoffOptions> => {
  const { data } = await apiClient.get<HubHandoffOptions>(
    `${BASE_ROUTE}/${id}/hub-handoff-options`,
  );
  return data;
};

/** Books the carrier's courier to the hub, or records a service point drop. */
export const arrangeHubHandoff = async (
  id: string,
  payload: HubHandoffPayload,
): Promise<{ pickupConfirmationCode?: string | null }> => {
  const { data } = await apiClient.post<{ pickupConfirmationCode?: string | null }>(
    `${BASE_ROUTE}/${id}/hub-handoff`,
    payload,
  );
  return data;
};

/** The carrier has the parcel; the customer is told it is on its way. */
export const markHandedOver = async (id: string): Promise<void> => {
  await apiClient.post(`${BASE_ROUTE}/${id}/mark-handed-over`);
};

/** Waives (or restores) the collection fee for every future shipment of a customer. */
export const setCustomerCollectionFeeWaiver = async (
  userId: string,
  waived: boolean,
): Promise<void> => {
  await apiClient.put(`/admin/users/${userId}/collection-fee-waiver`, { waived });
};
