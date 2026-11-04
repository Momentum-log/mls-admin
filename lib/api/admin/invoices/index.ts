import apiClient from "../../index";
import type { ManualPaymentMethod } from "@/types/shipment";
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

/** Body of `POST /admin/invoices/:id/mark-paid`. `reason` is required when waived. */
export interface MarkInvoicePaidPayload {
  method?: ManualPaymentMethod;
  reference?: string;
  reason?: string;
}

/**
 * Marks a pending invoice paid, e.g. after a bank transfer. For a shipment's
 * invoice the server settles the shipment too (label created).
 */
export const markInvoicePaid = async (
  id: string,
  payload: MarkInvoicePaidPayload,
): Promise<void> => {
  await apiClient.post(`${BASE_ROUTE}/${id}/mark-paid`, payload);
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
