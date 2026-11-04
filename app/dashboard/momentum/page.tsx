"use client";

import { useState } from "react";
import Link from "next/link";
import { useCarriers } from "@/hooks/carriers/use-carriers";
import {
  useMomentumSettings,
  useUpdateMomentumSettings,
} from "@/hooks/settings/use-settings";
import type {
  MomentumChargeCurrency,
  MomentumLane,
  MomentumSettings,
} from "@/types/settings";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { AlertTriangle, Loader2 } from "lucide-react";

type LaneKey = "ngToEu" | "euToNg";
type LaneForm = Record<keyof MomentumLane, string>;
type PriceField = "ratePerKg" | "belowMinimumFlatFee" | "expressRatePerKg";

interface FormState {
  ngToEu: LaneForm;
  euToNg: LaneForm;
  ngnPerEur: string;
  plnPerEur: string;
  weightStepKg: string;
  maxQuotableKg: string;
  whatsappNumber: string;
  dimensionalEnabled: boolean;
  dimensionalDivisor: string;
}

const LANES: { key: LaneKey; title: string }[] = [
  { key: "ngToEu", title: "Nigeria → EU" },
  { key: "euToNg", title: "EU → Nigeria" },
];

/** Currencies in the picker. Naira is listed but cannot be charged yet. */
const CURRENCIES: { code: MomentumChargeCurrency | "NGN"; label: string; symbol: string; chargeable: boolean }[] = [
  { code: "EUR", label: "Euro", symbol: "€", chargeable: true },
  { code: "PLN", label: "Polish złoty", symbol: "zł", chargeable: true },
  { code: "NGN", label: "Nigerian naira", symbol: "₦", chargeable: false },
];
const symbolOf = (code: string) => CURRENCIES.find((c) => c.code === code)?.symbol ?? code;

const PRICE_FIELDS: PriceField[] = ["ratePerKg", "belowMinimumFlatFee", "expressRatePerKg"];

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Units of `currency` per €1 from the reference rates, or null if unknown. */
function perEur(currency: string, form: Pick<FormState, "ngnPerEur" | "plnPerEur">): number | null {
  if (currency === "EUR") return 1;
  const raw = currency === "PLN" ? form.plnPerEur : currency === "NGN" ? form.ngnPerEur : "";
  const n = Number(raw);
  return raw.trim() !== "" && Number.isFinite(n) && n > 0 ? n : null;
}

/** `amount` in `from` expressed in `to` with the reference rates, or null. */
function convert(amount: number, from: string, to: string, form: Pick<FormState, "ngnPerEur" | "plnPerEur">) {
  const a = perEur(from, form);
  const b = perEur(to, form);
  return a && b ? (amount / a) * b : null;
}

const str = (value: number | null) => (value === null ? "" : String(value));

