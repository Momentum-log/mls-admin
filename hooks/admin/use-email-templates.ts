import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  getEmailTemplates,
  sendOneOffEmail,
  upsertEmailTemplate,
} from "@/lib/api/admin/email-templates";
import { getApiErrorMessage } from "@/lib/api-error";
import type { SendEmailPayload, UpsertEmailTemplatePayload } from "@/types/email-template";

export const useEmailTemplates = () => {
  return useQuery({ queryKey: ["email-templates"], queryFn: getEmailTemplates });
};

export const useUpsertEmailTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpsertEmailTemplatePayload) => upsertEmailTemplate(payload),
    onSuccess: () => toast.success("Template saved"),
    onError: (error) => toast.error(getApiErrorMessage(error, "Could not save the template")),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["email-templates"] }),
  });
};

export const useSendOneOffEmail = () => {
  return useMutation({
    mutationFn: (payload: SendEmailPayload) => sendOneOffEmail(payload),
    onSuccess: () => toast.success("Email sent"),
    onError: (error) => toast.error(getApiErrorMessage(error, "Could not send the email")),
  });
};
