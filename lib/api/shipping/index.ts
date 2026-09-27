import apiClient from "../index";
import {
  ShippingQuoteRequest,
  ShippingQuoteResponse,
} from "@/types/shipping-estimate";

/**
 * Fetches live carrier rates for a route.
 *
 * This is a customer-facing route, so it is NOT under `/admin` — it accepts any
 * valid bearer token, and the admin token satisfies it. The persisted estimate
 * it returns is what lets a proxy shipment be linked back to its quote via
 * `estimateId`.
 *
 * Uses `get-shipping-quote` rather than `get-shipping-estimate`: the estimate
 * endpoint rejects cross-border requests that lack a full customs declaration,
 * which the admin wizard does not collect.
 *
 * @param data - Pickup/dropoff addresses and package list.
 * @returns The estimate id plus every available rate, and any carrier errors.
 */
export const getShippingQuote = async (
  data: ShippingQuoteRequest,
): Promise<ShippingQuoteResponse> => {
  const response = await apiClient.post<ShippingQuoteResponse>(
    "/shipments/get-shipping-quote",
    data,
  );
  return response.data;
};
