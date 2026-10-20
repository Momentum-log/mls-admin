import apiClient from "../../index";
import { unwrapList } from "@/lib/api/_shared/envelope";
import type {
  EmailTemplate,
  SendEmailPayload,
  UpsertEmailTemplatePayload,
} from "@/types/email-template";

/** Every database template, most recently edited first. */
export const getEmailTemplates = async (): Promise<EmailTemplate[]> => {
  const { data } = await apiClient.get<unknown>("/admin/emails/templates");
  return unwrapList<EmailTemplate>(data, "templates").data;
};

/** Creates a template, or replaces the one with the same name. */
export const upsertEmailTemplate = async (
  payload: UpsertEmailTemplatePayload,
): Promise<void> => {
  await apiClient.post("/admin/emails/templates", payload);
};

/** Sends one email now, inside the MLS message layout. */
export const sendOneOffEmail = async (payload: SendEmailPayload): Promise<void> => {
  await apiClient.post("/admin/emails/send", payload);
};
