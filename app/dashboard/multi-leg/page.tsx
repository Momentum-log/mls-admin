"use client";

import { useState } from "react";
import {
  useMultiLegShipments,
  useConfirmHubArrival,
  useCreateLegTwo,
} from "@/hooks/admin/use-multi-leg";
import { parseRepriceError } from "@/lib/api/admin/multi-leg";
import type { MultiLegShipment, RepriceDetails } from "@/types/multi-leg";
import RepriceDialog from "@/components/multi-leg/reprice-dialog";
import MultiLegDetailSheet from "@/components/multi-leg/multi-leg-detail-sheet";
import { getApiErrorMessage } from "@/lib/api-error";
import { getShipmentStatusMeta } from "@/lib/shipment-status";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Loader2,
  PackageCheck,
  Truck,
  Warehouse,
  RefreshCw,
} from "lucide-react";
import { toast } from "react-hot-toast";

/** The two states the queue exists to clear. */
const QUEUE_FILTERS = [
  { value: "DEFAULT", label: "Waiting on ops" },
  { value: "AWAITING_HUB_CONFIRMATION", label: "Awaiting hub confirmation" },
  { value: "LEG2_PENDING", label: "Leg 2 pending" },
  { value: "LEG2_CREATED", label: "Leg 2 created" },
];

/**
 * Multi-leg operations queue.
 *
 * Hub-routed shipments stop here twice: once when leg 1 reaches the sorting
 * centre and a human must confirm the parcel physically arrived, and again
 * when leg 2 needs creating. Without this screen those shipments sit in
 * `AWAITING_HUB_CONFIRMATION` indefinitely — nothing else can move them.
 */
export default function MultiLegPage() {
  const [filter, setFilter] = useState("DEFAULT");
  const { data, isLoading, refetch, isFetching } = useMultiLegShipments(
    filter === "DEFAULT" ? undefined : filter,
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<MultiLegShipment | null>(
    null,
  );
  const [repriceDetails, setRepriceDetails] = useState<RepriceDetails | null>(
    null,
  );
  const [repriceTarget, setRepriceTarget] = useState<string | null>(null);

  const { mutate: confirmArrival, isPending: isConfirming } =
    useConfirmHubArrival();
  const { mutate: createLeg2, isPending: isCreatingLeg2 } = useCreateLegTwo();

  const shipments = data?.shipments ?? [];

  /**
   * Attempts leg 2. A 409 carrying both prices is routed into the re-pricing
   * dialog instead of being reported as a failure; anything else is a genuine
   * error and gets a toast.
   */
  const attemptLegTwo = (id: string, acceptRepricing = false) => {
    createLeg2(
      { id, acceptRepricing },
      {
        onSuccess: () => {
          setRepriceDetails(null);
          setRepriceTarget(null);
        },
        onError: (error) => {
          const reprice = parseRepriceError(error);
          if (reprice) {
            setRepriceTarget(id);
            setRepriceDetails(reprice);
            return;
          }
          toast.error(getApiErrorMessage(error, "Could not create leg 2"));
        },
      },
    );
  };

  /** Currency for the reprice dialog, taken from the leg that was quoted. */
  const repriceCurrency =
    shipments
      .find((s) => s.id === repriceTarget)
      ?.legs.find((l) => l.sequence === 2)?.currency ?? "PLN";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Multi-Leg Ops</h2>
          <p className="text-muted-foreground">
            Hub-routed shipments waiting on a person at the sorting centre.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-56">
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
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw
              className={
                isFetching ? "mr-2 h-4 w-4 animate-spin" : "mr-2 h-4 w-4"
              }
            />
            Refresh
          </Button>
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[190px]">Tracking #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Legs</TableHead>
              <TableHead className="text-right w-[220px]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-brand-blue" />
                </TableCell>
              </TableRow>
            ) : shipments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Warehouse className="h-10 w-10 opacity-20" />
                    <p className="font-medium">Nothing waiting.</p>
                    <p className="text-sm">
                      Hub-routed shipments appear here when they reach the
                      sorting centre.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              shipments.map((shipment) => {
                const meta = getShipmentStatusMeta(shipment.shipmentStatus);
                const leg1 = shipment.legs.find((l) => l.sequence === 1);
                const leg2 = shipment.legs.find((l) => l.sequence === 2);

                return (
                  <TableRow
                    key={shipment.id}
                    className="cursor-pointer hover:bg-muted/30 group"
                    onClick={() => setSelectedId(shipment.id)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-sm font-bold">
                          {shipment.customTrackingNumber}
                        </span>
                        <CopyButton
                          text={shipment.customTrackingNumber}
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-sm">
                        {shipment.customer?.name}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {shipment.customer?.email}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={meta.variant} className="text-xs">
                        {meta.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-muted-foreground">1.</span>
                          <span>{leg1?.carrierCode ?? "—"}</span>
                          {leg1?.trackingNumber && (
                            <span className="font-mono text-[10px] text-muted-foreground">
                              {leg1.trackingNumber}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-muted-foreground">2.</span>
                          <span>{leg2?.carrierCode ?? "—"}</span>
                          {leg2?.trackingNumber ? (
                            <span className="font-mono text-[10px] text-muted-foreground">
                              {leg2.trackingNumber}
                            </span>
                          ) : (
                            <span className="text-[10px] text-muted-foreground italic">
                              not created
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell
                      className="text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Both flags come from the server so the state rules
                          cannot drift between here and the API. */}
                      {shipment.canConfirmArrival && (
                        <Button
                          size="sm"
                          onClick={() => setConfirmTarget(shipment)}
                          disabled={isConfirming}
                        >
                          <PackageCheck className="mr-2 h-4 w-4" />
                          Confirm Arrival
                        </Button>
                      )}
                      {shipment.canCreateLegTwo && (
                        <Button
                          size="sm"
                          onClick={() => attemptLegTwo(shipment.id)}
                          disabled={isCreatingLeg2}
                        >
                          <Truck className="mr-2 h-4 w-4" />
                          Create Leg 2
                        </Button>
                      )}
                      {!shipment.canConfirmArrival &&
                        !shipment.canCreateLegTwo && (
                          <span className="text-xs text-muted-foreground">
                            No action due
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

      {data && (
        <p className="text-sm text-muted-foreground px-2">
          {data.count} shipment{data.count !== 1 ? "s" : ""} in queue
        </p>
      )}

      <ConfirmDialog
        open={!!confirmTarget}
        onOpenChange={(open) => !open && setConfirmTarget(null)}
        title="Confirm the parcel is at the centre?"
        description={`Only confirm once ${confirmTarget?.customTrackingNumber} has physically been seen at the sorting centre. Confirming lets leg 2 be created, which dispatches a courier — doing that early sends one to collect a parcel that has not arrived.`}
        confirmLabel="Confirm Arrival"
        isLoading={isConfirming}
        onConfirm={() => {
          if (!confirmTarget) return;
          confirmArrival(confirmTarget.id, {
            onSettled: () => setConfirmTarget(null),
          });
        }}
      />

      <RepriceDialog
        open={!!repriceDetails}
        onOpenChange={(open) => {
          if (!open) {
            setRepriceDetails(null);
            setRepriceTarget(null);
          }
        }}
        details={repriceDetails}
        currency={repriceCurrency}
        isLoading={isCreatingLeg2}
        onAccept={() => {
          if (repriceTarget) attemptLegTwo(repriceTarget, true);
        }}
      />

      <MultiLegDetailSheet
        shipmentId={selectedId}
        open={!!selectedId}
        onOpenChange={(open) => !open && setSelectedId(null)}
      />
    </div>
  );
}
