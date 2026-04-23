import apiClient from "../../index";
import {
  AddressRequest,
  AddressRequestListFilters,
  AddressRequestListResponse,
  ApproveAddressRequestPayload,
  RejectAddressRequestPayload,
} from "@/types/address-request";

const BASE_ROUTE = "/address-requests";

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
 */
export const getAddressRequestById = async (
  requestId: string,
): Promise<AddressRequest> => {
  const { data } = await apiClient.get<unknown>(`${BASE_ROUTE}/${requestId}`);
  const payload = data as Record<string, unknown>;

  if (payload?.request) {
    return payload.request as AddressRequest;
  }

  if (payload?.data && typeof payload.data === "object") {
    return payload.data as AddressRequest;
  }

  return payload as AddressRequest;
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
