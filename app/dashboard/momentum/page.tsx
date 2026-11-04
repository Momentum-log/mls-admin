"use client";

import { useState } from "react";
import Link from "next/link";
import { useCarriers } from "@/hooks/carriers/use-carriers";
import {
  useMomentumSettings,
  useUpdateMomentumSettings,
} from "@/hooks/settings/use-settings";
import type { MomentumLane, MomentumSettings } from "@/types/settings";
import { Can } from "@/components/auth/can";
import { Badge } from "@/components/ui/badge";
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
import { Switch } from "@/components/ui/switch";
import { AlertTriangle, Loader2 } from "lucide-react";

type LaneKey = "ngToEu" | "euToNg";
type LaneForm = Record<keyof MomentumLane, string>;

interface FormState {
  ngToEu: LaneForm;
  euToNg: LaneForm;
  ngnPerEur: string;
  weightStepKg: string;
  maxQuotableKg: string;
  whatsappNumber: string;
  dimensionalEnabled: boolean;
  dimensionalDivisor: string;
}

const LANES: { key: LaneKey; title: string; currency: "NGN" | "EUR"; symbol: string }[] = [
  { key: "ngToEu", title: "Nigeria → EU", currency: "NGN", symbol: "₦" },
  { key: "euToNg", title: "EU → Nigeria", currency: "EUR", symbol: "€" },
];

const str = (value: number | null) => (value === null ? "" : String(value));

const laneToForm = (lane: MomentumLane): LaneForm => ({
  ratePerKg: str(lane.ratePerKg),
  minChargeableKg: str(lane.minChargeableKg),
  belowMinimumFlatFee: str(lane.belowMinimumFlatFee),
  transitDaysMin: str(lane.transitDaysMin),
  transitDaysMax: str(lane.transitDaysMax),
  expressRatePerKg: str(lane.expressRatePerKg),
  expressTransitDaysMin: str(lane.expressTransitDaysMin),
  expressTransitDaysMax: str(lane.expressTransitDaysMax),
});

const toForm = (s: MomentumSettings): FormState => ({
  ngToEu: laneToForm(s.ngToEu),
  euToNg: laneToForm(s.euToNg),
  ngnPerEur: str(s.ngnPerEur),
  weightStepKg: str(s.weightStepKg),
  maxQuotableKg: str(s.maxQuotableKg),
  whatsappNumber: s.whatsappNumber ?? "",
  dimensionalEnabled: s.dimensionalWeight.enabled,
  dimensionalDivisor: str(s.dimensionalWeight.divisor),
});

/** A number, null for an empty optional field, or undefined when invalid. */
const parse = (value: string, optional: boolean, integer = false): number | null | undefined => {
  if (value.trim() === "") return optional ? null : undefined;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return undefined;
  if (integer && !Number.isInteger(n)) return undefined;
  return n;
};

/** The settings to send, or a message saying what is wrong. */
function toSettings(form: FormState): MomentumSettings | string {
  const lanes = {} as Record<LaneKey, MomentumLane>;
  for (const { key, title } of LANES) {
    const f = form[key];
    const lane = {
      ratePerKg: parse(f.ratePerKg, false),
      minChargeableKg: parse(f.minChargeableKg, false),
      belowMinimumFlatFee: parse(f.belowMinimumFlatFee, true),
      transitDaysMin: parse(f.transitDaysMin, false, true),
      transitDaysMax: parse(f.transitDaysMax, false, true),
      expressRatePerKg: parse(f.expressRatePerKg, true),
      expressTransitDaysMin: parse(f.expressTransitDaysMin, false, true),
      expressTransitDaysMax: parse(f.expressTransitDaysMax, false, true),
    };
    if (Object.values(lane).some((v) => v === undefined)) {
      return `${title}: every price and day field needs a valid number (leave flat fee or express empty to switch them off).`;
    }
    if (!lane.ratePerKg) return `${title}: the price per kg must be above 0.`;
    if (lane.transitDaysMin! > lane.transitDaysMax!) {
      return `${title}: standard days "from" is after "to".`;
    }
    if (lane.expressTransitDaysMin! > lane.expressTransitDaysMax!) {
      return `${title}: express days "from" is after "to".`;
    }
    lanes[key] = lane as MomentumLane;
  }

  const ngnPerEur = parse(form.ngnPerEur, true);
  const weightStepKg = parse(form.weightStepKg, false);
  const divisor = parse(form.dimensionalDivisor, false, true);
  const maxQuotableKg = parse(form.maxQuotableKg, true);
  const whatsappDigits = form.whatsappNumber.replace(/[\s()+-]/g, "");
  if (maxQuotableKg === undefined || maxQuotableKg === 0) {
    return "The quote limit must be a weight above 0, or empty for no limit.";
  }
  if (whatsappDigits && !/^\d{8,15}$/.test(whatsappDigits)) {
    return "WhatsApp number: use the international number, digits only, e.g. 2348012345678.";
  }
  if (ngnPerEur === undefined || ngnPerEur === 0) return "The naira rate must be a number above 0, or empty.";
  if (!weightStepKg || weightStepKg > 10) return "The weight step must be between 0 and 10 kg.";
  if (!divisor || divisor < 1000 || divisor > 10000) return "The volumetric divisor must be 1000 to 10000.";

  return {
    ...lanes,
    ngnPerEur,
    weightStepKg,
    maxQuotableKg,
    whatsappNumber: whatsappDigits || null,
    dimensionalWeight: { enabled: form.dimensionalEnabled, divisor },
  };
}

