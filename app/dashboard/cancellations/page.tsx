"use client";

import { useState } from "react";
import Link from "next/link";
import {
  useApproveCancellation,
  useCancellationRequests,
  useRejectCancellation,
} from "@/hooks/admin/use-cancellations";
import type { CancellationRequest, CancellationStatus } from "@/types/cancellation";
import { getPaymentStatusVariant, getShipmentStatusMeta } from "@/lib/shipment-status";
import { formatCurrency } from "@/utils/format-currency";
import { formatDateTime } from "@/utils/format-date";
import { Can } from "@/components/auth/can";
import { Pager } from "@/components/admin/pager";
import { ReasonDialog } from "@/components/admin/reason-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Ban, Check, Loader2, RefreshCw, X } from "lucide-react";

const STATUS_FILTERS: { value: CancellationStatus; label: string }[] = [
  { value: "OPEN", label: "Waiting for a decision" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "WITHDRAWN", label: "Withdrawn by customer" },
];

const STATUS_VARIANT: Record<CancellationStatus, "default" | "secondary" | "destructive" | "outline"> = {
  OPEN: "secondary",
  APPROVED: "default",
  REJECTED: "destructive",
  WITHDRAWN: "outline",
};

/**
 * Shipment cancellation queue.
 *
 * Customers cancel unpaid shipments themselves; a paid shipment becomes a
 * request here. Approving cancels the shipment (and a booked courier pickup)
 * and, when it was paid, opens a refund request in Refunds. Rejecting emails
 * the customer the reason.
 */
export default function CancellationsPage() {
  const [status, setStatus] = useState<CancellationStatus>("OPEN");
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, isFetching, refetch } = useCancellationRequests({
    status,
    page,
    limit,
  });
  const requests = data?.data ?? [];

  const [approveTarget, setApproveTarget] = useState<CancellationRequest | null>(null);
  const [rejectTarget, setRejectTarget] = useState<CancellationRequest | null>(null);
  const { mutate: approve, isPending: isApproving } = useApproveCancellation();
  const { mutate: reject, isPending: isRejecting } = useRejectCancellation();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Cancellations</h2>
          <p className="text-muted-foreground">
            Customers asking to cancel a paid shipment.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(value as CancellationStatus);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTERS.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={isFetching ? "mr-2 h-4 w-4 animate-spin" : "mr-2 h-4 w-4"} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Shipment</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Customer&apos;s reason</TableHead>
              <TableHead>Requested</TableHead>
              <TableHead>{status === "OPEN" ? "Status" : "Decision"}</TableHead>
              <TableHead className="text-right w-[200px]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-brand-blue" />
                </TableCell>
              </TableRow>
            ) : requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Ban className="h-10 w-10 opacity-20" />
                    <p className="font-medium">No requests here.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              requests.map((request) => {
                const shipment = request.shipment;
                const meta = getShipmentStatusMeta(shipment.shipmentStatus);
                return (
                  <TableRow key={request.id}>
                    <TableCell>
                      <span className="font-mono text-sm font-bold">
                        {shipment.customTrackingNumber}
                      </span>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        <Badge variant={meta.variant} className="text-[10px]">
                          {meta.label}
                        </Badge>
                        <Badge
                          variant={getPaymentStatusVariant(shipment.paymentStatus)}
                          className="text-[10px]"
                        >
                          {shipment.paymentStatus}
                        </Badge>
                      </div>
                      {shipment.actualPrice != null && (
                        <span className="block text-xs text-muted-foreground mt-1">
                          {formatCurrency(shipment.currency ?? "PLN", shipment.actualPrice)}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-sm">{shipment.user?.name ?? "—"}</span>
                      <span className="block text-xs text-muted-foreground">
                        {shipment.user?.email}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-[260px] text-sm whitespace-normal">
                      {request.reason || (
                        <span className="text-muted-foreground italic">No reason given</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm whitespace-nowrap">
                      {formatDateTime(request.createdAt)}
                    </TableCell>
                    <TableCell className="text-sm max-w-[240px] whitespace-normal">
                      <Badge variant={STATUS_VARIANT[request.status]} className="text-xs">
                        {request.status}
                      </Badge>
                      {request.decisionNotes && (
                        <span className="block text-xs text-muted-foreground mt-1">
                          {request.decisionNotes}
                        </span>
                      )}
                      {request.refundRequestId && (
                        <Link
                          href="/dashboard/refunds"
                          className="block text-xs text-brand-blue hover:underline mt-1"
                        >
                          Refund opened
                        </Link>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {request.status === "OPEN" ? (
                        <div className="flex justify-end gap-2">
                          <Can do="shipment:write" fallback="disable">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setRejectTarget(request)}
                            >
                              <X className="mr-1 h-4 w-4" />
                              Reject
                            </Button>
                          </Can>
                          <Can do="shipment:write" fallback="disable">
                            <Button size="sm" onClick={() => setApproveTarget(request)}>
                              <Check className="mr-1 h-4 w-4" />
                              Approve
                            </Button>
                          </Can>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {request.decidedAt ? formatDateTime(request.decidedAt) : "—"}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Pager page={page} pagination={data?.pagination} onPageChange={setPage} isLoading={isFetching} />

      <ReasonDialog
        open={!!approveTarget}
        onOpenChange={(open) => !open && setApproveTarget(null)}
        title={`Cancel ${approveTarget?.shipment.customTrackingNumber ?? "shipment"}?`}
        description={
          <div className="space-y-2">
            <p>
              The shipment is cancelled and a booked courier pickup is cancelled with the
              carrier. If the carrier refuses, nothing changes.
            </p>
            {approveTarget?.shipment.paymentStatus === "PAID" && (
              <p>
                It was paid, so a refund request opens in Refunds. Approve it there to send
                the money back.
              </p>
            )}
            <p className="font-medium">
              Void the shipping label in the carrier&apos;s portal yourself.
            </p>
          </div>
        }
        label="Note to keep with the decision"
        confirmLabel="Approve cancellation"
        isLoading={isApproving}
        onConfirm={(notes) => {
          if (!approveTarget) return;
          approve(
            { id: approveTarget.id, notes: notes || undefined },
            { onSuccess: () => setApproveTarget(null) },
          );
        }}
      />

      <ReasonDialog
        open={!!rejectTarget}
        onOpenChange={(open) => !open && setRejectTarget(null)}
        title="Reject this cancellation?"
        description="The shipment goes ahead. The customer is emailed the reason below."
        label="Reason for the customer"
        placeholder="e.g. The parcel has already been handed to the carrier."
        required
        destructive
        confirmLabel="Reject request"
        isLoading={isRejecting}
        onConfirm={(reason) => {
          if (!rejectTarget) return;
          reject(
            { id: rejectTarget.id, reason },
            { onSuccess: () => setRejectTarget(null) },
          );
        }}
      />
    </div>
  );
}
