"use client";

import { useState } from "react";
import {
  useArrangeHubHandoff,
  useHubHandoffOptions,
} from "@/hooks/admin/use-collections";
import type {
  HubHandoffOptions,
  HubHandoffPayload,
  ServicePoint,
} from "@/types/collection";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface HubHandoffDialogProps {
  shipmentId: string | null;
  trackingNumber?: string;
  onOpenChange: (open: boolean) => void;
}

const isError = (value: unknown): value is { error: string } =>
  typeof value === "object" && value !== null && "error" in value;

function Unavailable({ message }: { message: string }) {
  return (
    <p className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
      <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
      {message}
    </p>
  );
}

function addressLine(point: ServicePoint): string {
  const a = point.address;
  return [a.streetLines?.join(" "), a.postalCode, a.city]
    .filter(Boolean)
    .join(", ");
}

/**
 * Hands a parcel at the hub to the carrier: book its courier on one of the
 * dates it offers, or record the service point ops will drop it at.
 */
export function HubHandoffDialog({
  shipmentId,
  trackingNumber,
  onOpenChange,
}: HubHandoffDialogProps) {
  const { data: options, isLoading, error } = useHubHandoffOptions(shipmentId);
  const close = () => onOpenChange(false);

  return (
    <Dialog open={!!shipmentId} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Hand {trackingNumber ?? "the parcel"} to the carrier
          </DialogTitle>
          <DialogDescription>
            The parcel is at the hub. Book the carrier&apos;s courier to collect
            it, or drop it at a service point.
          </DialogDescription>
        </DialogHeader>

        {shipmentId && options ? (
          // Keyed per parcel and mounted once its options load, so the form
          // starts from the admin default and the carrier's suggestions.
          <HandoffForm
            key={shipmentId}
            shipmentId={shipmentId}
            options={options}
            onDone={close}
          />
        ) : (
          <>
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-brand-blue" />
              </div>
            ) : (
              <Unavailable
                message={
                  error
                    ? "Could not load the carrier's options. Try again."
                    : "No parcel selected."
                }
              />
            )}
            <DialogFooter>
              <Button variant="outline" onClick={close}>
                Cancel
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function HandoffForm({
  shipmentId,
  options,
  onDone,
}: {
  shipmentId: string;
  options: HubHandoffOptions;
  onDone: () => void;
}) {
  const { mutate: arrange, isPending } = useArrangeHubHandoff();
  const suggested = isError(options.courier) ? null : options.courier;

  const [mode, setMode] = useState<"COURIER" | "SERVICE_POINT">(
    options.defaultMode,
  );
  const [date, setDate] = useState(suggested?.availableDates[0] ?? "");
  const [readyTime, setReadyTime] = useState(
    suggested?.defaultReadyTime?.slice(0, 5) ?? "10:00",
  );
  const [closeTime, setCloseTime] = useState(
    suggested?.cutoffTime?.slice(0, 5) ?? "16:00",
  );
  const [remarks, setRemarks] = useState("");
  const [pointId, setPointId] = useState("");
  const [pointName, setPointName] = useState("");

  const courier = suggested;
  const points = isError(options.servicePoints) ? null : options.servicePoints;

  const payload: HubHandoffPayload | null =
    mode === "COURIER"
      ? date && readyTime < closeTime
        ? {
            mode,
            date,
            readyTime,
            closeTime,
            remarks: remarks.trim() || undefined,
          }
        : null
      : pointId.trim()
        ? {
            mode,
            servicePointId: pointId.trim(),
            servicePointName: pointName || undefined,
          }
        : null;

  return (
    <>
      <Tabs
        value={mode}
        onValueChange={(value) => setMode(value as typeof mode)}
      >
        <TabsList className="w-full">
          <TabsTrigger value="COURIER" className="flex-1">
            Book a courier
          </TabsTrigger>
          <TabsTrigger value="SERVICE_POINT" className="flex-1">
            Service point
          </TabsTrigger>
        </TabsList>

        <TabsContent value="COURIER" className="space-y-4 pt-2">
          {isError(options.courier) ? (
            <Unavailable message={options.courier.error} />
          ) : (
            <>
              <div className="space-y-1.5">
                <Label>Collection date</Label>
                <Select value={date} onValueChange={setDate}>
                  <SelectTrigger>
                    <SelectValue placeholder="No dates offered" />
                  </SelectTrigger>
                  <SelectContent>
                    {courier?.availableDates.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="ready-time">Ready from</Label>
                  <Input
                    id="ready-time"
                    type="time"
                    value={readyTime}
                    onChange={(e) => setReadyTime(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="close-time">Hub closes</Label>
                  <Input
                    id="close-time"
                    type="time"
                    value={closeTime}
                    onChange={(e) => setCloseTime(e.target.value)}
                  />
                </div>
              </div>
              {courier?.cutoffTime && (
                <p className="text-xs text-muted-foreground">
                  The carrier collects here until{" "}
                  {courier.cutoffTime.slice(0, 5)}.
                </p>
              )}
              {readyTime >= closeTime && (
                <p className="text-xs text-destructive">
                  The ready time must be before the closing time.
                </p>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="handoff-remarks">
                  Note for the courier{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </Label>
                <Input
                  id="handoff-remarks"
                  maxLength={50}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="SERVICE_POINT" className="space-y-4 pt-2">
          {isError(options.servicePoints) ? (
            <Unavailable message={options.servicePoints.error} />
          ) : points && points.length > 0 ? (
            <div className="max-h-60 overflow-y-auto space-y-2">
              {points.map((point, index) => {
                const selected = !!point.id && point.id === pointId;
                return (
                  <button
                    type="button"
                    key={point.id ?? index}
                    disabled={!point.id}
                    onClick={() => {
                      if (!point.id) return;
                      setPointId(point.id);
                      setPointName(point.centerName);
                    }}
                    className={cn(
                      "w-full rounded-md border p-3 text-left text-sm transition",
                      selected
                        ? "border-brand-blue bg-brand-blue/5"
                        : "hover:bg-muted/40",
                      !point.id && "cursor-default",
                    )}
                  >
                    <span className="font-medium">{point.centerName}</span>
                    {point.distanceKm != null && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        {point.distanceKm.toFixed(1)} km
                      </span>
                    )}
                    <span className="block text-xs text-muted-foreground">
                      {addressLine(point)}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No service points near the hub.
            </p>
          )}
          {points?.some((point) => !point.id) && (
            <p className="text-xs text-muted-foreground">
              This server does not send point codes yet. Type the code shown in
              the carrier&apos;s point finder.
            </p>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="point-id">Service point code</Label>
            <Input
              id="point-id"
              value={pointId}
              onChange={(e) => setPointId(e.target.value)}
              placeholder="e.g. the point's SAP number"
            />
          </div>
        </TabsContent>
      </Tabs>
      <DialogFooter>
        <Button variant="outline" onClick={onDone} disabled={isPending}>
          Cancel
        </Button>
        <Button
          disabled={!payload || isPending}
          onClick={() => {
            if (!payload) return;
            arrange({ id: shipmentId, payload }, { onSuccess: onDone });
          }}
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === "COURIER" ? "Book courier" : "Record drop-off"}
        </Button>
      </DialogFooter>
    </>
  );
}
