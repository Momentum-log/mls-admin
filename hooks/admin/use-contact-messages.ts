import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  getContactMessage,
  getContactMessages,
  replyToContactMessage,
  updateContactStatus,
} from "@/lib/api/admin/contact";
import { getApiErrorMessage } from "@/lib/api-error";
import type { ContactFilters, ContactStatus } from "@/types/contact";

const KEY = ["contact-messages"];

export const useContactMessages = (filters: ContactFilters) =>
  useQuery({
    queryKey: [...KEY, "list", filters],
    queryFn: () => getContactMessages(filters),
    placeholderData: (previous) => previous,
    refetchInterval: 60_000,
  });

/** Just the number of unread messages, for the sidebar badge. */
export const useNewContactCount = (enabled: boolean) =>
  useQuery({
    queryKey: [...KEY, "new-count"],
    queryFn: async () => (await getContactMessages({ status: "NEW", page: 1, limit: 1 })).newCount,
    enabled,
    refetchInterval: 60_000,
  });

export const useContactMessage = (id: string | null) =>
  useQuery({
    queryKey: [...KEY, "detail", id],
    queryFn: () => getContactMessage(id as string),
    enabled: !!id,
  });

export const useUpdateContactStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ContactStatus }) =>
      updateContactStatus(id, status),
    onSuccess: () => toast.success("Message updated"),
    onError: (error) => toast.error(getApiErrorMessage(error, "Could not update the message")),
    onSettled: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
};

export const useReplyToContactMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: string }) => replyToContactMessage(id, body),
    onSuccess: () => toast.success("Reply sent"),
    onError: (error) => toast.error(getApiErrorMessage(error, "Could not send the reply")),
    onSettled: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
};
