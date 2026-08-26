import { AxiosError } from "axios";
import type { ApiErrorBody } from "@/types/api";

/**
 * Narrows an unknown thrown value to an Axios error carrying the API's
 * error envelope.
 *
 * @param error - The value caught from a failed request.
 * @returns True when the value is an Axios error.
 */
export function isApiError(error: unknown): error is AxiosError<ApiErrorBody> {
  return error instanceof AxiosError;
}

/**
 * Extracts the API's error body from a caught value.
 *
 * @param error - The value caught from a failed request.
 * @returns The parsed error envelope, or undefined for non-HTTP failures.
 */
export function getApiErrorBody(error: unknown): ApiErrorBody | undefined {
  return isApiError(error) ? error.response?.data : undefined;
}

/**
 * Reads the structured `details` object from an error envelope.
 *
 * Most endpoints put a plain string in `details`; a few return an object.
 * Returns undefined when `details` is a string or absent, so callers can
 * safely reach for named fields without guarding twice.
 *
 * @param error - The value caught from a failed request.
 * @returns The details object, or undefined.
 */
export function getApiErrorDetails(
  error: unknown,
): Record<string, unknown> | undefined {
  const details = getApiErrorBody(error)?.details;
  return typeof details === "object" && details !== null ? details : undefined;
}

/**
 * Checks whether a failure carried a specific HTTP status.
 *
 * @param error - The value caught from a failed request.
 * @param status - The status to test for.
 */
export function hasStatus(error: unknown, status: number): boolean {
  return isApiError(error) && error.response?.status === status;
}

/**
 * Produces the best human-readable message for a failed request.
 *
 * The shared Axios interceptor already rewrites `error.message` to the
 * server's own wording when `details` is a string, so that is preferred over
 * the caller's fallback. The fallback is used only when the server said
 * nothing useful.
 *
 * @param error - The value caught from a failed request.
 * @param fallback - Message to show when the server gave no usable text.
 * @returns A message suitable for a toast.
 */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  const body = getApiErrorBody(error);

  if (typeof body?.details === "string" && body.details.trim()) {
    return body.details;
  }
  if (body?.message?.trim()) return body.message;
  if (body?.error?.trim()) return body.error;

  if (error instanceof Error && error.message.trim()) return error.message;

  return fallback;
}
