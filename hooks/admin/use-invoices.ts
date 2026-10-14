import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { getInvoice, getInvoices, markInvoicePaid } from "@/lib/api/admin/invoices";
import { getApiErrorMessage } from "@/lib/api-error";
import type { InvoiceFilters } from "@/types/invoice";

export const useInvoices = (filters: InvoiceFilters) => {
  return useQuery({
    queryKey: ["invoices", filters],
    queryFn: () => getInvoices(filters),
    placeholderData: (previous) => previous,
  });
};

export const useInvoice = (id: string | null) => {
  return useQuery({
    queryKey: ["invoice", id],
    queryFn: () => getInvoice(id as string),
    enabled: !!id,
  });
};

export const useMarkInvoicePaid = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      markInvoicePaid(id, reason),
    onSuccess: () => toast.success("Invoice marked as paid"),
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "Could not mark the invoice paid")),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoice"] });
      queryClient.invalidateQueries({ queryKey: ["shipments"] });
    },
  });
};