const laneToForm = (lane: MomentumLane): LaneForm => ({
  chargeCurrency: lane.chargeCurrency ?? "EUR",
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
  plnPerEur: str(s.plnPerEur ?? null),
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
      chargeCurrency: f.chargeCurrency as MomentumChargeCurrency,
      ratePerKg: parse(f.ratePerKg, true),
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
    if (lane.ratePerKg === 0) return `${title}: the price per kg must be above 0, or empty.`;
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
  const plnPerEur = parse(form.plnPerEur, true);
  if (ngnPerEur === undefined || ngnPerEur === 0) return "Naira per €1 must be a number above 0, or empty.";
  if (plnPerEur === undefined || plnPerEur === 0 || (plnPerEur ?? 0) > 100) {
    return "Złoty per €1 must be a number above 0 (and under 100), or empty.";
  }
  if (!weightStepKg || weightStepKg > 10) return "The weight step must be between 0 and 10 kg.";
  if (!divisor || divisor < 1000 || divisor > 10000) return "The volumetric divisor must be 1000 to 10000.";

  return {
    ...lanes,
    ngnPerEur,
    plnPerEur,
    weightStepKg,
    maxQuotableKg,
    whatsappNumber: whatsappDigits || null,
    dimensionalWeight: { enabled: form.dimensionalEnabled, divisor },
  };
}

/** Same rules as the server's quoteMomentum, for the preview only. */
function previewPrice(lane: MomentumLane, weight: number, step: number, express: boolean) {
  const rate = express ? lane.expressRatePerKg : lane.ratePerKg;
  if (rate === null || lane.ratePerKg === null || weight <= 0) return null;
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

  const [notes, setNotes] = useState<Partial<Record<LaneKey, string>>>({});

  const setLane = (key: LaneKey, field: keyof MomentumLane, value: string) =>
    setForm((f) => ({ ...f, [key]: { ...f[key], [field]: value } }));

  /**
   * A new currency means new prices. With a reference rate the current ones
   * are converted as a starting point; without one they are cleared. Either
   * way staff type or check the amounts: nothing is reinterpreted silently.
   */
  const changeCurrency = (key: LaneKey, next: string) => {
    const lane = form[key];
    const from = lane.chargeCurrency;
    if (next === from) return;
    let converted = true;
    const prices = Object.fromEntries(
      PRICE_FIELDS.map((field) => {
        const raw = lane[field];
        if (raw.trim() === "") return [field, ""];
        const value = convert(Number(raw), from, next, form);
        if (value === null) {
          converted = false;
          return [field, ""];
        }
        return [field, String(round2(value))];
      }),
    );
    setForm((f) => ({ ...f, [key]: { ...f[key], ...prices, chargeCurrency: next } }));
    const hadPrices = PRICE_FIELDS.some((field) => lane[field].trim() !== "");
    setNotes((n) => ({
      ...n,
      [key]: !hadPrices
        ? `Type the prices in ${symbolOf(next)}.`
        : converted
          ? `Prices converted from ${symbolOf(from)} with your reference rates. Check each one and type the exact ${symbolOf(next)} amounts you want before saving.`
          : `Prices cleared: there is no reference rate between ${symbolOf(from)} and ${symbolOf(next)}. Type the ${symbolOf(next)} prices.`,
    }));
  };

  /** "≈ ₦23,000" next to a price, from the reference rates. */
  const equivalent = (raw: string, currency: string) => {
    if (raw.trim() === "" || !Number.isFinite(Number(raw))) return null;
    const others = ["NGN", "EUR", "PLN"].filter((c) => c !== currency);
    const parts = others
      .map((c) => {
        const v = convert(Number(raw), currency, c, form);
        return v === null ? null : money(round2(v), c);
      })
      .filter(Boolean);
    return parts.length ? `≈ ${parts.join(" · ")} at your reference rates.` : null;
  };

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (settings) save(settings);
      }}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {LANES.map(({ key, title }) => {
          const f = form[key];
          const currency = f.chargeCurrency;
          const symbol = symbolOf(currency);
          const id = (field: string) => `${key}-${field}`;
          return (
            <Card key={key}>
              <CardHeader>
                <CardTitle className="text-base">{title}</CardTitle>
                <CardDescription>
                  Customers pay these exact amounts, in {currency}.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={id("currency")}>Customer pays in</Label>
                  <Select value={currency} onValueChange={(v) => changeCurrency(key, v)}>
                    <SelectTrigger id={id("currency")}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((c) => (
                        <SelectItem
                          key={c.code}
                          value={c.code}
                          disabled={!c.chargeable}
                          description={c.chargeable ? undefined : "Needs a naira payment gateway (Paystack). Coming later."}
                        >
                          {c.label} ({c.symbol})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Every customer on this route pays in this currency, and the prices below are typed in it.
                  </p>
                  {notes[key] && (
                    <p className="rounded-md border border-amber-200 bg-amber-50 p-2 text-xs text-amber-900" role="status">
                      {notes[key]}
                    </p>
                  )}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    id={id("rate")}
                    label={`Standard price per kg (${symbol})`}
                    placeholder={`e.g. ${currency === "PLN" ? "60" : "14"} ${symbol}`}
                    hint={equivalent(f.ratePerKg, currency) ?? (f.ratePerKg.trim() === "" ? "Empty: this route is not priced online yet." : undefined)}
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
                  hint={equivalent(f.belowMinimumFlatFee, currency) ?? "Empty: shipments under the minimum are charged as the minimum weight."}
                  placeholder={`Not set (${symbol})`}
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
                    hint={equivalent(f.expressRatePerKg, currency) ?? "Empty: express is not sold online. Customers see “Express shipping also available” with a contact link."}
                    placeholder={`Not set (${symbol})`}
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
            <CardTitle className="text-base">Reference rates and weight</CardTitle>
            <CardDescription>
              Reference rates only show equivalents and suggest prices when you change a route&apos;s
              currency. They never change what customers pay.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                id="ngn-per-eur"
                label="Naira per €1"
                placeholder="e.g. 1700"
                value={form.ngnPerEur}
                onChange={(v) => setForm({ ...form, ngnPerEur: v })}
              />
              <Field
                id="pln-per-eur"
                label="Złoty per €1"
                placeholder="e.g. 4.30"
                value={form.plnPerEur}
                onChange={(v) => setForm({ ...form, plnPerEur: v })}
              />
            </div>
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
                {LANES.map(({ key, title }) =>
                  [false, true].map((express) => {
                    const currency = settings[key].chargeCurrency;
                    const overLimit =
                      settings.maxQuotableKg !== null &&
                      Math.ceil(Number(previewKg) / settings.weightStepKg - 1e-9) *
                        settings.weightStepKg >
                        settings.maxQuotableKg;
                    const price = overLimit
                      ? null
                      : previewPrice(settings[key], Number(previewKg), settings.weightStepKg, express);
                    const naira =
                      price !== null ? convert(price, currency, "NGN", form) : null;
                    return (
                      <li key={`${key}-${express}`} className="flex justify-between gap-4">
                        <span>
                          {title} {express ? "express" : "standard"}
                        </span>
                        <span className="text-right font-medium tabular-nums">
                          {overLimit
                            ? "request a quote"
                            : settings[key].ratePerKg === null
                            ? "not priced"
                            : price === null
                            ? express
                              ? "on request"
                              : "-"
                            : `${money(round2(price), currency)}${naira !== null ? ` (≈ ${money(round2(naira), "NGN")})` : ""}`}
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
 * Momentum Logistics' own Nigeria <-> EU-27 service (W5): per route, the
 * currency customers pay in and the prices typed in it; reference rates and
 * the weight rules.
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

      {carrier?.isConfigured === false && (
        <p className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive" role="alert">
          The server this dashboard talks to is an older build that doesn&apos;t include Momentum, so
          Nigeria ↔ EU gets no prices even though it is active. Deploy the latest dev on the server
          (on Render, check Events) and reload. Its /health page lists the carriers it can quote.
        </p>
      )}

      {carrier?.isActive === false && (
        <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          Momentum is switched off, so Nigeria ↔ EU customers are asked to contact you instead of
          seeing prices. Switch it on in Carriers. Note that a paid Momentum shipment still needs
          staff to arrange it by hand until manual fulfilment is built.
        </p>
      )}

      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      ) : data === null ? (
        <p className="text-sm text-muted-foreground">
          The server does not know Momentum rates yet. Deploy the latest mls-server dev, then reload.
        </p>
      ) : data ? (
        <MomentumForm key={JSON.stringify(data)} initial={data} />
      ) : null}
    </div>
  );
}
