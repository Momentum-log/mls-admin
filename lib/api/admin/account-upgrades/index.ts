import apiClient from "../../index";
import { unwrapList } from "@/lib/api/_shared/envelope";
import type { Paged } from "@/types/api";
import type { AccountUpgradeRequest, AccountUpgradeStatus } from "@/types/account-upgrade";

const BASE_ROUTE = "/admin/account-upgrade-requests";

export const getAccountUpgradeRequests = async (params: {
  status?: AccountUpgradeStatus;
  page: number;
  limit: number;
}): Promise<Paged<AccountUpgradeRequest>> => {
  const { data } = await apiClient.get<unknown>(BASE_ROUTE, { params });
  return unwrapList<AccountUpgradeRequest>(data, "requests");
};

/** Converts the customer to a business account with the submitted details. */
export const approveAccountUpgrade = async (id: string): Promise<void> => {
  await apiClient.post(`${BASE_ROUTE}/${id}/approve`);
};

/** Rejects the request; `feedback` (5–2000 characters) is emailed to the customer. */
export const rejectAccountUpgrade = async (id: string, feedback: string): Promise<void> => {
  await apiClient.post(`${BASE_ROUTE}/${id}/reject`, { feedback });
};

/** The attached registration document, as a blob to open in a new tab. */
export const getAccountUpgradeProofFile = async (id: string): Promise<Blob> => {
  const { data } = await apiClient.get<Blob>(`${BASE_ROUTE}/${id}/proof-file`, {
    responseType: "blob",
  });
  return data;
};
