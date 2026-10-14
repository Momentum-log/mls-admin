/**
 * Customer shipment cancellation requests (server: `cancellation.service.ts`).
 *
 * Customers can cancel an unpaid shipment outright; a paid one becomes a
 * request that staff approve or reject here. Approving cancels the shipment
 * (and a confirmed courier pickup) and opens a refund request when the
 * shipment was paid.
 */

export type CancellationStatus = "OPEN" | "APPROVED" | "REJECTED" | "WITHDRAWN";

export interface CancellationRequest {
  id: string;
  shipmentId: string;
  userId: string;
  status: CancellationStatus;
  /** The customer's reason, when they gave one. */
  reason: string | null;
  decidedByAdminId: string | null;
  decisionNotes: string | null;
  decidedAt: string | null;
  /** Set when approval opened a refund request on a paid invoice. */
  refundRequestId: string | null;
  createdAt: string;
  updatedAt: string;
  shipment: {
    id: string;
    customTrackingNumber: string;
    shipmentStatus: string;
    paymentStatus: string;
    actualPrice: number | null;
    currency: string | null;
    invoiceId: string | null;
    user: { id: string; name: string; email: string } | null;
  };
}

export interface CancellationFilters {
  status?: CancellationStatus;
  page: number;
  limit: number;
}
