"use client";

import { useState } from "react";
import {
  useApproveRefund,
  useCompleteRefund,
  useRefundRequests,
  useRejectRefund,
} from "@/hooks/admin/use-refunds";
import type { RefundRequest, RefundStatus } from "@/types/refund";
import { formatCurrency } from "@/utils/format-currency";
import { formatDateTime } from "@/utils/format-date";
import { Can } from "@/components/auth/can";
import { Pager } from "@/components/admin/pager";
import { ReasonDialog } from "@/components/admin/reason-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertTriangle, Check, Clock, Loader2, ReceiptText, RefreshCw, X } from "lucide-react";

const STATUS_FILTERS: { value: RefundStatus | "ALL"; label: string }[] = [
  { value: "PENDING", label: "Waiting for approval" },
  { value: "APPROVED", label: "Approved, not yet paid out" },
  { value: "COMPLETED", label: "Completed" },
  { value: "REJECTED", label: "Rejected" },
  { value: "ALL", label: "All" },
];

const GATEWAY_LABEL = { STRIPE: "Stripe", PAYU: "PayU" } as const;

/** What a request is waiting on, in words staff can act on. */
function describeState(request: RefundRequest): { text: string; tone: "muted" | "warn" | "danger" } | null {
  if (request.status === "PENDING" && request.gatewayStatus === "FAILED") {
    return {
      text: `The gateway refused the last attempt: ${request.gatewayError ?? "no reason given"}`,
      tone: "danger",
    };
  }
  if (request.status === "APPROVED" && request.paymentGateway) {
    return {
      text: `Sent to ${GATEWAY_LABEL[request.paymentGateway]}; completes when it confirms.`,
      tone: "muted",
    };
  }
  if (request.status === "APPROVED") {
    return { text: "Manual refund: send the money, then mark it paid out.", tone: "warn" };
  }
  if (request.status === "REJECTED" && request.rejectionReason) {
    return { text: request.rejectionReason, tone: "muted" };
  }
  return null;
}

/**
 * Refund requests.
 *
 * Requests open when staff approve a paid shipment's cancellation or ask for
 * a refund on an invoice. Approving refunds the invoice in full through the
 * gateway the customer paid with; "refund by hand" only records the approval
 * so staff can pay back some other way and mark it paid out afterwards.
 */
