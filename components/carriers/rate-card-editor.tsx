import { useRef, useState } from "react";
import { Download, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRateCard, useReplaceRateCard } from "@/hooks/carriers/use-carriers";
import { useCan } from "@/components/auth/can";
import { parseRateCardCsv, rateCardToCsv, type ParsedRateCard } from "@/lib/rate-card-csv";
import type { RateCardRow } from "@/types/carriers";

interface RateCardEditorProps {
  slug: string;
  carrierName: string;
}

/** Rows shown before "Show all", so a long card does not stretch the sheet. */
const PREVIEW_ROWS = 50;

/**
 * The contract price list for a carrier with no rates API (DPD).
 *
 * Staff import the whole list as CSV and save it in one go; the server
 * replaces the previous card. Each parcel is priced on the smallest band that
 * holds it, and a parcel heavier than a service's top band means that service
 * is not offered.
 */
export default function RateCardEditor({ slug, carrierName }: RateCardEditorProps) {
  const { data: saved, isPending, error } = useRateCard(slug);
  const { mutate: save, isPending: isSaving } = useReplaceRateCard(slug);
  const { can } = useCan();
  const canEdit = can("carrier:write");

  const fileInput = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<ParsedRateCard | null>(null);
  const [showAll, setShowAll] = useState(false);

  const rows: RateCardRow[] = draft?.rows ?? saved ?? [];
  const visible = showAll ? rows : rows.slice(0, PREVIEW_ROWS);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setDraft(parseRateCardCsv(await file.text()));
    setShowAll(false);
    if (fileInput.current) fileInput.current.value = "";
  };

  const handleDownload = () => {
    const blob = new Blob([rateCardToCsv(saved ?? [])], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${slug.toUpperCase()}-RATE-CARD.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold">{carrierName} rate card</h3>
        <p className="text-xs text-muted-foreground">
          {carrierName} has no rates API, so quotes use this price list (net of VAT).
          Each row prices parcels up to its weight, above the previous row of the same
          service and lane. Import replaces the whole card.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          ref={fileInput}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          aria-label="Rate card CSV file"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        {canEdit && (
          <Button type="button" variant="outline" size="sm" onClick={() => fileInput.current?.click()}>
            <Upload className="mr-2 h-4 w-4" />
            Import CSV
          </Button>
        )}
        <Button type="button" variant="outline" size="sm" onClick={handleDownload} disabled={isPending}>
          <Download className="mr-2 h-4 w-4" />
          {saved && saved.length > 0 ? "Download CSV" : "Download template"}
        </Button>
      </div>

      {draft && (
        <div
          className={`rounded-lg border p-3 text-xs ${
            draft.errors.length > 0 ? "border-destructive/40 bg-destructive/5" : "bg-muted/40"
          }`}
        >
          {draft.errors.length > 0 ? (
            <>
              <p className="font-semibold text-destructive">
                {draft.errors.length} line(s) could not be read. Nothing was saved.
              </p>
              <ul className="mt-1 list-disc pl-4 space-y-0.5 max-h-32 overflow-y-auto">
                {draft.errors.map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
            </>
          ) : (
            <p>
              {draft.rows.length} rows read. Saving replaces the current {saved?.length ?? 0}.
            </p>
          )}
          <div className="mt-3 flex gap-2">
            <Button
              type="button"
              size="sm"
              disabled={isSaving || draft.errors.length > 0 || draft.rows.length === 0}
              onClick={() => save(draft.rows, { onSuccess: () => setDraft(null) })}
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save rate card
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setDraft(null)}>
              Discard
            </Button>
          </div>
        </div>
      )}

      {isPending ? (
        <div className="py-8 text-center">
          <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <p className="text-xs text-destructive">Could not load the rate card.</p>
      ) : rows.length === 0 ? (
        <p className="rounded-lg border border-dashed p-6 text-center text-xs text-muted-foreground">
          No rates yet, so {carrierName} is not quoted. Download the template, fill it in from
          the contract price list, and import it.
        </p>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lane</TableHead>
                <TableHead>Service</TableHead>
                <TableHead className="text-right">Up to kg</TableHead>
                <TableHead className="text-right">Net price</TableHead>
                <TableHead className="text-right">Days</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((row) => (
                <TableRow
                  key={`${row.originCountry}-${row.destCountry}-${row.serviceCode}-${row.maxWeightKg}`}
                >
                  <TableCell className="font-mono text-xs">
                    {row.originCountry} → {row.destCountry}
                  </TableCell>
                  <TableCell className="text-xs">{row.serviceName}</TableCell>
                  <TableCell className="text-right text-xs">{row.maxWeightKg}</TableCell>
                  <TableCell className="text-right text-xs">
                    {row.priceNet.toFixed(2)} {row.currency}
                  </TableCell>
                  <TableCell className="text-right text-xs">
                    {row.transitDaysMin !== undefined && row.transitDaysMax !== undefined
                      ? row.transitDaysMin === row.transitDaysMax
                        ? row.transitDaysMin
                        : `${row.transitDaysMin}–${row.transitDaysMax}`
                      : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {rows.length > PREVIEW_ROWS && (
            <div className="border-t p-2 text-center">
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowAll(!showAll)}>
                {showAll ? "Show fewer" : `Show all ${rows.length} rows`}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
