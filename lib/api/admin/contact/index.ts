import apiClient from "../../index";
import { unwrapList } from "@/lib/api/_shared/envelope";
import type { Paged } from "@/types/api";
import type { ContactFilters, ContactMessage, ContactReply, ContactStatus } from "@/types/contact";

const BASE_ROUTE = "/admin/contact-messages";

export const getContactMessages = async (
  filters: ContactFilters,
): Promise<Paged<ContactMessage> & { newCount: number }> => {
  const { data } = await apiClient.get<unknown>(BASE_ROUTE, {
    params: { ...filters, search: filters.search || undefined },
  });
  const newCount =
    typeof data === "object" && data !== null && "newCount" in data
      ? Number((data as { newCount: unknown }).newCount) || 0
      : 0;
  return { ...unwrapList<ContactMessage>(data), newCount };
};

export const getContactMessage = async (id: string): Promise<ContactMessage> => {
  const { data } = await apiClient.get<ContactMessage>(`${BASE_ROUTE}/${id}`);
  return data;
};

export const updateContactStatus = async (id: string, status: ContactStatus): Promise<void> => {
  await apiClient.patch(`${BASE_ROUTE}/${id}/status`, { status });
};

/** Emails the rich text reply to the sender from the company address and stores it. */
export const replyToContactMessage = async (id: string, bodyHtml: string): Promise<ContactReply> => {
  const { data } = await apiClient.post<ContactReply>(`${BASE_ROUTE}/${id}/reply`, { bodyHtml });
  return data;
};

/** Stores a customer email pasted from the mailbox on the case; the case goes back to New. */
export const logCustomerReply = async (id: string, body: string): Promise<ContactReply> => {
  const { data } = await apiClient.post<ContactReply>(`${BASE_ROUTE}/${id}/customer-reply`, { body });
  return data;
};
