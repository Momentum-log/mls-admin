"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import CopyButton from "@/components/ui/copy-button";
import { Loader2, ExternalLink, Warehouse, Printer } from "lucide-react";
import { useMultiLegShipment } from "@/hooks/admin/use-multi-leg";
import type { ShipmentLeg } from "@/types/multi-leg";
import { getShipmentStatusMeta } from "@/lib/shipment-status";
import { formatCurrency } from "@/utils/format-currency";
import { formatDateTime } from "@/utils/format-date";

interface MultiLegDetailSheetProps {
  shipmentId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Renders one leg. Leg 2's label is centre-printed and flagged as such. */
function LegCard({ leg }: { leg: ShipmentLeg }) {
  const isFeeder = leg.sequence === 1;

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant={isFeeder ? "secondary" : "default"}>
            Leg {leg.sequence}
          </Badge>
          <span className="text-sm font-medium">
            {isFeeder ? "Customer → Hub" : "Hub → Destination"}
          </span>
        </div>
        {leg.isManualEntry && (
          <Badge variant="outline" className="text-xs">
            Manual entry
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-muted-foreground">Carrier</p>
          <p className="font-medium">{leg.carrierCode}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Service</p>
          <p className="font-medium">{leg.serviceName}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Quoted price</p>
          <p className="font-medium">
            {formatCurrency(leg.currency, leg.quotedPrice)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Created</p>
          <p className="font-medium">{formatDateTime(leg.createdAt)}</p>
        </div>
      </div>

      {leg.trackingNumber ? (
        <div className="flex items-center justify-between text-sm border-t pt-3">
          <span className="text-muted-foreground">Carrier tracking</span>
          <div className="flex items-center gap-1">
            <span className="font-mono text-xs">{leg.trackingNumber}</span>
            <CopyButton text={leg.trackingNumber} tooltipText="Copy" />
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground italic border-t pt-3">
          Not yet created.
        </p>
      )}

      {leg.status && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Carrier status</span>
          {/* Free-text from the carrier — deliberately not the MLS enum. */}
          <span className="text-xs">{leg.status}</span>
        </div>
      )}

      {leg.labelUrl && (
        <div className="space-y-2 border-t pt-3">
          {!isFeeder && (
            <div className="flex items-start gap-2 rounded-md bg-amber-50 border border-amber-200 p-2">
              <Printer className="h-3.5 w-3.5 text-amber-700 mt-0.5 shrink-0" />
              <p className="text-[11px] text-amber-800">
                Printed at the sorting centre. Never send this to the customer
                — they already hold leg 1&apos;s label, and a parcel carrying
                two barcodes fails physically.
              </p>
            </div>
          )}
          <Button variant="outline" size="sm" className="w-full" asChild>
            <a href={leg.labelUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              View Leg {leg.sequence} Label
            </a>
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * Detail view for a hub-routed shipment, showing both legs.
 */
export default function MultiLegDetailSheet({
  shipmentId,
  open,
  onOpenChange,
}: MultiLegDetailSheetProps) {
  const { data: shipment, isLoading } = useMultiLegShipment(
    shipmentId ?? undefined,
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Warehouse className="h-5 w-5" />
            Hub-Routed Shipment
          </SheetTitle>
          <SheetDescription>
            <span className="font-mono">
              {shipment?.customTrackingNumber ?? "…"}
            </span>
          </SheetDescription>
        </SheetHeader>

        {isLoading || !shipment ? (
          <div className="flex h-[60vh] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-brand-blue" />
          </div>
        ) : (
          <div className="space-y-6 px-4 pb-6">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant={getShipmentStatusMeta(shipment.shipmentStatus).variant}
              >
                {getShipmentStatusMeta(shipment.shipmentStatus).label}
              </Badge>
              {shipment.paymentStatus && (
                <Badge variant="outline">{shipment.paymentStatus}</Badge>
              )}
            </div>

            <p className="text-sm text-muted-foreground">
              {getShipmentStatusMeta(shipment.shipmentStatus).description}
            </p>

            <section className="space-y-2">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Customer
              </h4>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name</span>
                  <span>{shipment.customer?.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <div className="flex items-center gap-1">
                    <span>{shipment.customer?.email}</span>
                    {shipment.customer?.email && (
                      <CopyButton
                        text={shipment.customer.email}
                        tooltipText="Copy"
                      />
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Legs
              </h4>
              {shipment.legs
                ?.slice()
                .sort((a, b) => a.sequence - b.sequence)
                .map((leg) => <LegCard key={leg.id} leg={leg} />)}
            </section>

            {shipment.actualPrice !== undefined && (
              <section className="space-y-1.5 text-sm border-t pt-4">
                <div className="flex justify-between font-medium">
                  <span className="text-muted-foreground">
                    Customer paid (both legs)
                  </span>
                  <span>
                    {formatCurrency(
                      shipment.currency ?? "PLN",
                      shipment.actualPrice,
                    )}
                  </span>
                </div>
              </section>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
