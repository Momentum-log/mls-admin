"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import {
  useDhlSettings,
  useGlobalCommissionSettings,
  useInvoiceExpiration,
  useReminderSettings,
  useUpdateDhlSettings,
  useUpdateInvoiceExpiration,
  useUpdateReminderSettings,
} from "@/hooks/settings/use-settings";
import { useCan, Can } from "@/components/auth/can";
import GlobalCommissionSheet from "@/components/carriers/global-commission-sheet";
import type { DhlSettings, ReminderSettings } from "@/types/settings";
import { formatCurrency } from "@/utils/format-currency";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  BellRing,
  Clock,
  Loader2,
  Lock,
  ShieldAlert,
  Truck,
} from "lucide-react";

/** A settings card, or a lock notice when the admin cannot read it. */
function Section({
  icon: Icon,
  title,
  description,
  readPermission,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  readPermission: string;
  children: ReactNode;
}) {
  const { can } = useCan();
  const allowed = can(readPermission);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="h-5 w-5 text-brand-blue" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {allowed ? (
          children
        ) : (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="h-4 w-4" />
            Requires {readPermission}.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function Loading() {
  return <Loader2 className="h-5 w-5 animate-spin text-brand-blue" />;
}

function GlobalCommissionSection() {
  const { data, isLoading } = useGlobalCommissionSettings();
  const [open, setOpen] = useState(false);

  if (isLoading) return <Loading />;

  const show = (value: number | null | undefined, currency: string) =>
    value == null ? "Not set" : formatCurrency(currency, value);

  return (
    <div className="space-y-4">
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-muted-foreground">Price threshold (PLN)</dt>
          <dd className="font-medium">{show(data?.minRatePln, "PLN")}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Flat commission (PLN)</dt>
          <dd className="font-medium">{show(data?.minFlatPln, "PLN")}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">EUR values</dt>
          <dd className="font-medium">
            {data?.isEurManual ? "Set by hand" : "Converted from PLN"}
          </dd>
        </div>
        {data?.isEurManual && (
          <div>
            <dt className="text-muted-foreground">Flat commission (EUR)</dt>
            <dd className="font-medium">{show(data?.minFlatEur, "EUR")}</dd>
          </div>
        )}
      </dl>
      <div className="flex items-center gap-3">
        <Can do="staff:write" fallback="disable">
          <Button variant="outline" onClick={() => setOpen(true)}>
            Edit safety net
          </Button>
        </Can>
        <Link
          href="/dashboard/carriers"
          className="text-sm text-brand-blue hover:underline"
        >
          Per-carrier commissions
        </Link>
      </div>
      <GlobalCommissionSheet open={open} onOpenChange={setOpen} />
    </div>
  );
}

function DhlSection() {
  const { data, isLoading } = useDhlSettings();
  if (isLoading || !data) return <Loading />;
  // Keyed on the saved values so a refetch after saving resets the form.
  return <DhlForm key={JSON.stringify(data)} initial={data} />;
}

function DhlForm({ initial }: { initial: DhlSettings }) {
  const { mutate: save, isPending } = useUpdateDhlSettings();
  const [form, setForm] = useState({
    ...initial,
    firstMileFeePln: String(initial.firstMileFeePln),
  });

  const fee = Number(form.firstMileFeePln);
  const isValid = Number.isFinite(fee) && fee >= 0 && fee <= 10_000;

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (isValid) save({ ...form, firstMileFeePln: fee });
      }}
    >
      <div className="space-y-1.5">
        <Label htmlFor="dhl-fee">Collection fee (PLN)</Label>
        <Input
          id="dhl-fee"
          type="number"
          min={0}
          max={10000}
          step="0.01"
          value={form.firstMileFeePln}
          onChange={(e) =>
            setForm({ ...form, firstMileFeePln: e.target.value })
          }
        />
        <p className="text-xs text-muted-foreground">
          Charged when MLS collects a DHL export parcel from the customer. New
          quotes use it; quotes already given keep their fee.
        </p>
      </div>
      <div className="space-y-1.5">
        <Label>Hand parcels to DHL at the hub by</Label>
        <Select
          value={form.hubHandoffDefault}
          onValueChange={(value) =>
            setForm({
              ...form,
              hubHandoffDefault: value as DhlSettings["hubHandoffDefault"],
            })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="COURIER">Booking a DHL courier</SelectItem>
            <SelectItem value="SERVICE_POINT">
              Dropping at a service point
            </SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Pre-selected in the Collections queue; staff can still pick the other.
        </p>
      </div>
      <div className="flex items-center justify-between rounded-md border p-3">
        <div>
          <Label htmlFor="dhl-vat">Add VAT to the collection fee</Label>
        </div>
        <Switch
          id="dhl-vat"
          checked={form.applyVat}
          onCheckedChange={(applyVat) => setForm({ ...form, applyVat })}
        />
      </div>
      <Can do="staff:write" fallback="disable">
        <Button type="submit" disabled={!isValid || isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save DHL settings
        </Button>
      </Can>
    </form>
  );
}

function InvoiceWindowSection() {
  const { data: current, isLoading } = useInvoiceExpiration();
  if (isLoading) return <Loading />;
  return (
    <InvoiceWindowForm key={current ?? "unknown"} current={current ?? null} />
  );
}

function InvoiceWindowForm({ current }: { current: number | null }) {
  const { mutate: save, isPending } = useUpdateInvoiceExpiration();
  const [hours, setHours] = useState(current == null ? "" : String(current));

  const value = Number(hours);
  const isValid = Number.isInteger(value) && value >= 1 && value <= 168;

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (isValid) save(value);
      }}
    >
      <div className="space-y-1.5">
        <Label htmlFor="invoice-hours">Hours a new invoice stays payable</Label>
        <Input
          id="invoice-hours"
          type="number"
          min={1}
          max={168}
          step={1}
          value={hours}
          placeholder={
            current == null ? "Current value not reported" : undefined
          }
          onChange={(e) => setHours(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          From 1 hour to 168 (one week). Invoices already issued keep their
          deadline.
          {current == null &&
            " This server version does not report the current value."}
        </p>
      </div>
      <Can do="shipment:write" fallback="disable">
        <Button type="submit" disabled={!isValid || isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save payment window
        </Button>
      </Can>
    </form>
  );
}

function ReminderSection() {
  const { data, isLoading } = useReminderSettings();
  if (isLoading) return <Loading />;
  return <ReminderForm key={JSON.stringify(data ?? null)} initial={data} />;
}

function ReminderForm({ initial }: { initial?: ReminderSettings }) {
  const { mutate: save, isPending } = useUpdateReminderSettings();
  const [enabled, setEnabled] = useState(initial?.isEnabled ?? false);
  const [hours, setHours] = useState(String(initial?.reminderHoursBefore ?? 3));

  const value = Number(hours);
  const isValid = Number.isInteger(value) && value >= 1 && value <= 24;

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (isValid) save({ isEnabled: enabled, reminderHoursBefore: value });
      }}
    >
      <div className="flex items-center justify-between rounded-md border p-3">
        <Label htmlFor="reminder-enabled">
          Email customers before an invoice expires
        </Label>
        <Switch
          id="reminder-enabled"
          checked={enabled}
          onCheckedChange={setEnabled}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="reminder-hours">Hours before expiry</Label>
        <Input
          id="reminder-hours"
          type="number"
          min={1}
          max={24}
          step={1}
          value={hours}
          disabled={!enabled}
          onChange={(e) => setHours(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">From 1 to 24.</p>
      </div>
      <Button type="submit" disabled={!isValid || isPending}>
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save reminders
      </Button>
    </form>
  );
}

/**
 * System settings, one card per server setting group. Each card checks the
 * permission its own endpoints need, because they differ: commission and DHL
 * are staff settings, the invoice window is a shipment setting, and payment
 * reminders are an email setting.
 */
export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Pricing, invoicing and DHL defaults that apply to every customer.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section
          icon={ShieldAlert}
          title="Commission safety net"
          description="When a carrier's price is at or below the threshold, MLS adds the flat commission instead of its percentage. Carriers without their own thresholds use these."
          readPermission="staff:read"
        >
          <GlobalCommissionSection />
        </Section>

        <Section
          icon={Truck}
          title="DHL eCommerce"
          description="The fee and handoff for parcels MLS collects and brings to the hub."
          readPermission="staff:read"
        >
          <DhlSection />
        </Section>

        <Section
          icon={Clock}
          title="Invoice payment window"
          description="How long customers have to pay before an invoice expires."
          readPermission="shipment:read"
        >
          <InvoiceWindowSection />
        </Section>

        <Section
          icon={BellRing}
          title="Payment reminders"
          description="A reminder email before an unpaid invoice expires."
          readPermission="email:write"
        >
          <ReminderSection />
        </Section>
      </div>
    </div>
  );
}
