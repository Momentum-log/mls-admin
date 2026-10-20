"use client";

import { useState } from "react";
import {
  useCollections,
  useMarkCollected,
  useMarkHandedOver,
  useSetCustomerCollectionFeeWaiver,
  useWaiveCollectionFee,
} from "@/hooks/admin/use-collections";
import type { CollectionShipment } from "@/types/collection";
import { getShipmentStatusMeta } from "@/lib/shipment-status";
import { formatCurrency } from "@/utils/format-currency";
import { formatRelativeTime } from "@/utils/format-date";
import { Can } from "@/components/auth/can";
import { HubHandoffDialog } from "@/components/collections/hub-handoff-dialog";
import { ReasonDialog } from "@/components/admin/reason-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import CopyButton from "@/components/ui/copy-button";
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
import { Loader2, PackageCheck, PackageOpen, RefreshCw, Send, Truck } from "lucide-react";

const QUEUE_FILTERS = [
  { value: "OPEN", label: "Still with MLS" },
  { value: "AWAITING_FULFILLMENT", label: "Customer requested collection" },
  { value: "AWAITING_MLS_COLLECTION", label: "To collect" },
  { value: "AT_HUB", label: "At the hub" },
  { value: "PICKUP_SCHEDULED", label: "Courier booked" },
  { value: "AWAITING_DROPOFF", label: "To drop at service point" },
];

function addressOf(shipment: CollectionShipment): string {
  const a = shipment.customerCollectionAddress;
  if (!a) return "—";
  return [a.streetLines?.join(" "), a.postalCode, a.city].filter(Boolean).join(", ");
}

/**
 * The MLS collection queue for DHL export parcels.
 *
 * DHL eCommerce exports only leave from the hub, so MLS collects the parcel
 * from the customer, brings it to the hub and hands it to DHL there. Each
 * step is confirmed here because only a person on site knows where the
 * parcel physically is.
 */
