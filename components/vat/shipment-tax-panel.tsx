"use client";

import { useShipmentTax } from "@/hooks/admin/use-vat";
import { useCan } from "@/components/auth/can";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/format-currency";
import { formatDate, formatDateTime } from "@/utils/format-date";
import { CLIENT_TYPE_LABEL, REVIEW_REASON_LABEL, ROUTE_LABEL } from "@/types/vat";
import { Loader2, Percent } from "lucide-react";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right">{children}</span>
    </div>
  );
}

/**
 * How an order was taxed, and what it cost MLS. The carrier cost and margin
 * are admin-only: customers see one all-inclusive total.
 */
export function ShipmentTaxPanel({ shipmentId }: { shipmentId: string }) {
  const { can } = useCan();
  const allowed = can("shipment:read");
  const { data, isLoading } = useShipmentTax(allowed ? shipmentId : null);

  if (!allowed) return null;

  return (
    <section className="space-y-2 pt-2 border-t">
      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
        <Percent className="h-3.5 w-3.5" />
        VAT and price breakdown
      </h4>
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin text-brand-blue" />
      ) : !data?.snapshot ? (
        <p className="text-sm text-muted-foreground">No tax record for this order.</p>
      ) : (
        <TaxDetail snapshot={data.snapshot} internal={data.internal} />
      )}
    </section>
  );
}

function TaxDetail({
  snapshot: s,
  internal,
}: {
  snapshot: NonNullable<ReturnType<typeof useShipmentTax>["data"]>["snapshot"] & object;
  internal: NonNullable<ReturnType<typeof useShipmentTax>["data"]>["internal"];
}) {
  const money = (amount: number | null | undefined, currency = s.currency) =>
    amount == null ? "—" : formatCurrency(currency, amount);

  return (
    <div className="space-y-1.5">
      {s.source === "BACKFILL" && (
        <p className="text-xs text-muted-foreground">
          Reconstructed from the invoice (order placed before the VAT matrix).
        </p>
      )}
      <Row label="Client type">{CLIENT_TYPE_LABEL[s.clientType]}</Row>
      <Row label="Route">
        {s.routeType} · {ROUTE_LABEL[s.routeType]}
        {s.transitsPoland && " (via Poland)"}
      </Row>
      <Row label="VAT code">
        <Badge variant="outline">{s.vatCode}</Badge> {s.vatRatePercent}%
      </Row>
      {s.matrixVersion && <Row label="Matrix version">v{s.matrixVersion.version}</Row>}
      {(s.noteEn || s.notePl) && <Row label="Invoice note">{s.noteEn || s.notePl}</Row>}

      <Row label="Tax ID check">
        {s.validationStatus === "NOT_REQUIRED" ? (
          "Not required"
        ) : (
          <>
            {s.validationProvider} · {s.validationStatus}
          </>
        )}
      </Row>
      {s.validationRef && (
        <Row label="Reference">
          <span className="font-mono text-xs">{s.validationRef}</span>
        </Row>
      )}
      {s.validatedAt && <Row label="Checked">{formatDateTime(s.validatedAt)}</Row>}

      {s.reviewStatus !== "NONE" && (
        <Row label="Review">
          <Badge variant={s.reviewStatus === "OPEN" ? "destructive" : "secondary"}>{s.reviewStatus}</Badge>{" "}
          {s.reviewReason && (
            <span className="block text-xs text-muted-foreground">{REVIEW_REASON_LABEL[s.reviewReason]}</span>
          )}
          {s.reviewNote && <span className="block text-xs text-muted-foreground">{s.reviewNote}</span>}
        </Row>
      )}
      {s.proofRequired && (
        <Row label="0% proof (tracking, label, delivery)">
          <Badge variant={s.proofStatus === "OK" ? "secondary" : "destructive"}>{s.proofStatus}</Badge>
        </Row>
      )}

      <div className="space-y-1.5 border-t pt-2">
        <Row label="Customer total">
          <span className="font-semibold">{money(s.totalGross)}</span>
        </Row>
        <Row label="Net">{money(s.totalNet)}</Row>
        <Row label="VAT">{money(s.totalVat)}</Row>
        {internal && (
          <>
            <Row label="Carrier cost (internal)">{money(internal.carrierPrice, internal.currency)}</Row>
            <Row label="Margin (internal)">{money(internal.margin, internal.currency)}</Row>
          </>
        )}
      </div>

      {s.fxSnapshot?.rate && (
        <Row label="Exchange rate at quote">
          {s.fxSnapshot.rate.toFixed(4)} {s.fxSnapshot.source}
          {s.fxSnapshot.effectiveDate ? ` · ${formatDate(s.fxSnapshot.effectiveDate)}` : ""}
          {s.fxSnapshot.bufferPercent ? ` · +${s.fxSnapshot.bufferPercent}% buffer` : ""}
        </Row>
      )}
    </div>
  );
}
