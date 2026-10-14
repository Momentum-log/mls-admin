import apiClient from "../../index";
import { unwrapList, unwrapOne } from "@/lib/api/_shared/envelope";
import type { Paged } from "@/types/api";
import type { Invoice, InvoiceDetail, InvoiceFilters } from "@/types/invoice";

const BASE_ROUTE = "/admin/invoices";

/** Invoices, newest first. The endpoint pages by offset. */
export const getInvoices = async ({
  page,
  limit,
  ...filters
}: InvoiceFilters): Promise<Paged<Invoice>> => {
  const { data } = await apiClient.get<unknown>(BASE_ROUTE, {
    params: { ...filters, limit, offset: (page - 1) * limit },
  });
  return unwrapList<Invoice>(data);
};

/** One invoice with its payments and audit trail. */
export const getInvoice = async (id: string): Promise<InvoiceDetail> => {
  const { data } = await apiClient.get<unknown>(`${BASE_ROUTE}/${id}`);
  return unwrapOne<InvoiceDetail>(data, "data");
};

/** Marks a pending invoice paid, e.g. after a bank transfer. */
export const markInvoicePaid = async (
  id: string,
  reason?: string,
): Promise<void> => {
  await apiClient.post(`${BASE_ROUTE}/${id}/mark-paid`, reason ? { reason } : {});
};

/**
 * Downloads the filtered invoices as CSV. The token travels in a header, so
 * a plain link would not authenticate; the file is fetched as a blob instead.
 */
export const exportInvoicesCsv = async (
  filters: Omit<InvoiceFilters, "page" | "limit">,
): Promise<Blob> => {
  const { data } = await apiClient.get<Blob>(`${BASE_ROUTE}/export`, {
    params: { ...filters, format: "csv" },
    responseType: "blob",
  });
  return data;
};
