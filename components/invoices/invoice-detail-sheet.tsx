"use client";

import { useState } from "react";
import { useInvoice, useMarkInvoicePaid } from "@/hooks/admin/use-invoices";
import { useRequestInvoiceRefund } from "@/hooks/admin/use-refunds";
import { formatCurrency } from "@/utils/format-currency";
import { formatDateTime } from "@/utils/format-date";
import { Can } from "@/components/auth/can";
import { ReasonDialog } from "@/components/admin/reason-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import CopyButton from "@/components/ui/copy-button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Banknote, ExternalLink, FileText, History, Loader2, Undo2 } from "lucide-react";
import { INVOICE_STATUS_VARIANT } from "./invoice-status";

interface InvoiceDetailSheetProps {
  invoiceId: string | null;
  onOpenChange: (open: boolean) => void;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right">{children}</span>
    </div>
  );
}

/**
 * One invoice: amounts, customer, payments and its audit trail, with the two
 * staff actions the server offers on an invoice — mark a pending one paid
 * (a bank transfer, say) and open a refund request on a paid one.
 */
export function InvoiceDetailSheet({ invoiceId, onOpenChange }: InvoiceDetailSheetProps) {
  const { data: invoice, isLoading } = useInvoice(invoiceId);
  const { mutate: markPaid, isPending: isMarkingPaid } = useMarkInvoicePaid();
  const { mutate: requestRefund, isPending: isRequesting } = useRequestInvoiceRefund();
  const [markPaidOpen, setMarkPaidOpen] = useState(false);
  const [refundOpen, setRefundOpen] = useState(false);

  const money = (amount: number | null | undefined) =>
    amount == null ? "—" : formatCurrency(invoice?.currency ?? "PLN", amount);

  return (
    <Sheet open={!!invoiceId} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Invoice
          </SheetTitle>
          <SheetDescription>
            <span className="font-mono">{invoice?.invoiceNumber}</span>
          </SheetDescription>
        </SheetHeader>

        {isLoading || !invoice ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-brand-blue" />
          </div>
        ) : (
          <div className="space-y-6 px-4 pb-6">
            <div className="flex items-center gap-2">
              <Badge variant={INVOICE_STATUS_VARIANT[invoice.status]}>{invoice.status}</Badge>
              <Badge variant="outline">{invoice.selectedPaymentPlatform}</Badge>
            </div>

            <section className="space-y-1.5">
              <Row label="Net">{money(invoice.totalNet ?? invoice.basePrice)}</Row>
              <Row label={`VAT${invoice.taxRule ? ` (${invoice.taxRule.vatRate}%)` : ""}`}>
                {money(invoice.totalVat ?? invoice.taxAmount)}
              </Row>
              <Row label="Total">
                <span className="font-semibold">
                  {money(invoice.totalGross ?? invoice.totalAmount)}
                </span>
              </Row>
            </section>

            <section className="space-y-1.5 border-t pt-4">
              <Row label="Customer">{invoice.user?.name ?? invoice.buyerName ?? "—"}</Row>
              <Row label="Email">{invoice.user?.email ?? "—"}</Row>
              {invoice.buyerNip && <Row label="NIP">{invoice.buyerNip}</Row>}
              <Row label="Issued">{formatDateTime(invoice.invoiceDate ?? invoice.createdAt)}</Row>
              {invoice.expiresAt && invoice.status === "PENDING" && (
                <Row label="Expires">{formatDateTime(invoice.expiresAt)}</Row>
              )}
              {invoice.paidAt && <Row label="Paid">{formatDateTime(invoice.paidAt)}</Row>}
              {invoice.refundedAt && <Row label="Refunded">{formatDateTime(invoice.refundedAt)}</Row>}
              {invoice.shipmentId && (
                <Row label="Shipment">
                  <span className="inline-flex items-center gap-1 font-mono text-xs">
                    {invoice.shipmentId.slice(0, 8)}…
                    <CopyButton text={invoice.shipmentId} tooltipText="Copy shipment id" />
                  </span>
                </Row>
              )}
            </section>

            {invoice.payments.length > 0 && (
              <section className="space-y-2 border-t pt-4">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Payments
                </h4>
                {invoice.payments.map((payment) => (
                  <div key={payment.id} className="flex justify-between text-sm">
                    <span>
                      {payment.isManual ? "Manual" : payment.paymentGateway} ·{" "}
                      {formatDateTime(payment.createdAt)}
                    </span>
                    <span>
                      {formatCurrency(payment.currency, payment.amount)}{" "}
                      <Badge variant="outline" className="text-[10px]">
                        {payment.status}
                      </Badge>
                    </span>
                  </div>
                ))}
              </section>
            )}

            <section className="space-y-2 border-t pt-4">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                <History className="h-3.5 w-3.5" />
                History
              </h4>
              {invoice.auditLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No changes recorded.</p>
              ) : (
                <ol className="space-y-2">
                  {invoice.auditLogs.map((entry) => (
                    <li key={entry.id} className="text-sm">
                      <span className="font-medium">{entry.action.replaceAll("_", " ")}</span>
                      <span className="block text-xs text-muted-foreground">
                        {formatDateTime(entry.timestamp)}
                        {entry.admin ? ` · ${entry.admin.name}` : ""}
                        {entry.reason ? ` · ${entry.reason}` : ""}
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </section>

            <section className="flex flex-col gap-2 border-t pt-4">
              {invoice.paymentLink && invoice.status === "PENDING" && (
                <Button variant="outline" className="justify-start" asChild>
                  <a href={invoice.paymentLink} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open payment link
                  </a>
                </Button>
              )}
              {invoice.status === "PENDING" && (
                <Can do="shipment:write" fallback="disable">
                  <Button
                    variant="outline"
                    className="justify-start"
                    onClick={() => setMarkPaidOpen(true)}
                  >
                    <Banknote className="mr-2 h-4 w-4" />
                    Mark as paid
                  </Button>
                </Can>
              )}
              {invoice.status === "PAID" && (
                <Can do="shipment:write" fallback="disable">
                  <Button
                    variant="outline"
                    className="justify-start"
                    onClick={() => setRefundOpen(true)}
                  >
                    <Undo2 className="mr-2 h-4 w-4" />
                    Request a refund
                  </Button>
                </Can>
              )}
            </section>
          </div>
        )}
      </SheetContent>

      <ReasonDialog
        open={markPaidOpen}
        onOpenChange={setMarkPaidOpen}
        title="Mark this invoice paid?"
        description="Use this when the customer paid outside the gateway, for example by bank transfer."
        label="Reference or note"
        confirmLabel="Mark as paid"
        isLoading={isMarkingPaid}
        onConfirm={(reason) => {
          if (!invoiceId) return;
          markPaid(
            { id: invoiceId, reason: reason || undefined },
            { onSuccess: () => setMarkPaidOpen(false) },
          );
        }}
      />

      <ReasonDialog
        open={refundOpen}
        onOpenChange={setRefundOpen}
        title="Request a refund?"
        description="This opens a refund request for the full amount. Nothing is sent until it is approved in Refunds."
        label="Reason"
        required
        confirmLabel="Open refund request"
        isLoading={isRequesting}
        onConfirm={(reason) => {
          if (!invoiceId) return;
          requestRefund(
            { invoiceId, reason },
            { onSuccess: () => setRefundOpen(false) },
          );
        }}
      />
    </Sheet>
  );
}
