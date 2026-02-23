import apiClient from "../index";
import {
  ShipmentListResponse,
  ShipmentFilter,
  CreateProxyShipmentPayload,
  BypassPaymentPayload,
  OverrideStatusPayload,
  Shipment,
  UserShipmentFilter,
} from "@/types/shipment";
import { AdminShipmentListResponse } from "@/types/admin-user-resources";

export const getShipments = async (
  params: ShipmentFilter,
): Promise<AdminShipmentListResponse> => {
  const response = await apiClient.get<AdminShipmentListResponse>(
    "/shipments",
    {
      params,
    },
  );
  return response.data;
};

export const createProxyShipment = async (
  data: CreateProxyShipmentPayload,
): Promise<Shipment> => {
  const response = await apiClient.post<Shipment>("/shipments/proxy", data);
  return response.data;
};

export const bypassPayment = async (
  shipmentId: string,
  data: BypassPaymentPayload,
): Promise<void> => {
  await apiClient.post(`/shipments/${shipmentId}/bypass-payment`, data);
};

export const overrideStatus = async (
  shipmentId: string,
  data: OverrideStatusPayload,
): Promise<void> => {
  await apiClient.put(`/shipments/${shipmentId}/manual-status`, data);
};

/**
 * Fetches a paginated list of shipments for a specific user.
 * Uses the shared `/shipments` endpoint with a `userId` filter.
 *
 * @param params - Filter params including required userId.
 * @returns Paginated shipment list with actual API shape (`data` array).
 */
export const getUserShipments = async (
  params: UserShipmentFilter,
): Promise<AdminShipmentListResponse> => {
  const response = await apiClient.get<AdminShipmentListResponse>(
    "/shipments",
    { params },
  );
  return response.data;
};

/**
 * Deletes a shipment.
 *
 * @param id - The UUID of the shipment to delete.
 * @param force - If true, bypasses terminal status checks (Admin only).
 */
export const deleteShipment = async (
  id: string,
  force = false,
): Promise<void> => {
  // Use admin endpoint for forced deletion to ensure permissions/logic
  const url = force ? `/admin/shipments/${id}` : `/shipments/${id}`;
  await apiClient.delete(url, { params: { force } });
};

/**
 * Bulk deletes multiple shipments.
 *
 * @param ids - Array of shipment UUIDs to delete.
 * @param force - If true, bypasses terminal status checks.
 */
export const bulkDeleteShipments = async (
  ids: string[],
  force = false,
): Promise<void> => {
  await apiClient.post("/admin/shipments/bulk-delete", { ids, force });
};
