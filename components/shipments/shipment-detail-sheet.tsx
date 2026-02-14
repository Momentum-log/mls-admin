"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import CopyButton from "@/components/ui/copy-button";
import ConversionBadge from "@/components/ui/conversion-badge";
import { formatDate, formatDateTime } from "@/utils/format-date";
import type { AdminShipment, AdminLead } from "@/types/admin-user-resources";
import {
  Truck,
  MapPin,
  Package,
  CreditCard,
  ExternalLink,
  User as UserIcon,
  FileText,
  Link2,
} from "lucide-react";

/**
 * Props for ShipmentDetailSheet.
 */
interface ShipmentDetailSheetProps {
  /** The selected shipment to display, or null to close. */
  shipment: AdminShipment | null;
  /** Whether the sheet is open. */
  open: boolean;
  /** Callback to close the sheet. */
  onOpenChange: (open: boolean) => void;
  /** The correlated source estimate (if found). */
  linkedEstimate?: AdminLead | null;
}

/**
 * Returns the badge variant for a payment status string.
 */
function getPaymentVariant(
  status: string,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "PAID":
      return "default";
    case "PENDING":
      return "secondary";
    case "FAILED":
      return "destructive";
    default:
      return "outline";
  }
}

/**
 * Formats an AdminShipmentAddress into readable lines.
 */
function formatAddress(addr: AdminShipment["pickupAddress"]): string {
  const lines = addr.streetLines?.join(", ") ?? "";
  return `${lines}, ${addr.city}, ${addr.stateOrProvinceCode} ${addr.postalCode}, ${addr.countryCode}`;
}

/**
 * A slide-out sheet displaying full details for a single shipment.
 * Includes addresses, package info, pricing, carrier, user info,
 * and a "Source Estimate" section when correlation data is available.
 */
export default function ShipmentDetailSheet({
  shipment,
  open,
  onOpenChange,
  linkedEstimate,
}: ShipmentDetailSheetProps) {
  if (!shipment) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Shipment Details
          </SheetTitle>
          <SheetDescription>
            <span className="font-mono">{shipment.customTrackingNumber}</span>
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-4 pb-6">
          {/* Status Row */}
          <div className="flex items-center gap-3 flex-wrap">
            <Badge variant="outline">{shipment.shipmentStatus}</Badge>
            <Badge variant={getPaymentVariant(shipment.paymentStatus) as any}>
              {shipment.paymentStatus}
            </Badge>
            {shipment.manualOverride && (
              <Badge variant="secondary">Manual Override</Badge>
            )}
          </div>

          {/* Source Estimate Correlation */}
          <section className="space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <Link2 className="h-3.5 w-3.5" />
              Source Estimate
            </h4>
            {linkedEstimate ? (
              <div className="rounded-md border border-green-200 bg-green-50 p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    Estimate Found
                  </span>
                  <ConversionBadge converted={true} />
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-700">Route</span>
                    <span className="text-green-900">
                      {linkedEstimate.pickupLocation.city},{" "}
                      {linkedEstimate.pickupLocation.countryCode} →{" "}
                      {linkedEstimate.dropoffLocation.city},{" "}
                      {linkedEstimate.dropoffLocation.countryCode}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Estimated</span>
                    <span className="text-green-900">
                      {formatDate(linkedEstimate.createdAt)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Rates Offered</span>
                    <span className="text-green-900">
                      {linkedEstimate.rates?.length ?? 0} rate
                      {(linkedEstimate.rates?.length ?? 0) !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-green-700">Estimate ID</span>
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-xs text-green-900">
                        {linkedEstimate.id.slice(0, 8)}…
                      </span>
                      <CopyButton
                        text={linkedEstimate.id}
                        tooltipText="Copy estimate ID"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-md border border-dashed p-3">
                <p className="text-sm text-muted-foreground">
                  No matching estimate found for this shipment.
                </p>
              </div>
            )}
          </section>

          {/* Tracking Numbers */}
          <section className="space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Tracking
            </h4>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Custom #</span>
                <div className="flex items-center gap-1">
                  <span className="font-mono">
                    {shipment.customTrackingNumber}
                  </span>
                  <CopyButton
                    text={shipment.customTrackingNumber}
                    tooltipText="Copy"
                  />
                </div>
              </div>
              {shipment.carrierTrackingNumber && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Carrier #</span>
                  <div className="flex items-center gap-1">
                    <span className="font-mono">
                      {shipment.carrierTrackingNumber}
                    </span>
                    <CopyButton
                      text={shipment.carrierTrackingNumber}
                      tooltipText="Copy"
                    />
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Addresses */}
          <section className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              Addresses
            </h4>
            <div className="space-y-3">
              <div className="rounded-md border p-3 space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                  PICKUP
                </p>
                <p className="text-sm">
                  {formatAddress(shipment.pickupAddress)}
                </p>
                {shipment.pickupAddress.contact && (
                  <p className="text-xs text-muted-foreground">
                    {shipment.pickupAddress.contact.personName}
                    {shipment.pickupAddress.contact.phoneNumber &&
                      ` · ${shipment.pickupAddress.contact.phoneNumber}`}
                  </p>
                )}
              </div>
              <div className="rounded-md border p-3 space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                  DROPOFF
                </p>
                <p className="text-sm">
                  {formatAddress(shipment.dropoffAddress)}
                </p>
                {shipment.dropoffAddress.contact && (
                  <p className="text-xs text-muted-foreground">
                    {shipment.dropoffAddress.contact.personName}
                    {shipment.dropoffAddress.contact.phoneNumber &&
                      ` · ${shipment.dropoffAddress.contact.phoneNumber}`}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Package */}
          <section className="space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <Package className="h-3.5 w-3.5" />
              Package
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Weight</span>
                <span>
                  {shipment.weight?.value ?? "—"} {shipment.weight?.units ?? ""}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dimensions</span>
                <span>
                  {shipment.dimensions
                    ? `${shipment.dimensions.length}×${shipment.dimensions.width}×${shipment.dimensions.height} ${shipment.dimensions.units}`
                    : "—"}
                </span>
              </div>
            </div>
          </section>

          {/* Pricing & Service */}
          <section className="space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <CreditCard className="h-3.5 w-3.5" />
              Pricing & Service
            </h4>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Carrier</span>
                <span>{shipment.carrier?.name ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service</span>
                <span>{shipment.serviceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Carrier Price</span>
                <span>
                  {shipment.carrierPrice} {shipment.currency}
                </span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-muted-foreground">Actual Price</span>
                <span>
                  {shipment.actualPrice} {shipment.currency}
                </span>
              </div>
            </div>
          </section>

          {/* User */}
          <section className="space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <UserIcon className="h-3.5 w-3.5" />
              User
            </h4>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name</span>
                <span>{shipment.user.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Email</span>
                <div className="flex items-center gap-1">
                  <span>{shipment.user.email}</span>
                  <CopyButton text={shipment.user.email} tooltipText="Copy" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Code</span>
                <div className="flex items-center gap-1">
                  <span className="font-mono">{shipment.user.userCode}</span>
                  <CopyButton
                    text={shipment.user.userCode}
                    tooltipText="Copy"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Timestamps */}
          <section className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created</span>
              <span>{formatDateTime(shipment.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Updated</span>
              <span>{formatDateTime(shipment.updatedAt)}</span>
            </div>
          </section>

          {/* Label link */}
          {shipment.labelUrl && (
            <Button variant="outline" className="w-full" asChild>
              <a
                href={shipment.labelUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                View Shipping Label
              </a>
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