export default function CollectionsPage() {
  const [filter, setFilter] = useState("OPEN");
  const { data, isLoading, isFetching, refetch } = useCollections(
    filter === "OPEN" ? undefined : filter,
  );
  const shipments = data ?? [];

  const [collectTarget, setCollectTarget] = useState<CollectionShipment | null>(null);
  const [handoffTarget, setHandoffTarget] = useState<CollectionShipment | null>(null);
  const [handedOverTarget, setHandedOverTarget] = useState<CollectionShipment | null>(null);
  const [waiveTarget, setWaiveTarget] = useState<CollectionShipment | null>(null);
  const [customerWaiverTarget, setCustomerWaiverTarget] = useState<CollectionShipment | null>(
    null,
  );

  const { mutate: markCollected, isPending: isCollecting } = useMarkCollected();
  const { mutate: markHandedOver, isPending: isHandingOver } = useMarkHandedOver();
  const { mutate: waiveFee, isPending: isWaiving } = useWaiveCollectionFee();
  const { mutate: setCustomerWaiver, isPending: isSettingWaiver } =
    useSetCustomerCollectionFeeWaiver();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Collections</h2>
          <p className="text-muted-foreground">
            DHL export parcels MLS collects and hands to DHL at the hub.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-60">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {QUEUE_FILTERS.map((f) => (
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
              <TableHead>Tracking #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Collect from</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Collection fee</TableHead>
              <TableHead className="text-right w-[200px]">Next step</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-brand-blue" />
                </TableCell>
              </TableRow>
            ) : shipments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <PackageOpen className="h-10 w-10 opacity-20" />
                    <p className="font-medium">Nothing to collect.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              shipments.map((shipment) => {
                const meta = getShipmentStatusMeta(shipment.shipmentStatus);
                const fee = shipment.collectionFee;
                const status = shipment.shipmentStatus;
                return (
                  <TableRow key={shipment.id} className="group">
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-sm font-bold">
                          {shipment.customTrackingNumber}
                        </span>
                        <CopyButton
                          text={shipment.customTrackingNumber}
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        updated {formatRelativeTime(shipment.updatedAt)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-sm">{shipment.user?.name ?? "—"}</span>
                      <span className="block text-xs text-muted-foreground">
                        {shipment.user?.phone ?? shipment.user?.email}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-[220px] text-sm whitespace-normal">
                      {addressOf(shipment)}
                    </TableCell>
                    <TableCell className="whitespace-normal">
                      <Badge variant={meta.variant} className="text-xs">
                        {meta.label}
                      </Badge>
                      {status === "PICKUP_SCHEDULED" && shipment.pickupConfirmationCode && (
                        <span className="block text-xs text-muted-foreground mt-1">
                          Pickup {shipment.pickupConfirmationCode}
                        </span>
                      )}
                      {status === "AWAITING_DROPOFF" && shipment.dropoffCenterId && (
                        <span className="block text-xs text-muted-foreground mt-1">
                          {shipment.dropoffCenterId}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm whitespace-normal">
                      {fee ? (
                        <>
                          <span className="font-medium">
                            {formatCurrency(fee.currency, fee.amount)}
                          </span>
                          <Badge
                            variant={fee.status === "PENDING_PAYMENT" ? "secondary" : "outline"}
                            className="ml-2 text-[10px]"
                          >
                            {fee.status === "PENDING_PAYMENT" ? "UNPAID" : fee.status}
                          </Badge>
                        </>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                      <div className="flex flex-wrap gap-x-3 mt-1">
                        {fee?.status === "PENDING_PAYMENT" && (
                          <Can do="shipment:write" fallback="hide">
                            <button
                              className="text-xs text-brand-blue hover:underline"
                              onClick={() => setWaiveTarget(shipment)}
                            >
                              Waive
                            </button>
                          </Can>
                        )}
                        {shipment.user && (
                          <Can do="shipment:write" fallback="hide">
                            <button
                              className="text-xs text-brand-blue hover:underline"
                              onClick={() => setCustomerWaiverTarget(shipment)}
                            >
                              {shipment.user.collectionFeeWaived
                                ? "Charge this customer again"
                                : "Never charge this customer"}
                            </button>
                          </Can>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {status === "AWAITING_MLS_COLLECTION" && (
                        <Can do="shipment:write" fallback="disable">
                          <Button size="sm" onClick={() => setCollectTarget(shipment)}>
                            <PackageCheck className="mr-1 h-4 w-4" />
                            At the hub
                          </Button>
                        </Can>
                      )}
                      {status === "AT_HUB" && (
                        <Can do="shipment:write" fallback="disable">
                          <Button size="sm" onClick={() => setHandoffTarget(shipment)}>
                            <Truck className="mr-1 h-4 w-4" />
                            Hand to carrier
                          </Button>
                        </Can>
                      )}
                      {(status === "PICKUP_SCHEDULED" || status === "AWAITING_DROPOFF") && (
                        <Can do="shipment:write" fallback="disable">
                          <Button size="sm" onClick={() => setHandedOverTarget(shipment)}>
                            <Send className="mr-1 h-4 w-4" />
                            Handed over
                          </Button>
                        </Can>
                      )}
                      {status === "AWAITING_FULFILLMENT" && (
                        <span className="text-xs text-muted-foreground">
                          {fee?.status === "PENDING_PAYMENT"
                            ? "Waiting for the customer to pay the fee"
                            : "Waiting for collection to be confirmed"}
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

      <ConfirmDialog
        open={!!collectTarget}
        onOpenChange={(open) => !open && setCollectTarget(null)}
        title="Is the parcel at the hub?"
        description={`Confirm only once ${collectTarget?.customTrackingNumber ?? "the parcel"} is physically at the hub. Next you arrange the handoff to the carrier.`}
        confirmLabel="It's at the hub"
        isLoading={isCollecting}
        onConfirm={() => {
          if (!collectTarget) return;
          markCollected(collectTarget.id, { onSettled: () => setCollectTarget(null) });
        }}
      />

      <ConfirmDialog
        open={!!handedOverTarget}
        onOpenChange={(open) => !open && setHandedOverTarget(null)}
        title="Has the carrier got the parcel?"
        description={`Confirm once ${handedOverTarget?.customTrackingNumber ?? "the parcel"} has been collected by the courier or dropped at the service point. The customer is told it is on its way.`}
        confirmLabel="Handed over"
        isLoading={isHandingOver}
        onConfirm={() => {
          if (!handedOverTarget) return;
          markHandedOver(handedOverTarget.id, { onSettled: () => setHandedOverTarget(null) });
        }}
      />

      <ReasonDialog
        open={!!waiveTarget}
        onOpenChange={(open) => !open && setWaiveTarget(null)}
        title="Waive the collection fee?"
        description={`The customer will not be charged for collecting ${waiveTarget?.customTrackingNumber ?? "this parcel"}. MLS absorbs the cost.`}
        label="Reason"
        maxLength={200}
        confirmLabel="Waive fee"
        isLoading={isWaiving}
        onConfirm={(reason) => {
          if (!waiveTarget) return;
          waiveFee(
            { id: waiveTarget.id, reason: reason || undefined },
            { onSuccess: () => setWaiveTarget(null) },
          );
        }}
      />

      <ConfirmDialog
        open={!!customerWaiverTarget}
        onOpenChange={(open) => !open && setCustomerWaiverTarget(null)}
        title={
          customerWaiverTarget?.user?.collectionFeeWaived
            ? "Charge this customer collection fees again?"
            : "Never charge this customer collection fees?"
        }
        description={
          customerWaiverTarget?.user?.collectionFeeWaived
            ? `${customerWaiverTarget?.user?.name ?? "The customer"} pays the collection fee on future DHL exports.`
            : `${customerWaiverTarget?.user?.name ?? "The customer"} is not charged the collection fee on future DHL exports. Fees already paid are not refunded, and an unpaid fee on a current shipment stays until you waive it on its row.`
        }
        confirmLabel="Confirm"
        isLoading={isSettingWaiver}
        onConfirm={() => {
          const user = customerWaiverTarget?.user;
          if (!user) return;
          setCustomerWaiver(
            { userId: user.id, waived: !user.collectionFeeWaived },
            { onSettled: () => setCustomerWaiverTarget(null) },
          );
        }}
      />

      <HubHandoffDialog
        shipmentId={handoffTarget?.id ?? null}
        trackingNumber={handoffTarget?.customTrackingNumber}
        onOpenChange={(open) => !open && setHandoffTarget(null)}
      />
    </div>
  );
}
