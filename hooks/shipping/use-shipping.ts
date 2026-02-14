import { useMutation } from "@tanstack/react-query";
import { getShippingEstimates } from "@/api/shipping";
import { ShippingEstimateRequest } from "@/types/shipping-estimate";

/**
 * Mutation hook for fetching shipping estimates.
 * Uses a mutation (not query) because we POST to get rates
 * and the admin triggers it manually.
 */
export const useShippingEstimates = () => {
  return useMutation({
    mutationFn: (data: ShippingEstimateRequest) => getShippingEstimates(data),
  });
};
