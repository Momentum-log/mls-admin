"use client";

import { useState } from "react";
import { FileUp, Loader2, Upload } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import CopyButton from "@/components/ui/copy-button";
import { Can } from "@/components/auth/can";
import { useUploadManualLabel } from "@/hooks/admin/use-fulfilment";
import { formatCurrency } from "@/utils/format-currency";
import { formatDateTime } from "@/utils/format-date";
import type { FulfilmentQueueShipment } from "@/types/fulfilment";
import {
  addressLines,
  handoverText,
  packageLine,
  readFileAsBase64,
} from "./format";

const MAX_BYTES = 5 * 1024 * 1024;

interface Props {
  shipment: FulfilmentQueueShipment | null;
  onOpenChange: (open: boolean) => void;
}

function Field({
  label,
  value,
  copy = true,
}: {
  label: string;
  value: string;
  copy?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="text-sm whitespace-pre-line break-words">
          {value || "—"}
        </p>
      </div>
      {copy && value && <CopyButton text={value} />}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border p-4 space-y-1">
      <h3 className="text-sm font-bold">{title}</h3>
      {children}
    </section>
  );
}

/**
 * Everything staff need to book one shipment on the carrier's own website,
 * each value with a copy button, and the form to upload the label afterwards.
 */
export function PrepareLabelSheet({ shipment, onOpenChange }: Props) {
  return (
    <Sheet open={!!shipment} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
        {/* Keyed so each shipment starts from the customer's own choice. */}
        {shipment && (
          <PrepareLabelBody
            key={shipment.id}
            shipment={shipment}
            onDone={() => onOpenChange(false)}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}

function PrepareLabelBody({
  shipment,
  onDone,
}: {
  shipment: FulfilmentQueueShipment;
  onDone: () => void;
}) {
  const pref = shipment.handoverPreference;
  const { mutate: upload, isPending } = useUploadManualLabel();
  const [file, setFile] = useState<File | null>(null);
  const [tracking, setTracking] = useState("");
  const [handover, setHandover] = useState<"PICKUP" | "DROPOFF">(
    pref?.method ?? "DROPOFF",
  );
  const [pickupDate, setPickupDate] = useState(pref?.pickupDate ?? "");
  const [readyTime, setReadyTime] = useState(pref?.readyTime ?? "");
  const [closeTime, setCloseTime] = useState(pref?.closeTime ?? "");
  const [confirmation, setConfirmation] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const from = shipment.customerCollectionAddress ?? shipment.pickupAddress;
  const packages = shipment.packages ?? [];
  const contactFrom = shipment.pickupAddress.contact;
  const contactTo = shipment.dropoffAddress.contact;

  const submit = async () => {
    setError(null);
    if (!file)
      return setError("Choose the label PDF you downloaded from the carrier.");
    if (file.type && file.type !== "application/pdf")
      return setError("The label must be a PDF.");
    if (file.size > MAX_BYTES)
      return setError("The label must be 5 MB or smaller.");
    if (!/^[A-Za-z0-9-]{3,64}$/.test(tracking.trim())) {
      return setError(
        "Enter the carrier's tracking number (letters, digits and dashes).",
      );
    }
    if (handover === "PICKUP" && !pickupDate) {
      return setError("Enter the day the courier will collect.");
    }
    const labelPdfBase64 = await readFileAsBase64(file);
    upload(
      {
        shipmentId: shipment.id,
        payload: {
          labelPdfBase64,
          carrierTrackingNumber: tracking.trim(),
          handover,
          ...(handover === "PICKUP"
            ? {
                pickupDate,
                ...(readyTime ? { pickupReadyTime: readyTime } : {}),
                ...(closeTime ? { pickupCloseTime: closeTime } : {}),
                ...(confirmation.trim()
                  ? { pickupConfirmationCode: confirmation.trim() }
                  : {}),
              }
            : {}),
          ...(serviceName.trim() ? { serviceName: serviceName.trim() } : {}),
          ...(notes.trim() ? { notes: notes.trim() } : {}),
        },
      },
      { onSuccess: onDone },
    );
  };

  return (
    <>
      <SheetHeader>
        <SheetTitle>Prepare label: {shipment.customTrackingNumber}</SheetTitle>
        <SheetDescription>
          Book this on the {shipment.carrier.name} website with the details
          below, then upload the label PDF and the tracking number. The customer
          is emailed the label.
        </SheetDescription>
      </SheetHeader>

      <div className="space-y-4 px-4 pb-8">
        <Section title="Service">
          <Field label="Carrier" value={shipment.carrier.name} copy={false} />
          <Field
            label="Service quoted"
            value={`${shipment.serviceName} (${shipment.serviceType})`}
          />
          <Field
            label="Handover the customer chose"
            value={handoverText(shipment.handoverPreference)}
          />
          <Field
            label="Customer paid"
            value={formatCurrency(shipment.currency, shipment.actualPrice)}
            copy={false}
          />
          <Field
            label="Carrier cost quoted"
            value={formatCurrency(shipment.currency, shipment.carrierPrice)}
            copy={false}
          />
          <Field
            label="Paid at"
            value={formatDateTime(shipment.paidAt)}
            copy={false}
          />
          {shipment.isMultiLeg && (
            <p className="text-xs text-amber-700">
              Routed through the hub: book the first leg to the sorting centre
              (the address under To). Leg 2 is handled in Multi-Leg Ops.
            </p>
          )}
        </Section>

        <Section title="From (sender)">
          <Field label="Address" value={addressLines(from).join("\n")} />
          <Field label="Name" value={contactFrom?.personName ?? ""} />
          <Field
            label="Phone"
            value={contactFrom?.phoneNumber ?? shipment.user.phone ?? ""}
          />
          <Field
            label="Email"
            value={contactFrom?.emailAddress ?? shipment.user.email}
          />
        </Section>

        <Section title="To (recipient)">
          <Field
            label="Address"
            value={addressLines(shipment.dropoffAddress).join("\n")}
          />
          <Field label="Name" value={contactTo?.personName ?? ""} />
          <Field label="Phone" value={contactTo?.phoneNumber ?? ""} />
          <Field label="Email" value={contactTo?.emailAddress ?? ""} />
        </Section>

        <Section title={`Packages (${packages.length})`}>
          <Field
            label="Sizes and weights"
            value={packages.map(packageLine).join("\n")}
          />
          {shipment.customs && (
            <Field
              label="Customs"
              value={JSON.stringify(shipment.customs, null, 2)}
            />
          )}
        </Section>

        <Section title="Customer account">
          <Field label="Name" value={shipment.user.name} />
          <Field label="Email" value={shipment.user.email} />
          <Field label="Customer code" value={shipment.user.userCode} />
        </Section>

        <Can do="shipment:write" fallback="disable">
          <section className="rounded-lg border-2 border-brand-blue/30 p-4 space-y-4">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <FileUp className="h-4 w-4" /> Upload the label
            </h3>

            <div className="space-y-1.5">
              <Label htmlFor="label-file">
                Label PDF (one file, every page)
              </Label>
              <Input
                id="label-file"
                type="file"
                accept="application/pdf,.pdf"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="label-tracking">Carrier tracking number</Label>
              <Input
                id="label-tracking"
                value={tracking}
                onChange={(e) => setTracking(e.target.value)}
                placeholder="As printed on the label"
              />
            </div>

            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">
                How the parcel leaves the customer
              </legend>
              <div className="flex gap-4 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="label-handover"
                    checked={handover === "DROPOFF"}
                    onChange={() => setHandover("DROPOFF")}
                  />
                  Customer drops it off
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="label-handover"
                    checked={handover === "PICKUP"}
                    onChange={() => setHandover("PICKUP")}
                  />
                  I booked a courier pickup
                </label>
              </div>
            </fieldset>

            {handover === "PICKUP" && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="label-pickup-date">Pickup day</Label>
                  <Input
                    id="label-pickup-date"
                    type="date"
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="label-confirmation">
                    Pickup confirmation (optional)
                  </Label>
                  <Input
                    id="label-confirmation"
                    value={confirmation}
                    onChange={(e) => setConfirmation(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="label-ready">Ready from</Label>
                  <Input
                    id="label-ready"
                    type="time"
                    value={readyTime}
                    onChange={(e) => setReadyTime(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="label-close">Until</Label>
                  <Input
                    id="label-close"
                    type="time"
                    value={closeTime}
                    onChange={(e) => setCloseTime(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="label-service">
                Service booked (only if different)
              </Label>
              <Input
                id="label-service"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                placeholder={shipment.serviceName}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="label-notes">Internal notes (optional)</Label>
              <Textarea
                id="label-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>

            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}

            <Button className="w-full" onClick={submit} disabled={isPending}>
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              Save label and email the customer
            </Button>
          </section>
        </Can>
      </div>
    </>
  );
}
