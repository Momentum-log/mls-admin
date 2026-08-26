import apiClient from "../../index";
import {
  AddressRequest,
  AddressRequestListFilters,
  AddressRequestListResponse,
  ApproveAddressRequestPayload,
  RejectAddressRequestPayload,
} from "@/types/address-request";
import { unwrapOne } from "@/api/_shared/envelope";

const BASE_ROUTE = "/admin/address-requests";

/**
 * Fetches address verification requests for admin review.
 */
export const getAddressRequests = async (
  params: AddressRequestListFilters,
): Promise<AddressRequestListResponse> => {
  const { data } = await apiClient.get<AddressRequestListResponse>(BASE_ROUTE, {
    params,
  });
  return data;
};

/**
 * Fetches the full details of a single address request.
 *
 * The endpoint has been observed returning the request bare, nested under
 * `request`, and nested under `data`; `unwrapOne` covers all three.
 */
export const getAddressRequestById = async (
  requestId: string,
): Promise<AddressRequest> => {
  const { data } = await apiClient.get<unknown>(`${BASE_ROUTE}/${requestId}`);
  return unwrapOne<AddressRequest>(data, "request");
};

/**
 * Downloads/streams the proof file as a browser-safe blob.
 */
export const getAddressRequestProofFile = async (
  requestId: string,
): Promise<Blob> => {
  const { data } = await apiClient.get<Blob>(
    `${BASE_ROUTE}/${requestId}/proof-file`,
    {
      responseType: "blob",
    },
  );

  return data;
};

/**
 * Approves a pending address request.
 */
export const approveAddressRequest = async (
  requestId: string,
  payload?: ApproveAddressRequestPayload,
): Promise<void> => {
  await apiClient.post(`${BASE_ROUTE}/${requestId}/approve`, payload ?? {});
};

/**
 * Rejects a pending address request.
 */
export const rejectAddressRequest = async (
  requestId: string,
  payload: RejectAddressRequestPayload,
): Promise<void> => {
  await apiClient.post(`${BASE_ROUTE}/${requestId}/reject`, payload);
};
