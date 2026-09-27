/**
 * Response envelope normalisation.
 *
 * The admin API answers in four different shapes depending on which module
 * built the handler, and paginates two different ways. Rather than teach every
 * hook and page about that, the `api/` layer funnels responses through here so
 * everything above sees one shape.
 *
 * The four envelopes:
 *   1. `{ status: "success", ...payload }`  — `sendSuccess` SPREADS plain objects
 *   2. `{ data, pagination }`               — raw res.json
 *   3. `[...]`                              — a bare array
 *   4. `{ success: true, data }`            — reminder settings
 *
 * The two paginations:
 *   `{ page, limit, total, totalPages }` and `{ limit, offset, total }`
 */

import type { Paged, Pagination } from "@/types/api";

/** Keys the API has been observed to hang a collection off. */
const COLLECTION_KEYS = [
  "data",
  "users",
  "shipments",
  "leads",
  "logs",
  "requests",
  "templates",
  "invoices",
  "inquiries",
  "rules",
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Normalises either pagination shape into `{ page, limit, total, totalPages }`.
 *
 * Offset-style responses carry no page number, so it is derived. A `limit` of
 * zero would make that division explode, hence the guard.
 *
 * @param raw - The `pagination` object from a response, if any.
 * @param fallbackCount - Item count to fall back on when nothing is supplied.
 */
export function normalisePagination(
  raw: unknown,
  fallbackCount: number,
): Pagination {
  if (!isRecord(raw)) {
    return {
      page: 1,
      limit: fallbackCount || 1,
      total: fallbackCount,
      totalPages: 1,
    };
  }

  const limit = Number(raw.limit) || fallbackCount || 1;
  const total = Number(raw.total) || fallbackCount;

  // Page-style responses give `page` directly; offset-style must derive it.
  const page =
    raw.page !== undefined
      ? Number(raw.page) || 1
      : Math.floor((Number(raw.offset) || 0) / limit) + 1;

  const totalPages =
    raw.totalPages !== undefined
      ? Number(raw.totalPages) || 1
      : Math.max(1, Math.ceil(total / limit));

  return { page, limit, total, totalPages };
}

/**
 * Extracts a paginated collection from any of the API's response envelopes.
 *
 * @param raw - The raw response body.
 * @param key - Explicit collection key, when the response uses an unusual one.
 * @returns The items plus normalised pagination.
 */
export function unwrapList<T>(raw: unknown, key?: string): Paged<T> {
  // Envelope 3: a bare array, with no pagination to speak of.
  if (Array.isArray(raw)) {
    return {
      data: raw as T[],
      pagination: normalisePagination(undefined, raw.length),
    };
  }

  if (!isRecord(raw)) {
    return { data: [], pagination: normalisePagination(undefined, 0) };
  }

  const candidates = key ? [key, ...COLLECTION_KEYS] : COLLECTION_KEYS;
  const found = candidates.find((k) => Array.isArray(raw[k]));
  const data = found ? (raw[found] as T[]) : [];

  return {
    data,
    pagination: normalisePagination(raw.pagination, data.length),
  };
}

/**
 * Extracts a single entity from a response envelope.
 *
 * Strips a `status: "success"` marker when one is present. Note that
 * `sendSuccess` spreads plain objects, so an entity carrying its own `status`
 * — an Inquiry is `PENDING`/`CONTACTED`/`RESOLVED` — overwrites the marker
 * entirely. That is why the check is for the literal `"success"` and why
 * nothing anywhere should branch on `status === "success"` to detect failure.
 *
 * @param raw - The raw response body.
 * @param key - Optional key the entity is nested under.
 */
export function unwrapOne<T>(raw: unknown, key?: string): T {
  if (!isRecord(raw)) return raw as T;

  if (key && isRecord(raw[key])) return raw[key] as T;

  // Envelope 4 nests under `data` alongside a boolean success flag.
  if (raw.success === true && raw.data !== undefined) return raw.data as T;

  // Envelope 1, only when the marker actually survived the spread.
  if (raw.status === "success") {
    const rest: Record<string, unknown> = { ...raw };
    delete rest.status;

    // A lone `{ status: "success", data }` still nests.
    if (Object.keys(rest).length === 1 && rest.data !== undefined) {
      return rest.data as T;
    }
    return rest as T;
  }

  return raw as T;
}
