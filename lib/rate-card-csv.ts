import type { RateCardRow } from "@/types/carriers";

/** Column order of a rate card CSV, also its header row. */
export const RATE_CARD_COLUMNS = [
  "originCountry",
  "destCountry",
  "serviceCode",
  "serviceName",
  "maxWeightKg",
  "priceNet",
  "currency",
  "transitDaysMin",
  "transitDaysMax",
] as const;

export interface ParsedRateCard {
  rows: RateCardRow[];
  /** One message per bad line, with its line number. Empty when all parsed. */
  errors: string[];
}

/** Splits one CSV line, honouring double-quoted fields ("a, b"). */
function splitCsvLine(line: string, delimiter: string): string[] {
  const cells: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (quoted && line[i + 1] === '"') {
        cell += '"';
        i++;
      } else {
        quoted = !quoted;
      }
    } else if (char === delimiter && !quoted) {
      cells.push(cell.trim());
      cell = "";
    } else {
      cell += char;
    }
  }
  cells.push(cell.trim());
  return cells;
}

/** "12,50" and "12.50" both read as 12.5 (Polish spreadsheets use commas). */
function toNumber(value: string | undefined): number | undefined {
  if (value === undefined || value === "") return undefined;
  const n = Number(value.replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : NaN;
}

/**
 * Parses a rate card CSV exported from a spreadsheet.
 *
 * The first line must be the header (`RATE_CARD_COLUMNS`, any order). Comma
 * and semicolon delimiters are both accepted, since Polish Excel saves CSV
 * with semicolons. Nothing is sent on a bad line; every problem is listed.
 */
export function parseRateCardCsv(text: string): ParsedRateCard {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
  if (lines.length === 0) return { rows: [], errors: ["The file is empty."] };

  const delimiter = lines[0].includes(";") ? ";" : ",";
  const header = splitCsvLine(lines[0], delimiter);
  const index = Object.fromEntries(header.map((name, i) => [name, i]));
  const missing = RATE_CARD_COLUMNS.slice(0, 6).filter((c) => !(c in index));
  if (missing.length > 0) {
    return { rows: [], errors: [`Missing columns: ${missing.join(", ")}.`] };
  }

  const rows: RateCardRow[] = [];
  const errors: string[] = [];
  lines.slice(1).forEach((line, i) => {
    const lineNo = i + 2;
    const cells = splitCsvLine(line, delimiter);
    const get = (column: (typeof RATE_CARD_COLUMNS)[number]) =>
      column in index ? cells[index[column]] : undefined;

    const maxWeightKg = toNumber(get("maxWeightKg"));
    const priceNet = toNumber(get("priceNet"));
    const transitDaysMin = toNumber(get("transitDaysMin"));
    const transitDaysMax = toNumber(get("transitDaysMax"));
    const currency = (get("currency") || "PLN").toUpperCase();
    const originCountry = (get("originCountry") || "").toUpperCase();
    const destCountry = (get("destCountry") || "").toUpperCase();
    const serviceCode = get("serviceCode") || "";
    const serviceName = get("serviceName") || "";

    const problems = [
      originCountry.length !== 2 && "originCountry must be a 2-letter code",
      destCountry.length !== 2 && "destCountry must be a 2-letter code",
      !serviceCode && "serviceCode is empty",
      !serviceName && "serviceName is empty",
      !(maxWeightKg !== undefined && maxWeightKg > 0) && "maxWeightKg must be above 0",
      !(priceNet !== undefined && priceNet >= 0) && "priceNet must be a number",
      currency !== "PLN" && currency !== "EUR" && "currency must be PLN or EUR",
      Number.isNaN(transitDaysMin) && "transitDaysMin must be a number",
      Number.isNaN(transitDaysMax) && "transitDaysMax must be a number",
    ].filter(Boolean);

    if (problems.length > 0) {
      errors.push(`Line ${lineNo}: ${problems.join("; ")}.`);
      return;
    }

    rows.push({
      originCountry,
      destCountry,
      serviceCode,
      serviceName,
      maxWeightKg: maxWeightKg!,
      priceNet: priceNet!,
      currency: currency as RateCardRow["currency"],
      ...(transitDaysMin !== undefined ? { transitDaysMin } : {}),
      ...(transitDaysMax !== undefined ? { transitDaysMax } : {}),
    });
  });

  return { rows, errors };
}

/** The card as CSV, for download and editing in a spreadsheet. */
export function rateCardToCsv(rows: readonly RateCardRow[]): string {
  const quote = (v: string | number | undefined) => {
    const s = v === undefined ? "" : String(v);
    return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [
    RATE_CARD_COLUMNS.join(","),
    ...rows.map((row) => RATE_CARD_COLUMNS.map((c) => quote(row[c])).join(",")),
  ].join("\n");
}
