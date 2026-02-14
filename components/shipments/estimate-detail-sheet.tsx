"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import CopyButton from "@/components/ui/copy-button";
import ConversionBadge from "@/components/ui/conversion-badge";
import { formatDate, formatDateTime } from "@/utils/format-date";
import type { AdminLead, AdminShipment } from "@/types/admin-user-resources";
import {
  FileText,
  MapPin,
  Package,
  CreditCard,
  User as UserIcon,
  Truck,
  Link2,
} from "lucide-react";

/**
 * Props for EstimateDetailSheet.
 */
interface EstimateDetailSheetProps {
  /** The selected estimate to display, or null to close. */
  estimate: AdminLead | null;
  /** Whether the sheet is open. */
  open: boolean;
  /** Callback to close the sheet. */
  onOpenChange: (open: boolean) => void;
  /** The correlated shipment created from this estimate (if found). */
  linkedShipment?: AdminShipment | null;
}

/**
 * Formats an AdminLeadLocation into readable lines.
 */
function formatLocation(loc: AdminLead["pickupLocation"]): string {
  const lines = loc.streetLines?.join(", ") ?? "";
  return `${lines}, ${loc.city}, ${loc.stateOrProvinceCode} ${loc.postalCode}, ${loc.countryCode}`;
}

/**
 * A slide-out sheet displaying full details for a single shipping estimate.
 * Includes locations, package info, all available rates, conversion status,
 * contact info, user info, and a "Created Shipment" section when
 * correlation data is available.
 */
export default function EstimateDetailSheet({
  estimate,
  open,
  onOpenChange,
  linkedShipment,
}: EstimateDetailSheetProps) {
  if (!estimate) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Estimate Details
          </SheetTitle>
          <SheetDescription>
            <span className="font-mono text-xs">{estimate.id}</span>
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-4 pb-6">
          {/* Conversion Status */}
          <div className="flex items-center gap-3">
            <ConversionBadge converted={estimate.converted ?? false} />
            {estimate.guestId && <Badge variant="secondary">Guest</Badge>}
          </div>

          {/* Created Shipment Correlation */}
          <section className="space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <Link2 className="h-3.5 w-3.5" />
              Created Shipment
            </h4>
            {linkedShipment ? (
              <div className="rounded-md border border-green-200 bg-green-50 p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    Shipment Created
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {linkedShipment.shipmentStatus}
                  </Badge>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-green-700">Tracking #</span>
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-green-900">
                        {linkedShipment.customTrackingNumber}
                      </span>
                      <CopyButton
                        text={linkedShipment.customTrackingNumber}
                        tooltipText="Copy tracking #"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Carrier</span>
                    <span className="text-green-900">
                      {linkedShipment.carrier?.name ?? "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Service</span>
                    <span className="text-green-900">
                      {linkedShipment.serviceName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Price</span>
                    <span className="font-medium text-green-900">
                      {linkedShipment.actualPrice} {linkedShipment.currency}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Payment</span>
                    <Badge
                      variant={
                        linkedShipment.paymentStatus === "PAID"
                          ? "default"
                          : "secondary"
                      }
                      className="text-xs"
                    >
                      {linkedShipment.paymentStatus}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Shipped</span>
                    <span className="text-green-900">
                      {formatDate(linkedShipment.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            ) : estimate.converted ? (
              <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3">
                <p className="text-sm text-yellow-800">
                  Marked as converted, but matching shipment not found in loaded
                  data.
                </p>
              </div>
            ) : (
              <div className="rounded-md border border-dashed p-3">
                <p className="text-sm text-muted-foreground">
                  This estimate has not been converted into a shipment.
                </p>
              </div>
            )}
          </section>

          {/* Locations */}
          <section className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              Locations
            </h4>
            <div className="space-y-3">
              <div className="rounded-md border p-3 space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                  PICKUP
                </p>
                <p className="text-sm">
                  {formatLocation(estimate.pickupLocation)}
                </p>
              </div>
              <div className="rounded-md border p-3 space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                  DROPOFF
                </p>
                <p className="text-sm">
                  {formatLocation(estimate.dropoffLocation)}
                </p>
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
                  {estimate.weight?.value ?? "—"} {estimate.weight?.units ?? ""}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dimensions</span>
                <span>
                  {estimate.dimensions
                    ? `${estimate.dimensions.length}×${estimate.dimensions.width}×${estimate.dimensions.height} ${estimate.dimensions.units}`
                    : "—"}
                </span>
              </div>
            </div>
          </section>

          {/* Rates */}
          <section className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <CreditCard className="h-3.5 w-3.5" />
              Rates ({estimate.rates?.length ?? 0})
            </h4>
            {estimate.rates?.length ? (
              <div className="space-y-2">
                {estimate.rates.map((rate, i) => {
                  /** Highlight the rate that was actually selected for the shipment. */
                  const isSelectedRate =
                    linkedShipment?.serviceType === rate.serviceType;

                  return (
                    <div
                      key={`${rate.serviceType}-${i}`}
                      className={`rounded-md border p-3 space-y-1.5 ${
                        isSelectedRate ? "border-green-300 bg-green-50" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {rate.serviceName}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {isSelectedRate && (
                            <Badge
                              variant="default"
                              className="text-xs bg-green-600"
                            >
                              Selected
                            </Badge>
                          )}
                          <Badge variant="outline">{rate.carrier}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {rate.deliveryDescription ?? "—"}
                        </span>
                        <span className="font-medium">
                          {rate.actualPrice} {rate.currency}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Carrier price</span>
                        <span>
                          {rate.carrierPrice} {rate.currency}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No rates available.
              </p>
            )}
          </section>

          {/* Contact Info (if provided) */}
          {(estimate.email || estimate.phone) && (
            <section className="space-y-2">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Contact Info
              </h4>
              <div className="space-y-1.5 text-sm">
                {estimate.email && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Email</span>
                    <div className="flex items-center gap-1">
                      <span>{estimate.email}</span>
                      <CopyButton text={estimate.email} tooltipText="Copy" />
                    </div>
                  </div>
                )}
                {estimate.phone && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Phone</span>
                    <div className="flex items-center gap-1">
                      <span>{estimate.phone}</span>
                      <CopyButton text={estimate.phone} tooltipText="Copy" />
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* User (if linked) */}
          {estimate.user && (
            <section className="space-y-2">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                <UserIcon className="h-3.5 w-3.5" />
                User
              </h4>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name</span>
                  <span>{estimate.user.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <div className="flex items-center gap-1">
                    <span>{estimate.user.email}</span>
                    <CopyButton text={estimate.user.email} tooltipText="Copy" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Code</span>
                  <div className="flex items-center gap-1">
                    <span className="font-mono">{estimate.user.userCode}</span>
                    <CopyButton
                      text={estimate.user.userCode}
                      tooltipText="Copy"
                    />
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Guest ID */}
          {estimate.guestId && (
            <section className="space-y-1.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Guest ID</span>
                <div className="flex items-center gap-1">
                  <span className="font-mono text-xs">{estimate.guestId}</span>
                  <CopyButton text={estimate.guestId} tooltipText="Copy" />
                </div>
              </div>
            </section>
          )}

          {/* Timestamps */}
          <section className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created</span>
              <span>{formatDateTime(estimate.createdAt)}</span>
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
