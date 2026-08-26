/**
 * Shared shapes for talking to the MLS admin API.
 */

/**
 * The error envelope every admin endpoint returns.
 *
 * `details` is usually a string, but a few endpoints return a structured
 * object — most importantly `create-leg-two`, whose 409 carries `quotedPrice`
 * and `livePrice` inside `details`. Read it with `getApiErrorDetails`.
 */
export interface ApiErrorBody {
  error?: string;
  code?: number;
  details?: string | Record<string, unknown>;
  /** Some handlers use `message` instead of `error`. */
  message?: string;
  /** Present on a 403 from the permission middleware — the permission that was missing. */
  required?: string;
}

/**
 * Normalised pagination.
 *
 * The API alternates between `{ page, limit, total, totalPages }` and
 * `{ limit, offset, total }` depending on the module. Everything above the
 * `api/` layer should see this shape only.
 */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** A paginated collection, normalised. */
export interface Paged<T> {
  data: T[];
  pagination: Pagination;
}
