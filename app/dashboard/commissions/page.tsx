"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useCarriers } from "@/hooks/carriers/use-carriers";
import {
  useCarrierCommissionSettings,
  useCommissionPreview,
  useGlobalCommissionSettings,
  useUpdateCarrierCommissionSettings,
  useUpdateGlobalCommissionSettings,
} from "@/hooks/settings/use-settings";
import { useDebounce } from "@/hooks/use-debounce";
import type { Carrier } from "@/types/carriers";
import type { CommissionMode, CommissionPreviewInput } from "@/types/settings";
import { formatCurrency } from "@/utils/format-currency";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertTriangle, Calculator, Loader2 } from "lucide-react";

const MODES: { value: CommissionMode; label: string; description: string }[] = [
  {
    value: "TARGET_UPLIFT",
    label: "Target uplift",
    description: "Customer pays carrier price + target %, VAT included",
  },
  {
    value: "FIXED_MARKUP",
    label: "Fixed markup",
    description:
      "Each carrier's percent or fixed commission per route, then the safety net",
  },
  {
    value: "NONE",
    label: "No commission",
    description: "Customer pays the carrier price plus VAT",
  },
];

const modeLabel = (mode: CommissionMode | null | undefined) =>
  MODES.find((m) => m.value === mode)?.label ?? "Fixed markup";

/** "30" -> 30; anything that is not a number from 0 to 500 -> null. */
function parsePercent(raw: string): number | null {
  if (raw.trim() === "") return null;
  const value = Number(raw.replace(",", "."));
  return Number.isFinite(value) && value >= 0 && value <= 500 ? value : null;
}

