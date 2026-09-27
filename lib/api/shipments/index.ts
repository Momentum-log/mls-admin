import apiClient from "../index";
import {
  ShipmentFilter,
  CreateProxyShipmentPayload,
  BypassPaymentPayload,
  OverrideStatusPayload,
  Shipment,
  UserShipmentFilter,
} from "@/types/shipment";
import { AdminShipmentListResponse } from "@/types/admin-user-resources";

/**
 * Fetches a paginated list of shipments.
 *
 * @param params - Pagination, search, status and date-range filters.
 * @returns Paginated shipment list.
 */
export const getShipments = async (
  params: ShipmentFilter,
): Promise<AdminShipmentListResponse> => {
  const response = await apiClient.get<AdminShipmentListResponse>(
    "/admin/shipments",
    { params },
  );
  return response.data;
};

/**
 * Creates a shipment on behalf of a user ("proxy" shipment).
 *
 * @param data - Target user, carrier, addresses, package and selected rate.
 * @returns The created shipment.
 */
export const createProxyShipment = async (
  data: CreateProxyShipmentPayload,
): Promise<Shipment> => {
  const response = await apiClient.post<Shipment>(
    "/admin/shipments/proxy",
    data,
  );
  return response.data;
};

/**
 * Manually marks a shipment as paid without a real payment.
 *
 * @param shipmentId - The UUID of the shipment.
 * @param data - Manual transaction reference and optional notes.
 */
export const bypassPayment = async (
  shipmentId: string,
  data: BypassPaymentPayload,
): Promise<void> => {
  await apiClient.post(`/admin/shipments/${shipmentId}/bypass-payment`, data);
};

/**
 * Forces a shipment into a new lifecycle status, overriding carrier tracking.
 *
 * @param shipmentId - The UUID of the shipment.
 * @param data - Target status plus override, sync and notify flags.
 */
export const overrideStatus = async (
  shipmentId: string,
  data: OverrideStatusPayload,
): Promise<void> => {
  await apiClient.put(`/admin/shipments/${shipmentId}/manual-status`, data);
};

/**
 * Fetches a paginated list of shipments for a specific user.
 * Uses the shared shipments endpoint with a `userId` filter.
 *
 * @param params - Filter params including required userId.
 * @returns Paginated shipment list with actual API shape (`data` array).
 */
export const getUserShipments = async (
  params: UserShipmentFilter,
): Promise<AdminShipmentListResponse> => {
  const response = await apiClient.get<AdminShipmentListResponse>(
    "/admin/shipments",
    { params },
  );
  return response.data;
};

/**
 * Deletes a shipment.
 *
 * One route serves both modes — `force` is a query parameter, not a separate
 * endpoint. An earlier revision pointed forced deletes at a second path that
 * did not exist.
 *
 * @param id - The UUID of the shipment to delete.
 * @param force - If true, bypasses terminal-status checks and cascades.
 */
export const deleteShipment = async (
  id: string,
  force = false,
): Promise<void> => {
  await apiClient.delete(`/admin/shipments/${id}`, { params: { force } });
};

/**
 * Bulk deletes multiple shipments.
 *
 * @param ids - Array of shipment UUIDs to delete.
 * @param force - If true, bypasses terminal-status checks.
 */
export const bulkDeleteShipments = async (
  ids: string[],
  force = false,
): Promise<void> => {
  await apiClient.post("/admin/shipments/bulk-delete", { ids, force });
};
