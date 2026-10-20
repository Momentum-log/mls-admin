/**
 * Invoices as the admin invoice endpoints return them.
 */

export type InvoiceStatus = "PENDING" | "PAID" | "EXPIRED" | "REFUNDED";

export interface InvoiceTaxRule {
  id: string;
  name: string;
  vatRate: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  userId: string;
  shipmentId: string | null;
  status: InvoiceStatus;
  basePrice: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  selectedPaymentPlatform: "STRIPE" | "PAYU";
  paymentLink: string | null;
  invoiceDate: string;
  expiresAt: string | null;
  paidAt: string | null;
  refundedAt: string | null;
  createdAt: string;
  user: { id: string; email: string; name: string; phone?: string | null } | null;
  taxRule: InvoiceTaxRule | null;
}

export interface InvoiceAuditEntry {
  id: string;
  action: string;
  reason: string | null;
  timestamp: string;
  admin: { email: string; name: string } | null;
}

export interface InvoicePayment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  paymentGateway: "STRIPE" | "PAYU";
  isManual: boolean;
  createdAt: string;
}

export interface InvoiceDetail extends Invoice {
  buyerName: string | null;
  buyerNip: string | null;
  totalNet: number | null;
  totalVat: number | null;
  totalGross: number | null;
  auditLogs: InvoiceAuditEntry[];
  payments: InvoicePayment[];
}

export interface InvoiceFilters {
  status?: InvoiceStatus;
  userId?: string;
  startDate?: string;
  endDate?: string;
  page: number;
  limit: number;
}