/** Same rules as the server's quoteMomentum, for the preview only. */
function previewPrice(lane: MomentumLane, weight: number, step: number, express: boolean) {
  const rate = express ? lane.expressRatePerKg : lane.ratePerKg;
  if (rate === null || weight <= 0) return null;
  const kg = Math.ceil(weight / step - 1e-9) * step;
  if (kg < lane.minChargeableKg) {
    if (!express && lane.belowMinimumFlatFee !== null) return lane.belowMinimumFlatFee;
    return rate * lane.minChargeableKg;
  }
  return rate * kg;
}

function money(amount: number, currency: string) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(amount);
}

function Field({
  id,
  label,
  hint,
  value,
  onChange,
  step = "any",
  placeholder,
}: {
  id: string;
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  step?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="number"
        min={0}
        step={step}
        inputMode="decimal"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function MomentumForm({ initial }: { initial: MomentumSettings }) {
  const { mutate: save, isPending } = useUpdateMomentumSettings();
  const [form, setForm] = useState<FormState>(() => toForm(initial));
  const [previewKg, setPreviewKg] = useState("10");

  const result = toSettings(form);
  const error = typeof result === "string" ? result : null;
  const settings = typeof result === "string" ? null : result;

  const setLane = (key: LaneKey, field: keyof MomentumLane, value: string) =>
    setForm((f) => ({ ...f, [key]: { ...f[key], [field]: value } }));

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (settings) save(settings);
      }}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {LANES.map(({ key, title, currency, symbol }) => {
          const f = form[key];
          const id = (field: string) => `${key}-${field}`;
          return (
            <Card key={key}>
              <CardHeader>
                <CardTitle className="text-base">{title}</CardTitle>
                <CardDescription>Prices in {currency}.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    id={id("rate")}
                    label={`Standard price per kg (${symbol})`}
                    value={f.ratePerKg}
                    onChange={(v) => setLane(key, "ratePerKg", v)}
                  />
                  <Field
                    id={id("min")}
                    label="Minimum weight (kg)"
                    value={f.minChargeableKg}
                    onChange={(v) => setLane(key, "minChargeableKg", v)}
                  />
                </div>
                <Field
                  id={id("flat")}
                  label={`Flat fee under the minimum (${symbol})`}
                  hint="Empty: shipments under the minimum are charged as the minimum weight."
                  placeholder="Not set"
                  value={f.belowMinimumFlatFee}
                  onChange={(v) => setLane(key, "belowMinimumFlatFee", v)}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    id={id("days-min")}
                    label="Standard days, from"
                    step="1"
                    value={f.transitDaysMin}
                    onChange={(v) => setLane(key, "transitDaysMin", v)}
                  />
                  <Field
                    id={id("days-max")}
                    label="to"
                    step="1"
                    value={f.transitDaysMax}
                    onChange={(v) => setLane(key, "transitDaysMax", v)}
                  />
                </div>
                <div className="space-y-4 rounded-md border p-3">
                  <Field
                    id={id("express")}
                    label={`Express price per kg (${symbol})`}
                    hint="Empty: express is not sold online. Customers see “Express shipping also available” with a contact link."
                    placeholder="Not set"
                    value={f.expressRatePerKg}
                    onChange={(v) => setLane(key, "expressRatePerKg", v)}
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      id={id("x-days-min")}
                      label="Express days, from"
                      step="1"
                      value={f.expressTransitDaysMin}
                      onChange={(v) => setLane(key, "expressTransitDaysMin", v)}
                    />
                    <Field
                      id={id("x-days-max")}
                      label="to"
                      step="1"
                      value={f.expressTransitDaysMax}
                      onChange={(v) => setLane(key, "expressTransitDaysMax", v)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Currency and weight</CardTitle>
            <CardDescription>
              Customers are charged in EUR (PLN for Polish accounts), never naira.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field
              id="ngn-per-eur"
              label="Naira per €1"
              hint="Converts Nigeria → EU prices. Empty: Nigeria → EU is not quoted."
              placeholder="Not set"
              value={form.ngnPerEur}
              onChange={(v) => setForm({ ...form, ngnPerEur: v })}
            />
            <Field
              id="max-quotable"
              label="Price online up to (kg)"
              hint="Heavier shipments get no price and a “Request a quote” button instead. Empty: no limit."
              placeholder="No limit"
              value={form.maxQuotableKg}
              onChange={(v) => setForm({ ...form, maxQuotableKg: v })}
            />
            <div className="space-y-1.5">
              <Label htmlFor="whatsapp">Support WhatsApp number</Label>
              <Input
                id="whatsapp"
                type="tel"
                inputMode="tel"
                placeholder="2348012345678"
                value={form.whatsappNumber}
                onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                International format, no leading 0. “Request a quote” and the express note open a
                WhatsApp chat with this number. Empty: they link to the contact page.
              </p>
            </div>
            <Field
              id="weight-step"
              label="Round weight up to (kg)"
              value={form.weightStepKg}
              onChange={(v) => setForm({ ...form, weightStepKg: v })}
            />
            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <Label htmlFor="dim-on">Dimensional weight</Label>
                <p className="text-xs text-muted-foreground">
                  Charge the larger of actual and volumetric weight. Off until the client confirms.
                </p>
              </div>
              <Switch
                id="dim-on"
                checked={form.dimensionalEnabled}
                onCheckedChange={(dimensionalEnabled) => setForm({ ...form, dimensionalEnabled })}
              />
            </div>
            <Field
              id="dim-divisor"
              label="Volumetric divisor (cm³ per kg)"
              step="1"
              value={form.dimensionalDivisor}
              onChange={(v) => setForm({ ...form, dimensionalDivisor: v })}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Preview</CardTitle>
            <CardDescription>
              Net price before VAT for a shipment of this chargeable weight.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field
              id="preview-kg"
              label="Weight (kg)"
              value={previewKg}
              onChange={setPreviewKg}
            />
            {settings ? (
              <ul className="space-y-2 text-sm">
                {LANES.map(({ key, title, currency }) =>
                  [false, true].map((express) => {
                    const overLimit =
                      settings.maxQuotableKg !== null &&
                      Math.ceil(Number(previewKg) / settings.weightStepKg - 1e-9) *
                        settings.weightStepKg >
                        settings.maxQuotableKg;
                    const price = overLimit
                      ? null
                      : previewPrice(settings[key], Number(previewKg), settings.weightStepKg, express);
                    const inEur =
                      price !== null && currency === "NGN"
                        ? settings.ngnPerEur
                          ? money(price / settings.ngnPerEur, "EUR")
                          : "not quoted (no naira rate)"
                        : null;
                    return (
                      <li key={`${key}-${express}`} className="flex justify-between gap-4">
                        <span>
                          {title} {express ? "express" : "standard"}
                        </span>
                        <span className="text-right font-medium tabular-nums">
                          {overLimit
                            ? "request a quote"
                            : price === null
                            ? express
                              ? "on request"
                              : "-"
                            : `${money(price, currency)}${inEur ? ` → ${inEur}` : ""}`}
                        </span>
                      </li>
                    );
                  }),
                )}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Fix the fields to see a preview.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {error && (
        <p className="flex items-center gap-2 text-sm text-destructive" role="alert">
          <AlertTriangle className="h-4 w-4" /> {error}
        </p>
      )}
      <Can do="staff:write" fallback="disable">
        <Button type="submit" disabled={!settings || isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Momentum rates
        </Button>
      </Can>
    </form>
  );
}

/**
 * Momentum Logistics' own Nigeria <-> EU-27 service (W5): per-kg prices,
 * minimum weight, flat fee, express, naira rate and the weight rules.
 */
export default function MomentumRatesPage() {
  const { data, isLoading } = useMomentumSettings();
  const { data: carriers } = useCarriers();
  const carrier = carriers?.find((c) => c.slug === "momentum");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Momentum rates</h2>
          <p className="text-muted-foreground">
            Our own door-to-door service between Nigeria and the 27 EU countries. On these routes it is the
            only option customers see while it is active. Commission is off unless you switch it
            on in{" "}
            <Link href="/dashboard/commissions" className="underline">
              Commissions
            </Link>
            .
          </p>
        </div>
        {carrier && (
          <div className="flex items-center gap-2 text-sm">
            <Badge variant={carrier.isActive ? "default" : "secondary"}>
              {carrier.isActive ? "Active" : "Inactive"}
            </Badge>
            <Link href="/dashboard/carriers" className="underline">
              Carriers
            </Link>
          </div>
        )}
      </div>

      {carrier?.isActive === false && (
        <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          Momentum is switched off, so customers don&apos;t see it yet. Paying for and booking a
          Momentum shipment also needs manual fulfilment, which isn&apos;t built yet. Keep it off
          until then.
        </p>
      )}

      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      ) : data === null ? (
        <p className="text-sm text-muted-foreground">
          The server does not know Momentum rates yet. Deploy mls-server with PR #25, then reload.
        </p>
      ) : data ? (
        <MomentumForm key={JSON.stringify(data)} initial={data} />
      ) : null}
    </div>
  );
}
