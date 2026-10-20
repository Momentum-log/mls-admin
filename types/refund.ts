/**
 * Refund requests (server: `modules/admin/refunds`).
 *
 * Approving a request refunds the invoice in full through the gateway the
 * customer paid with (Stripe or PayU). The gateway confirms asynchronously:
 * a refund it accepts completes on its own, one it refuses returns to
 * `PENDING` with `gatewayStatus: "FAILED"` and the reason in `gatewayError`.
 * Approving with `manual: true` skips the gateway; staff refund by hand and
 * then mark the request complete.
 */

export type RefundStatus = "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED";

export type GatewayRefundStatus = "PENDING" | "SUCCEEDED" | "FAILED";

interface AdminRef {
  id: string;
  name: string;
  email: string;
}

export interface RefundRequest {
  id: string;
  invoiceId: string;
  status: RefundStatus;
  requestedAt: string;
  reason: string | null;
  approvedAt: string | null;
  rejectionReason: string | null;
  completedAt: string | null;
  notes: string | null;
  paymentGateway: "STRIPE" | "PAYU" | null;
  gatewayRefundId: string | null;
  gatewayStatus: GatewayRefundStatus | null;
  gatewayError: string | null;
  invoice: {
    id: string;
    invoiceNumber: string;
    totalAmount: number;
    /** Not sent by every server version; PLN is assumed when absent. */
    currency?: string;
  } | null;
  requestedByAdmin: AdminRef | null;
  approvedByAdmin: AdminRef | null;
}

export interface RefundFilters {
  status?: RefundStatus;
  invoiceId?: string;
  page: number;
  limit: number;
}

export interface ApproveRefundPayload {
  notes?: string;
  /** Record the approval only; staff send the money themselves. */
  manual?: boolean;
}
