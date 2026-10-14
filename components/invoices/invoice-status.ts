import type { InvoiceStatus } from "@/types/invoice";

/** Badge variant per invoice status. */
export const INVOICE_STATUS_VARIANT: Record<
  InvoiceStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  PENDING: "secondary",
  PAID: "default",
  EXPIRED: "destructive",
  REFUNDED: "outline",
};
