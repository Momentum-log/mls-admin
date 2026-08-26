import { useMutation } from "@tanstack/react-query";
import { getShippingQuote } from "@/api/shipping";
import { ShippingQuoteRequest } from "@/types/shipping-estimate";

/**
 * Mutation hook for fetching live carrier rates.
 * A mutation rather than a query because the request is a POST the admin
 * triggers explicitly from the Create Shipment wizard.
 */
export const useShippingQuote = () => {
  return useMutation({
    mutationFn: (data: ShippingQuoteRequest) => getShippingQuote(data),
  });
};
