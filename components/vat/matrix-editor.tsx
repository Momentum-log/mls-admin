"use client";

import { useState } from "react";
import { usePublishVatMatrix } from "@/hooks/admin/use-vat";
import { Can } from "@/components/auth/can";
import { ReasonDialog } from "@/components/admin/reason-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X } from "lucide-react";
import {
  CLIENT_TYPES,
  CLIENT_TYPE_LABEL,
  ROUTE_LABEL,
  ROUTE_TYPES,
  VAT_CODES,
  VAT_CODE_LABEL,
  type ClientType,
  type RouteType,
  type TransitLane,
  type VatCell,
  type VatCode,
  type VatMatrixContent,
} from "@/types/vat";
import { diffMatrix } from "./matrix-diff";

const NO_TRANSIT = "none";

function CodeSelect({
  value,
  onChange,
  label,
  includeNone = false,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  includeNone?: boolean;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger aria-label={label} className="h-8 w-full text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {includeNone && <SelectItem value={NO_TRANSIT}>Same as above</SelectItem>}
        {VAT_CODES.map((code) => (
          <SelectItem key={code} value={code}>
            {code} · {VAT_CODE_LABEL[code]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function MatrixCell({
  route,
  client,
  cell,
  onChange,
}: {
  route: RouteType;
  client: ClientType;
  cell: VatCell;
  onChange: (cell: VatCell) => void;
}) {
  const name = `${ROUTE_LABEL[route]}, ${CLIENT_TYPE_LABEL[client]}`;
  // The transit variant only matters for a Polish business on a route that
  // crosses the EU border; other cells show it only if one is already set.
  const showTransit = Boolean(cell.transitCode) || (route === "R5" && client === "PL_B2B");

  return (
    <div className="space-y-1.5 min-w-[150px]">
      <CodeSelect
        label={`VAT code, ${name}`}
        value={cell.code}
        onChange={(code) => onChange({ ...cell, code: code as VatCode })}
      />
      {showTransit && (
        <div className="space-y-0.5">
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
            If via Poland
          </span>
          <CodeSelect
            includeNone
            label={`VAT code when transiting Poland, ${name}`}
            value={cell.transitCode ?? NO_TRANSIT}
            onChange={(value) => {
              onChange({
                ...cell,
                transitCode: value === NO_TRANSIT ? undefined : (value as VatCode),
              });
            }}
          />
        </div>
      )}
      <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Checkbox
          checked={Boolean(cell.accountantPending)}
          onChange={(e) => {
            onChange({ ...cell, accountantPending: e.target.checked || undefined });
          }}
        />
        Accountant pending
      </label>
    </div>
  );
}

function TransitLanes({
  lanes,
  onChange,
}: {
  lanes: TransitLane[];
  onChange: (lanes: TransitLane[]) => void;
}) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const valid = /^[A-Z]{2}$/.test(from) && /^[A-Z]{2}$/.test(to);

  return (
    <div className="space-y-3">
      <div>
        <h3 className="font-semibold">Lanes that transit Poland</h3>
        <p className="text-sm text-muted-foreground">
          Hub routes through the Polish sorting centre count automatically. List any other country
          pair here (either direction) to use the &ldquo;If via Poland&rdquo; code.
        </p>
      </div>
      <ul className="flex flex-wrap gap-2">
        {lanes.length === 0 && <li className="text-sm text-muted-foreground">No extra lanes.</li>}
        {lanes.map((lane, i) => (
          <li
            key={`${lane.from}-${lane.to}-${i}`}
            className="inline-flex items-center gap-1 rounded-full border bg-muted/40 py-1 pl-3 pr-1 font-mono text-sm"
          >
            {lane.from} ↔ {lane.to}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              aria-label={`Remove lane ${lane.from} to ${lane.to}`}
              onClick={() => onChange(lanes.filter((_, j) => j !== i))}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </li>
        ))}
      </ul>
      <form
        className="flex items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!valid) return;
          onChange([...lanes, { from, to }]);
          setFrom("");
          setTo("");
        }}
      >
        <div className="space-y-1">
          <Label htmlFor="lane-from">From</Label>
          <Input
            id="lane-from"
            className="w-20 font-mono"
            maxLength={2}
            placeholder="DE"
            value={from}
            onChange={(e) => setFrom(e.target.value.toUpperCase())}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="lane-to">To</Label>
          <Input
            id="lane-to"
            className="w-20 font-mono"
            maxLength={2}
            placeholder="NG"
            value={to}
            onChange={(e) => setTo(e.target.value.toUpperCase())}
          />
        </div>
        <Button type="submit" variant="outline" disabled={!valid}>
          <Plus className="mr-1 h-4 w-4" />
          Add lane
        </Button>
      </form>
    </div>
  );
}

/**
 * The VAT matrix as an editable draft: 7 routes by 4 client types, the invoice
 * wording per code and the transit lanes. Nothing is saved until "Publish";
 * that creates a new version, with a required reason, and never edits an old one.
 */
export function MatrixEditor({ active }: { active: VatMatrixContent }) {
  const [draft, setDraft] = useState<VatMatrixContent>(active);
  const [confirming, setConfirming] = useState(false);
  const { mutate: publish, isPending } = usePublishVatMatrix();

  const changes = diffMatrix(active, draft);
  const dirty = changes.length > 0;

  const setCell = (route: RouteType, client: ClientType, cell: VatCell) =>
    setDraft((d) => ({
      ...d,
      cells: { ...d.cells, [route]: { ...d.cells[route], [client]: cell } },
    }));

  const setNote = (code: VatCode, language: "pl" | "en", value: string) =>
    setDraft((d) => ({
      ...d,
      notes: { ...d.notes, [code]: { ...d.notes[code], [language]: value } },
    }));

  return (
    <div className="space-y-8">
      <div className="rounded-xl border bg-card shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 text-left">
              <th scope="col" className="p-3 font-semibold">
                Route
              </th>
              {CLIENT_TYPES.map((client) => (
                <th key={client} scope="col" className="p-3 font-semibold">
                  {CLIENT_TYPE_LABEL[client]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROUTE_TYPES.map((route) => (
              <tr key={route} className="border-t align-top">
                <th scope="row" className="p-3 text-left font-normal">
                  <span className="font-mono font-semibold">{route}</span>
                  <span className="block text-xs text-muted-foreground">{ROUTE_LABEL[route]}</span>
                </th>
                {CLIENT_TYPES.map((client) => (
                  <td key={client} className="p-3">
                    <MatrixCell
                      route={route}
                      client={client}
                      cell={draft.cells[route][client]}
                      onChange={(cell) => setCell(route, client, cell)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="space-y-3">
        <div>
          <h3 className="font-semibold">Invoice wording</h3>
          <p className="text-sm text-muted-foreground">
            Printed on the invoice under each code, in Polish and English. Leave 23% empty.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {VAT_CODES.map((code) => (
            <div key={code} className="space-y-2 rounded-lg border p-3">
              <p className="text-sm font-medium">
                <span className="font-mono">{code}</span> · {VAT_CODE_LABEL[code]}
              </p>
              <Label htmlFor={`note-pl-${code}`} className="text-xs text-muted-foreground">
                Polish
              </Label>
              <Textarea
                id={`note-pl-${code}`}
                rows={2}
                value={draft.notes[code].pl}
                onChange={(e) => setNote(code, "pl", e.target.value)}
              />
              <Label htmlFor={`note-en-${code}`} className="text-xs text-muted-foreground">
                English
              </Label>
              <Textarea
                id={`note-en-${code}`}
                rows={2}
                value={draft.notes[code].en}
                onChange={(e) => setNote(code, "en", e.target.value)}
              />
            </div>
          ))}
        </div>
      </section>

      <TransitLanes
        lanes={draft.transitLanes}
        onChange={(transitLanes) => setDraft((d) => ({ ...d, transitLanes }))}
      />

      <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t bg-background/95 py-3 backdrop-blur">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {dirty ? `${changes.length} unpublished change${changes.length === 1 ? "" : "s"}` : "No changes"}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" disabled={!dirty} onClick={() => setDraft(active)}>
            Discard
          </Button>
          <Can do="staff:write" fallback="disable">
            <Button disabled={!dirty} onClick={() => setConfirming(true)}>
              Publish new version
            </Button>
          </Can>
        </div>
      </div>

      <ReasonDialog
        open={confirming}
        onOpenChange={setConfirming}
        title="Publish a new VAT matrix version"
        description={
          <div className="space-y-2 text-sm">
            <p>
              New orders use this version straight away. Orders already placed keep the version they
              were taxed under.
            </p>
            <ul className="max-h-40 list-disc space-y-0.5 overflow-y-auto pl-5 text-xs">
              {changes.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        }
        label="Why the change"
        placeholder="For example: accountant confirmed R3 private is not taxable in Poland"
        required
        confirmLabel={isPending ? "Publishing…" : "Publish"}
        isLoading={isPending}
        onConfirm={(reason) =>
          publish({ ...draft, reason }, { onSuccess: () => setConfirming(false) })
        }
      />
    </div>
  );
}
