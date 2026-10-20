import apiClient from "../../index";
import { unwrapList } from "@/lib/api/_shared/envelope";
import type { Paged } from "@/types/api";
import type { Inquiry, InquiryFilters, InquiryStatus } from "@/types/inquiry";

const BASE_ROUTE = "/admin/inquiries";

export const getInquiries = async (
  filters: InquiryFilters,
): Promise<Paged<Inquiry>> => {
  const { data } = await apiClient.get<unknown>(BASE_ROUTE, {
    params: { ...filters, search: filters.search || undefined },
  });
  return unwrapList<Inquiry>(data);
};

export const updateInquiryStatus = async (
  id: string,
  status: InquiryStatus,
): Promise<void> => {
  await apiClient.patch(`${BASE_ROUTE}/${id}/status`, { status });
};
