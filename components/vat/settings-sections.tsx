"use client";

import { useState } from "react";
import {
  useBillingSettings,
  useFxStatus,
  useHiddenServices,
  useHideRules,
  useRefreshFxRates,
  useUpdateBillingEnforced,
  useUpdateFxSettings,
  useUpdateHiddenServices,
  useUpdateHideRules,
  useUpdateVatAlertSettings,
  useVatAlertSettings,
} from "@/hooks/admin/use-vat";
import { Can } from "@/components/auth/can";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { formatDate, formatDateTime } from "@/utils/format-date";
import type { FxStatus, HiddenServices, HideRateRules } from "@/types/vat";
import { AlertTriangle, Loader2, Plus, RefreshCw, X } from "lucide-react";

function Loading() {
  return <Loader2 className="h-5 w-5 animate-spin text-brand-blue" />;
}

/** The rate quotes use right now, its source and date, and the controls for it. */
export function FxSection() {
  const { data, isLoading } = useFxStatus();
  if (isLoading || !data) return <Loading />;
  // Keyed on the saved values so the form resets after a save or refresh.
  return <FxPanel key={JSON.stringify(data.settings)} status={data} />;
}

function FxPanel({ status }: { status: FxStatus }) {
  const { settings, effective, history } = status;
  const { mutate: save, isPending } = useUpdateFxSettings();
  const { mutate: refresh, isPending: isRefreshing } = useRefreshFxRates();
  const [auto, setAuto] = useState(settings.autoEnabled);
  const [manual, setManual] = useState(settings.manualRate ? String(settings.manualRate.rate) : "");
  const [buffer, setBuffer] = useState(String(settings.bufferPercent));

  const bufferValue = Number(buffer);
  const manualValue = Number(manual);
  const bufferValid = buffer !== "" && Number.isFinite(bufferValue) && bufferValue >= 0 && bufferValue <= 20;
  const manualValid = auto || (manual !== "" && Number.isFinite(manualValue) && manualValue > 0 && manualValue <= 100);
  const latestNbp = history.find((row) => row.pair === "EURPLN");

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!bufferValid || !manualValid) return;
        save({
          autoEnabled: auto,
          bufferPercent: bufferValue,
          // Keep a typed manual rate on file while NBP is on, so switching back needs no retyping.
          ...(manual !== "" && Number.isFinite(manualValue) && manualValue > 0
            ? { manualRate: manualValue }
            : { manualRate: null }),
        });
      }}
    >
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-muted-foreground">EUR/PLN in use</dt>
          <dd className="font-medium">
            {effective.eurPln?.toFixed(4) ?? "No rate"}{" "}
            <Badge variant={effective.source === "MANUAL" ? "secondary" : "outline"}>
              {effective.source === "MANUAL" ? "Manual" : "NBP"}
            </Badge>
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Rate date</dt>
          <dd className="font-medium">{effective.effectiveDate ? formatDate(effective.effectiveDate) : "—"}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Latest NBP EUR/PLN</dt>
          <dd className="font-medium">
            {latestNbp ? `${latestNbp.mid.toFixed(4)} (${formatDate(latestNbp.effectiveDate)})` : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Latest NBP USD/PLN</dt>
          <dd className="font-medium">{effective.usdPln?.toFixed(4) ?? "—"}</dd>
        </div>
      </dl>

      {effective.stale && (
        <p className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900" role="status">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          The newest NBP rate is more than {effective.staleAfterDays} days old. Quotes use the last good
          rate until NBP answers again.
        </p>
      )}

      <div className="flex items-center justify-between rounded-md border p-3">
        <div>
          <Label htmlFor="fx-auto">Use NBP rates automatically</Label>
          <p className="text-xs text-muted-foreground">Turn off to quote with the manual rate below.</p>
        </div>
        <Switch id="fx-auto" checked={auto} onCheckedChange={setAuto} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="fx-manual">Manual EUR/PLN rate</Label>
          <Input
            id="fx-manual"
            type="number"
            min={0}
            max={100}
            step="0.0001"
            value={manual}
            disabled={auto}
            onChange={(e) => setManual(e.target.value)}
          />
          {settings.manualRate && (
            <p className="text-xs text-muted-foreground">Set {formatDateTime(settings.manualRate.setAt)}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="fx-buffer">EUR buffer (%)</Label>
          <Input
            id="fx-buffer"
            type="number"
            min={0}
            max={20}
            step="0.1"
            value={buffer}
            onChange={(e) => setBuffer(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">Added to EUR prices only. PLN is never buffered.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Can do="staff:write" fallback="disable">
          <Button type="submit" disabled={!bufferValid || !manualValid || isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save rate settings
          </Button>
        </Can>
        <Can do="staff:write" fallback="disable">
          <Button type="button" variant="outline" disabled={isRefreshing} onClick={() => refresh()}>
            {isRefreshing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Refresh from NBP
          </Button>
        </Can>
      </div>

      {history.length > 0 && (
        <details className="text-sm">
          <summary className="cursor-pointer text-brand-blue">Recent NBP rates</summary>
          <ul className="mt-2 space-y-0.5 font-mono text-xs">
            {history.map((row) => (
              <li key={`${row.pair}-${row.effectiveDate}-${row.source}`}>
                {formatDate(row.effectiveDate)} · {row.pair} · {row.mid.toFixed(4)}
              </li>
            ))}
          </ul>
        </details>
      )}
    </form>
  );
}

export function HiddenServicesSection() {
  const { data, isLoading } = useHiddenServices();
  if (isLoading || !data) return <Loading />;
  return <HiddenServicesEditor key={JSON.stringify(data)} initial={data} />;
}

function HiddenServicesEditor({ initial }: { initial: HiddenServices }) {
  const { mutate: save, isPending } = useUpdateHiddenServices();
  const [hidden, setHidden] = useState<HiddenServices>(initial);
  const [carrier, setCarrier] = useState("");
  const [service, setService] = useState("");

  const entries = Object.entries(hidden).flatMap(([slug, codes]) =>
    codes.map((code) => ({ slug, code })),
  );
  const dirty = JSON.stringify(hidden) !== JSON.stringify(initial);
  const canAdd = carrier.trim() !== "" && service.trim() !== "";

  const remove = (slug: string, code: string) =>
    setHidden((h) =>
      Object.fromEntries(
        Object.entries(h)
          .map(([key, codes]) => [key, key === slug ? codes.filter((c) => c !== code) : codes] as const)
          .filter(([, codes]) => codes.length > 0),
      ),
    );

  return (
    <div className="space-y-4">
      <ul className="flex flex-wrap gap-2">
        {entries.length === 0 && <li className="text-sm text-muted-foreground">No services hidden.</li>}
        {entries.map(({ slug, code }) => (
          <li
            key={`${slug}-${code}`}
            className="inline-flex items-center gap-1 rounded-full border bg-muted/40 py-1 pl-3 pr-1 font-mono text-xs"
          >
            {slug} · {code}
            <Can do="staff:write" fallback="disable">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                aria-label={`Show ${code} for ${slug} again`}
                onClick={() => remove(slug, code)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </Can>
          </li>
        ))}
      </ul>

      <form
        className="flex flex-wrap items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!canAdd) return;
          const slug = carrier.trim().toLowerCase();
          const code = service.trim().toUpperCase();
          setHidden((h) => ({ ...h, [slug]: Array.from(new Set([...(h[slug] ?? []), code])) }));
          setCarrier("");
          setService("");
        }}
      >
        <div className="space-y-1">
          <Label htmlFor="hide-carrier">Carrier</Label>
          <Input id="hide-carrier" className="w-28" placeholder="fedex" value={carrier} onChange={(e) => setCarrier(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="hide-service">Service code</Label>
          <Input
            id="hide-service"
            className="w-56 font-mono"
            placeholder="INTERNATIONAL_FIRST"
            value={service}
            onChange={(e) => setService(e.target.value)}
          />
        </div>
        <Can do="staff:write" fallback="disable">
          <Button type="submit" variant="outline" disabled={!canAdd}>
            <Plus className="mr-1 h-4 w-4" />
            Hide
          </Button>
        </Can>
      </form>
      <p className="text-xs text-muted-foreground">
        Use the carrier&apos;s service code, not its display name. Quotes stop showing hidden services
        straight away; bookings already made are unaffected.
      </p>

      <Can do="staff:write" fallback="disable">
        <Button disabled={!dirty || isPending} onClick={() => save(hidden)}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save hidden services
        </Button>
      </Can>
    </div>
  );
}

export function VatAlertsSection() {
  const { data, isLoading } = useVatAlertSettings();
  if (isLoading || !data) return <Loading />;
  return <VatAlertsForm key={data.emails.join(",")} initial={data.emails} />;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function VatAlertsForm({ initial }: { initial: string[] }) {
  const { mutate: save, isPending } = useUpdateVatAlertSettings();
  const [text, setText] = useState(initial.join(", "));
  const emails = text.split(/[,\s]+/).filter(Boolean);
  const valid = emails.length <= 20 && emails.every((e) => EMAIL.test(e));

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) save(emails);
      }}
    >
      <div className="space-y-1.5">
        <Label htmlFor="vat-alert-emails">Recipients (comma separated)</Label>
        <Input
          id="vat-alert-emails"
          value={text}
          placeholder="accountant@example.com"
          onChange={(e) => setText(e.target.value)}
        />
        {!valid && <p className="text-xs text-destructive">Check the email addresses.</p>}
      </div>
      <Can do="staff:write" fallback="disable">
        <Button type="submit" disabled={!valid || isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save recipients
        </Button>
      </Can>
    </form>
  );
}

/** The billing-details switch, the registry status, and the dormant address-proof setting. */
export function BillingSection() {
  const { data, isLoading } = useBillingSettings();
  const { mutate: setEnforced, isPending } = useUpdateBillingEnforced();
  if (isLoading || !data) return <Loading />;

  const outages = Object.entries(data.registries).filter(([, r]) => r.outage);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-md border p-3">
        <div>
          <Label htmlFor="billing-enforced">Require billing details before booking</Label>
          <p className="text-xs text-muted-foreground">
            Turn on once the customer app collects billing details. While off, orders go through as
            private customers.
          </p>
        </div>
        <Can do="staff:write" fallback="disable">
          <Switch
            id="billing-enforced"
            checked={data.settings.enforced}
            disabled={isPending}
            onCheckedChange={setEnforced}
          />
        </Can>
      </div>

      <div className="flex items-center justify-between rounded-md border border-dashed p-3 opacity-80">
        <div>
          <Label htmlFor="billing-proof">Proof of address</Label>
          <p className="text-xs text-muted-foreground">
            Not available yet. The client chose no uploads and no manual approval for now, so this
            cannot be switched on.
          </p>
        </div>
        <Switch id="billing-proof" checked={data.settings.addressProofRequired} disabled />
      </div>

      <div className="space-y-1 text-sm">
        <p className="font-medium">Tax ID registries</p>
        {(["BIALA_LISTA", "VIES"] as const).map((name) => {
          const outage = data.registries[name].outage;
          return (
            <p key={name} className="flex items-center gap-2 text-muted-foreground">
              {name === "BIALA_LISTA" ? "Biała lista (PL)" : "VIES (EU)"}
              {outage ? (
                <Badge variant="destructive">Down since {formatDateTime(outage.since)}</Badge>
              ) : (
                <Badge variant="outline">Reachable</Badge>
              )}
            </p>
          );
        })}
        {outages.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Orders from business customers are held until the registry answers or staff resolve them in
            VAT Review.
          </p>
        )}
      </div>
    </div>
  );
}

/** Hide slow or expensive-looking options by transit time or a name keyword. */
export function HideRulesSection() {
  const { data, isLoading } = useHideRules();
  if (isLoading || !data) return <Loading />;
  return <HideRulesEditor key={JSON.stringify(data)} initial={data} />;
}

function HideRulesEditor({ initial }: { initial: HideRateRules }) {
  const { mutate: save, isPending } = useUpdateHideRules();
  const [days, setDays] = useState(initial.maxTransitDays?.toString() ?? "");
  const [keywords, setKeywords] = useState<string[]>(initial.keywords);
  const [keyword, setKeyword] = useState("");

  const parsedDays = days.trim() === "" ? null : Number(days);
  const daysValid = parsedDays === null || (Number.isInteger(parsedDays) && parsedDays >= 1 && parsedDays <= 90);
  const dirty =
    parsedDays !== initial.maxTransitDays || JSON.stringify(keywords) !== JSON.stringify(initial.keywords);

  const addKeyword = (): void => {
    const next = keyword.trim();
    if (!next) return;
    setKeywords((k) => Array.from(new Set([...k, next])));
    setKeyword("");
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="hide-days">Hide options slower than (days)</Label>
        <Input
          id="hide-days"
          type="number"
          min={1}
          max={90}
          className="w-32"
          placeholder="Off"
          value={days}
          onChange={(e) => setDays(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Options whose longest estimate is above this are not shown. Leave empty to turn off.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="hide-keyword">Hide options whose name contains</Label>
        <ul className="flex flex-wrap gap-2">
          {keywords.length === 0 && <li className="text-sm text-muted-foreground">No keywords.</li>}
          {keywords.map((k) => (
            <li
              key={k}
              className="inline-flex items-center gap-1 rounded-full border bg-muted/40 py-1 pl-3 pr-1 text-xs"
            >
              {k}
              <Can do="staff:write" fallback="disable">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  aria-label={`Remove keyword ${k}`}
                  onClick={() => setKeywords((all) => all.filter((x) => x !== k))}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </Can>
            </li>
          ))}
        </ul>
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            addKeyword();
          }}
        >
          <Input
            id="hide-keyword"
            className="w-56"
            placeholder="economy"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <Can do="staff:write" fallback="disable">
            <Button type="submit" variant="outline" disabled={!keyword.trim()}>
              <Plus className="mr-1 h-4 w-4" />
              Add
            </Button>
          </Can>
        </form>
      </div>

      <Can do="staff:write" fallback="disable">
        <Button
          disabled={!dirty || !daysValid || isPending}
          onClick={() => save({ maxTransitDays: parsedDays, keywords })}
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save
        </Button>
      </Can>
      {!daysValid && <p className="text-xs text-destructive">Enter a whole number from 1 to 90.</p>}
    </div>
  );
}