export default function RefundsPage() {
  const [status, setStatus] = useState<RefundStatus | "ALL">("PENDING");
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, isFetching, refetch } = useRefundRequests({
    status: status === "ALL" ? undefined : status,
    page,
    limit,
  });
  const requests = data?.data ?? [];

  const [approveTarget, setApproveTarget] = useState<RefundRequest | null>(null);
  const [manual, setManual] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<RefundRequest | null>(null);
  const [completeTarget, setCompleteTarget] = useState<RefundRequest | null>(null);
  const [externalRef, setExternalRef] = useState("");

  const { mutate: approve, isPending: isApproving } = useApproveRefund();
  const { mutate: reject, isPending: isRejecting } = useRejectRefund();
  const { mutate: complete, isPending: isCompleting } = useCompleteRefund();

  const amountOf = (request: RefundRequest) =>
    request.invoice
      ? formatCurrency(request.invoice.currency ?? "PLN", request.invoice.totalAmount)
      : "—";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Refunds</h2>
          <p className="text-muted-foreground">
            Approve a refund to send the money back through Stripe or PayU.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(value as RefundStatus | "ALL");
              setPage(1);
            }}
          >
            <SelectTrigger className="w-60">
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
              <TableHead>Invoice</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Requested</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right w-[220px]">Action</TableHead>
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
                    <ReceiptText className="h-10 w-10 opacity-20" />
                    <p className="font-medium">No refund requests here.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              requests.map((request) => {
                const state = describeState(request);
                return (
                  <TableRow key={request.id}>
                    <TableCell className="font-mono text-sm font-bold">
                      {request.invoice?.invoiceNumber ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm font-medium whitespace-nowrap">
                      {amountOf(request)}
                    </TableCell>
                    <TableCell className="max-w-[240px] text-sm whitespace-normal">
                      {request.reason || (
                        <span className="text-muted-foreground italic">No reason given</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm whitespace-nowrap">
                      {formatDateTime(request.requestedAt)}
                      {request.requestedByAdmin && (
                        <span className="block text-xs text-muted-foreground">
                          by {request.requestedByAdmin.name}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[280px] whitespace-normal">
                      <Badge
                        variant={
                          request.status === "COMPLETED"
                            ? "default"
                            : request.status === "REJECTED"
                              ? "destructive"
                              : "secondary"
                        }
                        className="text-xs"
                      >
                        {request.status}
                      </Badge>
                      {state && (
                        <span
                          className={
                            state.tone === "danger"
                              ? "mt-1 flex items-start gap-1 text-xs text-destructive"
                              : state.tone === "warn"
                                ? "mt-1 flex items-start gap-1 text-xs text-amber-700"
                                : "mt-1 flex items-start gap-1 text-xs text-muted-foreground"
                          }
                        >
                          {state.tone === "danger" ? (
                            <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
                          ) : state.tone === "muted" && request.status === "APPROVED" ? (
                            <Clock className="h-3 w-3 mt-0.5 shrink-0" />
                          ) : null}
                          {state.text}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {request.status === "PENDING" && (
                        <div className="flex justify-end gap-2">
                          <Can do="shipment:write" fallback="disable">
                            <Button size="sm" variant="outline" onClick={() => setRejectTarget(request)}>
                              <X className="mr-1 h-4 w-4" />
                              Reject
                            </Button>
                          </Can>
                          <Can do="shipment:write" fallback="disable">
                            <Button
                              size="sm"
                              onClick={() => {
                                setManual(false);
                                setApproveTarget(request);
                              }}
                            >
                              <Check className="mr-1 h-4 w-4" />
                              {request.gatewayStatus === "FAILED" ? "Retry" : "Approve"}
                            </Button>
                          </Can>
                        </div>
                      )}
                      {request.status === "APPROVED" && !request.paymentGateway && (
                        <Can do="shipment:write" fallback="disable">
                          <Button
                            size="sm"
                            onClick={() => {
                              setExternalRef("");
                              setCompleteTarget(request);
                            }}
                          >
                            Mark paid out
                          </Button>
                        </Can>
                      )}
                      {(request.status === "COMPLETED" || request.status === "REJECTED") && (
                        <span className="text-xs text-muted-foreground">
                          {request.completedAt
                            ? formatDateTime(request.completedAt)
                            : request.approvedAt
                              ? formatDateTime(request.approvedAt)
                              : "—"}
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
        title={`Refund ${approveTarget ? amountOf(approveTarget) : ""}?`}
        description={
          manual
            ? "Nothing is sent. Pay the customer back yourself, then come back and mark it paid out."
            : "The full invoice amount goes back to the customer through the gateway they paid with. If the gateway refuses, the request comes back here with its reason."
        }
        label="Note"
        confirmLabel={manual ? "Approve, I'll refund by hand" : "Send refund"}
        isLoading={isApproving}
        onConfirm={(notes) => {
          if (!approveTarget) return;
          approve(
            { id: approveTarget.id, payload: { notes: notes || undefined, manual } },
            { onSettled: () => setApproveTarget(null) },
          );
        }}
      >
        <div className="flex items-start justify-between gap-4 rounded-md border p-3">
          <div className="space-y-0.5">
            <Label htmlFor="manual-refund" className="font-medium">
              Refund by hand instead
            </Label>
            <p className="text-xs text-muted-foreground">
              For a bank transfer, or when the payment can&apos;t be refunded through the
              gateway.
            </p>
          </div>
          <Switch id="manual-refund" checked={manual} onCheckedChange={setManual} />
        </div>
      </ReasonDialog>

      <ReasonDialog
        open={!!rejectTarget}
        onOpenChange={(open) => !open && setRejectTarget(null)}
        title="Reject this refund?"
        description="No money is sent. The reason is kept on the request."
        label="Reason"
        required
        destructive
        confirmLabel="Reject refund"
        isLoading={isRejecting}
        onConfirm={(reason) => {
          if (!rejectTarget) return;
          reject(
            { id: rejectTarget.id, reason },
            { onSuccess: () => setRejectTarget(null) },
          );
        }}
      />

      <Dialog open={!!completeTarget} onOpenChange={(open) => !open && setCompleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark this refund paid out?</DialogTitle>
            <DialogDescription>
              Only once the money has left. The invoice and shipment are marked refunded.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (!completeTarget) return;
              complete(
                { id: completeTarget.id, externalRefundId: externalRef.trim() || undefined },
                { onSuccess: () => setCompleteTarget(null) },
              );
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="external-ref">
                Transfer reference <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Input
                id="external-ref"
                value={externalRef}
                onChange={(e) => setExternalRef(e.target.value)}
                placeholder="e.g. bank transfer reference"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCompleteTarget(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isCompleting}>
                {isCompleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Mark paid out
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