function ModeSelect({
  id,
  value,
  onChange,
  inheritLabel,
}: {
  id: string;
  value: CommissionMode | "INHERIT";
  onChange: (value: CommissionMode | "INHERIT") => void;
  /** Adds an "Inherit" option showing what it resolves to. */
  inheritLabel?: string;
}) {
  return (
    <Select
      value={value}
      onValueChange={(v) => onChange(v as CommissionMode | "INHERIT")}
    >
      <SelectTrigger id={id}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {inheritLabel && (
          <SelectItem value="INHERIT" description="Follow the global setting">
            {inheritLabel}
          </SelectItem>
        )}
        {MODES.map((m) => (
          <SelectItem key={m.value} value={m.value} description={m.description}>
            {m.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// ─── Global ──────────────────────────────────────────────────────────────────

function GlobalCard() {
  const { data, isLoading } = useGlobalCommissionSettings();
  const supported = data?.mode !== undefined;
  const saved = {
    mode: data?.mode ?? ("FIXED_MARKUP" as CommissionMode),
    target: data?.targetUpliftPercent ?? 30,
    threshold: data?.minThresholdEnabled ?? true,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Global commission</CardTitle>
        <CardDescription>
          Applies to every carrier that does not override it below.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin text-brand-blue" />
        ) : !supported ? (
          <p className="text-sm text-muted-foreground">
            The server does not know commission modes yet. Deploy mls-server
            with PR #24, then reload.
          </p>
        ) : (
          // Keyed on the saved values: a save or refetch restarts the form.
          <GlobalForm key={JSON.stringify(saved)} saved={saved} />
        )}
      </CardContent>
    </Card>
  );
}

function GlobalForm({
  saved,
}: {
  saved: { mode: CommissionMode; target: number; threshold: boolean };
}) {
  const { mutate: save, isPending } = useUpdateGlobalCommissionSettings();
  const [mode, setMode] = useState<CommissionMode>(saved.mode);
  const [target, setTarget] = useState(String(saved.target));
  const [threshold, setThreshold] = useState(saved.threshold);

  const targetValue = parsePercent(target);
  const dirty =
    mode !== saved.mode ||
    targetValue !== saved.target ||
    threshold !== saved.threshold;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="global-mode">Mode</Label>
          <ModeSelect
            id="global-mode"
            value={mode}
            onChange={(v) => v !== "INHERIT" && setMode(v)}
          />
        </div>
        {mode === "TARGET_UPLIFT" && (
          <div className="space-y-2">
            <Label htmlFor="global-target">Target uplift (%)</Label>
            <Input
              id="global-target"
              inputMode="decimal"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              aria-invalid={targetValue === null}
            />
            <p className="text-xs text-muted-foreground">
              Total the customer pays over the carrier price, VAT included. 30
              means carrier 100.00 becomes 130.00.
            </p>
          </div>
        )}
      </div>

      {mode === "FIXED_MARKUP" && (
        <div className="flex items-start gap-3">
          <Switch
            id="global-threshold"
            checked={threshold}
            onCheckedChange={setThreshold}
          />
          <div className="space-y-0.5">
            <Label htmlFor="global-threshold">
              Minimum commission safety net
            </Label>
            <p className="text-xs text-muted-foreground">
              Below the price threshold, charge the flat commission instead. The
              amounts are edited in{" "}
              <Link
                href="/dashboard/settings"
                className="text-brand-blue hover:underline"
              >
                Settings
              </Link>
              .
            </p>
          </div>
        </div>
      )}

      <Can do="staff:write" fallback="disable">
        <Button
          disabled={
            !dirty ||
            isPending ||
            (mode === "TARGET_UPLIFT" && targetValue === null)
          }
          onClick={() =>
            save({
              mode,
              ...(targetValue !== null
                ? { targetUpliftPercent: targetValue }
                : {}),
              minThresholdEnabled: threshold,
            })
          }
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save global commission
        </Button>
      </Can>
    </>
  );
}

// ─── Per-carrier overrides ───────────────────────────────────────────────────

function CarrierOverrideRow({
  carrier,
  globalMode,
  globalTarget,
}: {
  carrier: Carrier;
  globalMode: CommissionMode;
  globalTarget: number;
}) {
  const { data, isLoading } = useCarrierCommissionSettings(carrier.id);
  const nameCell = (
    <TableCell className="font-medium">
      <div className="flex items-center gap-2">
        {carrier.name}
        {!carrier.isActive && <Badge variant="secondary">Inactive</Badge>}
      </div>
    </TableCell>
  );

  if (isLoading || !data) {
    return (
      <TableRow>
        {nameCell}
        <TableCell colSpan={3}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <span className="text-sm text-muted-foreground">
              Could not load
            </span>
          )}
        </TableCell>
      </TableRow>
    );
  }

  const savedMode = data.commissionMode ?? "INHERIT";
  const savedTarget = data.targetUpliftPercent ?? null;
  return (
    <OverrideControls
      key={`${savedMode}:${savedTarget}`}
      carrier={carrier}
      nameCell={nameCell}
      savedMode={savedMode}
      savedTarget={savedTarget}
      globalMode={globalMode}
      globalTarget={globalTarget}
    />
  );
}

function OverrideControls({
  carrier,
  nameCell,
  savedMode,
  savedTarget,
  globalMode,
  globalTarget,
}: {
  carrier: Carrier;
  nameCell: React.ReactNode;
  savedMode: CommissionMode | "INHERIT";
  savedTarget: number | null;
  globalMode: CommissionMode;
  globalTarget: number;
}) {
  const { mutate: save, isPending } = useUpdateCarrierCommissionSettings();
  const [mode, setMode] = useState<CommissionMode | "INHERIT">(savedMode);
  const [target, setTarget] = useState(
    savedTarget == null ? "" : String(savedTarget),
  );

  const targetValue = parsePercent(target);
  const targetInvalid = target.trim() !== "" && targetValue === null;
  const effectiveMode = mode === "INHERIT" ? globalMode : mode;
  const dirty = mode !== savedMode || targetValue !== savedTarget;

  return (
    <TableRow>
      {nameCell}
      <TableCell className="min-w-48">
        <ModeSelect
          id={`mode-${carrier.id}`}
          value={mode}
          onChange={setMode}
          inheritLabel={`Global (${modeLabel(globalMode)})`}
        />
      </TableCell>
      <TableCell className="w-36">
        {effectiveMode === "TARGET_UPLIFT" ? (
          <Input
            aria-label={`${carrier.name} target uplift percent`}
            inputMode="decimal"
            placeholder={`${globalTarget} (global)`}
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            aria-invalid={targetInvalid}
          />
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell className="text-right">
        <Can do="staff:write" fallback="disable">
          <Button
            size="sm"
            variant="outline"
            disabled={!dirty || isPending || targetInvalid}
            onClick={() =>
              save({
                carrierId: carrier.id,
                payload: {
                  commissionMode: mode === "INHERIT" ? null : mode,
                  targetUpliftPercent: targetValue,
                },
              })
            }
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
          </Button>
        </Can>
      </TableCell>
    </TableRow>
  );
}

function OverridesCard() {
  const { data: carriers, isLoading } = useCarriers();
  const { data: global } = useGlobalCommissionSettings();
  const globalMode = global?.mode ?? "FIXED_MARKUP";
  const globalTarget = global?.targetUpliftPercent ?? 30;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Carrier overrides</CardTitle>
        <CardDescription>
          A carrier can use its own mode or target. Leave it on Global to follow
          the setting above. Fixed markup percentages per route are edited on
          the{" "}
          <Link
            href="/dashboard/carriers"
            className="text-brand-blue hover:underline"
          >
            Carriers
          </Link>{" "}
          page.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin text-brand-blue" />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Carrier</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Target %</TableHead>
                  <TableHead className="text-right">
                    <span className="sr-only">Save</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(carriers ?? []).map((carrier) => (
                  <CarrierOverrideRow
                    key={carrier.id}
                    carrier={carrier}
                    globalMode={globalMode}
                    globalTarget={globalTarget}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Calculator ──────────────────────────────────────────────────────────────

function CalculatorCard() {
  const { data: carriers } = useCarriers();
  const [chosenSlug, setCarrierSlug] = useState("");
  const [price, setPrice] = useState("100");
  const [currency, setCurrency] = useState<"PLN" | "EUR">("PLN");
  const [origin, setOrigin] = useState("PL");
  const [dest, setDest] = useState("PL");
  const [business, setBusiness] = useState(false);

  const carrierSlug = chosenSlug || carriers?.[0]?.slug || "";

  const input = useMemo<CommissionPreviewInput | null>(() => {
    const carrierPrice = Number(price.replace(",", "."));
    const country = /^[A-Z]{2}$/;
    if (!carrierSlug || !(carrierPrice > 0)) return null;
    if (!country.test(origin) || !country.test(dest)) return null;
    return {
      carrierPrice,
      carrierSlug,
      originCountry: origin,
      destCountry: dest,
      currency,
      ...(business ? { customsType: "S" } : {}),
    };
  }, [carrierSlug, price, currency, origin, dest, business]);

  const debounced = useDebounce(input, 400);
  const { data, isFetching, isError } = useCommissionPreview(debounced);
  const b = data?.breakdown;
  const money = (n: number) => formatCurrency(b?.currency ?? currency, n);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Price calculator
        </CardTitle>
        <CardDescription>
          What a customer would pay, worked out by the same code as checkout,
          with the saved settings.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-2">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="calc-carrier">Carrier</Label>
            <Select value={carrierSlug} onValueChange={setCarrierSlug}>
              <SelectTrigger id="calc-carrier">
                <SelectValue placeholder="Choose a carrier" />
              </SelectTrigger>
              <SelectContent>
                {(carriers ?? []).map((c) => (
                  <SelectItem key={c.id} value={c.slug}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="calc-price">Carrier price (net)</Label>
            <Input
              id="calc-price"
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="calc-currency">Currency</Label>
            <Select
              value={currency}
              onValueChange={(v) => setCurrency(v as "PLN" | "EUR")}
            >
              <SelectTrigger id="calc-currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PLN">PLN</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="calc-origin">From (country)</Label>
            <Input
              id="calc-origin"
              maxLength={2}
              value={origin}
              onChange={(e) => setOrigin(e.target.value.toUpperCase())}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="calc-dest">To (country)</Label>
            <Input
              id="calc-dest"
              maxLength={2}
              value={dest}
              onChange={(e) => setDest(e.target.value.toUpperCase())}
            />
          </div>
          <div className="flex items-center gap-2 sm:col-span-2">
            <Switch
              id="calc-business"
              checked={business}
              onCheckedChange={setBusiness}
            />
            <Label htmlFor="calc-business">Business customer</Label>
          </div>
        </div>

        <div className="rounded-lg border p-4" aria-live="polite">
          {!input ? (
            <p className="text-sm text-muted-foreground">
              Enter a carrier price and two-letter country codes.
            </p>
          ) : isError ? (
            <p className="text-sm text-destructive">
              The server could not price this. Check it runs mls-server PR #24.
            </p>
          ) : !b ? (
            <Loader2 className="h-5 w-5 animate-spin text-brand-blue" />
          ) : (
            <dl
              className={`space-y-2 text-sm ${isFetching ? "opacity-60" : ""}`}
            >
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Carrier</dt>
                <dd>{money(b.carrier)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">
                  Handling fee (our commission)
                </dt>
                <dd>{money(b.handlingFee)}</dd>
              </div>
              {b.pickupFee > 0 && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Pickup fee</dt>
                  <dd>{money(b.pickupFee)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-muted-foreground">VAT ({b.vatRate}%)</dt>
                <dd>{money(b.vat)}</dd>
              </div>
              <div className="flex justify-between border-t pt-2 font-semibold">
                <dt>Customer pays</dt>
                <dd>{money(b.total)}</dd>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <dt>Mode used</dt>
                <dd>
                  {modeLabel(data.settings.mode)}
                  {data.settings.mode === "TARGET_UPLIFT" &&
                    ` ${data.settings.targetUpliftPercent}%`}
                  {" · "}
                  {data.upliftPercent}% over carrier
                </dd>
              </div>
            </dl>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Commissions (W4): how the customer price is built from the carrier price,
 * globally and per carrier, with a calculator that asks the server.
 */
export default function CommissionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Commissions</h2>
        <p className="text-muted-foreground">
          What customers pay on top of the carrier price. Customers see it as
          the &quot;Handling fee&quot;.
        </p>
      </div>

      <div
        role="note"
        className="flex gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100"
      >
        <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden />
        <p>
          Target uplift charges VAT on the handling fee as well (carrier 100 +
          fee 5.69 + VAT 24.31 = 130.00 at 23%). Confirm this VAT base with the
          accountant before switching it on for live customers.
        </p>
      </div>

      <GlobalCard />
      <OverridesCard />
      <CalculatorCard />
    </div>
  );
}
