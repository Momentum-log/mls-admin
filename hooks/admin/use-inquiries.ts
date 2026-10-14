import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { getInquiries, updateInquiryStatus } from "@/lib/api/admin/inquiries";
import { getApiErrorMessage } from "@/lib/api-error";
import type { InquiryFilters, InquiryStatus } from "@/types/inquiry";

export const useInquiries = (filters: InquiryFilters) => {
  return useQuery({
    queryKey: ["inquiries", filters],
    queryFn: () => getInquiries(filters),
    placeholderData: (previous) => previous,
  });
};

export const useUpdateInquiryStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: InquiryStatus }) =>
      updateInquiryStatus(id, status),
    onSuccess: () => toast.success("Enquiry updated"),
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "Could not update the enquiry")),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["inquiries"] }),
  });
};
