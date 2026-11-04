"use client";

import { useState } from "react";
import Link from "next/link";
import { ClipboardList, Loader2, RefreshCw } from "lucide-react";
import {
  useFulfilmentQueue,
  useFulfilmentSettings,
  useUpdateFulfilmentSettings,
} from "@/hooks/admin/use-fulfilment";
import { PrepareLabelSheet } from "@/components/fulfilment/prepare-label-sheet";
import { handoverText, waitingText } from "@/components/fulfilment/format";
import { Can } from "@/components/auth/can";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/utils/format-currency";
import type { FulfilmentQueueShipment } from "@/types/fulfilment";

function BusinessHoursForm({
  saved,
  isSaving,
  onSave,
}: {
  saved: string;
  isSaving: boolean;
  onSave: (value: string) => void;
}) {
  const [hours, setHours] = useState(saved);
  return (
    <div className="flex items-end gap-3 flex-wrap">
      <div className="space-y-1.5 grow max-w-md">
        <Label htmlFor="business-hours">
          Business hours (shown to customers)
        </Label>
        <Input
          id="business-hours"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          placeholder="Monday to Friday, 8:00 to 17:00"
          maxLength={120}
        />
      </div>
      <Can do="staff:write" fallback="disable">
        <Button
          variant="outline"
          disabled={isSaving || hours.trim() === saved}
          onClick={() => onSave(hours.trim())}
        >
          Save hours
        </Button>
      </Can>
    </div>
  );
}

/** The global switch and the business hours customers are told. */
function ManualModeCard() {
  const { data: settings, isLoading } = useFulfilmentSettings();
  const { mutate: save, isPending } = useUpdateFulfilmentSettings();

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm space-y-4">
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div className="space-y-1 max-w-2xl">
          <Label htmlFor="manual-all" className="text-base font-semibold">
            Manual for all carriers
          </Label>
          <p className="text-sm text-muted-foreground">
            On: every paid shipment (FedEx, DHL, DPD and Momentum) comes here
            instead of the carrier creating the label automatically. Off: each
            carrier follows its own switch under{" "}
            <Link href="/dashboard/carriers" className="underline">
              Carriers
            </Link>{" "}
            (open a carrier, Fulfilment). Momentum is always manual. Shipments
            already paid stay where they are when you change this.
          </p>
        </div>
        <Can do="staff:write" fallback="disable">
          <Switch
            id="manual-all"
            checked={settings?.manualForAllCarriers ?? false}
            disabled={isLoading || isPending}
            onCheckedChange={(checked) =>
              save({ manualForAllCarriers: checked })
            }
          />
        </Can>
      </div>

      {/* Keyed so the field resets to the saved value once it loads. */}
      <BusinessHoursForm
        key={settings?.businessHours ?? ""}
        saved={settings?.businessHours ?? ""}
        isSaving={isPending}
        onSave={(value) => save({ businessHours: value || null })}
      />
    </div>
  );
}

/**
 * Labels to prepare: paid shipments in manual mode. Staff book each one on the
 * carrier's own website, then upload the label PDF and tracking number here.
 */
export default function FulfilmentPage() {
  const { data, isLoading, isFetching, refetch } = useFulfilmentQueue();
  const shipments = data?.shipments ?? [];
  // A link from the shipment sheet (?shipment=<id>) opens that shipment.
  const [selectedId, setSelectedId] = useState<string | null>(() =>
    typeof window === "undefined"
      ? null
      : new URLSearchParams(window.location.search).get("shipment"),
  );
  const selected: FulfilmentQueueShipment | null =
    shipments.find((s) => s.id === selectedId) ?? null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Labels to prepare
          </h2>
          <p className="text-muted-foreground">
            Paid shipments waiting for a label. Book each on the carrier&apos;s
            website, then upload the label and tracking number.
          </p>
        </div>
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

      <ManualModeCard />

      <div className="rounded-xl border bg-card shadow-sm overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Waiting</TableHead>
              <TableHead>Tracking #</TableHead>
              <TableHead>Carrier</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Handover</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                </TableCell>
              </TableRow>
            ) : shipments.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-24 text-center text-muted-foreground"
                >
                  Nothing to prepare. New manual shipments appear here, and
                  staff are emailed.
                </TableCell>
              </TableRow>
            ) : (
              shipments.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <Badge
                      variant={
                        s.hoursWaiting >= 4 ? "destructive" : "secondary"
                      }
                    >
                      {waitingText(s.hoursWaiting)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {s.customTrackingNumber}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{s.carrier.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {s.serviceName}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>{s.user.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {s.user.email}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {s.pickupAddress.countryCode} →{" "}
                    {s.dropoffAddress.countryCode}
                  </TableCell>
                  <TableCell className="text-xs max-w-48">
                    {handoverText(s.handoverPreference)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatCurrency(s.currency, s.actualPrice)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" onClick={() => setSelectedId(s.id)}>
                      <ClipboardList className="mr-2 h-4 w-4" />
                      Prepare label
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <PrepareLabelSheet
        shipment={selected}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
      />
    </div>
  );
}
