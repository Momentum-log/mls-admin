import {
  CLIENT_TYPES,
  CLIENT_TYPE_LABEL,
  ROUTE_TYPES,
  VAT_CODES,
  type VatCell,
  type VatMatrixContent,
} from "@/types/vat";

/** One cell as text: `23`, `0 (via Poland: 23)`, with the pending marker. */
export function describeCell(cell: VatCell | undefined): string {
  if (!cell) return "unset";
  const transit = cell.transitCode ? ` (via Poland: ${cell.transitCode})` : "";
  const pending = cell.accountantPending ? ", accountant pending" : "";
  return `${cell.code}${transit}${pending}`;
}

const sameCell = (a: VatCell | undefined, b: VatCell | undefined) =>
  describeCell(a) === describeCell(b);

const laneKey = (lane: { from: string; to: string }) => `${lane.from}-${lane.to}`;

/**
 * What differs between two matrices, as readable lines for the publish
 * confirmation and the version history.
 */
export function diffMatrix(from: VatMatrixContent, to: VatMatrixContent): string[] {
  const lines: string[] = [];

  for (const route of ROUTE_TYPES) {
    for (const client of CLIENT_TYPES) {
      const a = from.cells[route]?.[client];
      const b = to.cells[route]?.[client];
      if (!sameCell(a, b)) {
        lines.push(`${route} · ${CLIENT_TYPE_LABEL[client]}: ${describeCell(a)} → ${describeCell(b)}`);
      }
    }
  }

  for (const code of VAT_CODES) {
    const a = from.notes[code];
    const b = to.notes[code];
    if (a?.pl !== b?.pl || a?.en !== b?.en) lines.push(`Invoice note for ${code} changed`);
  }

  const before = new Set(from.transitLanes.map(laneKey));
  const after = new Set(to.transitLanes.map(laneKey));
  for (const key of after) if (!before.has(key)) lines.push(`Transit lane added: ${key}`);
  for (const key of before) if (!after.has(key)) lines.push(`Transit lane removed: ${key}`);

  return lines;
}
