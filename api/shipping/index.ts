import apiClient from "../index";
import {
  ShippingEstimateRequest,
  ShippingEstimateResponse,
} from "@/types/shipping-estimate";

/**
 * Calls the shipping estimate endpoint to get available rates.
 * Uses the same endpoint as the user-facing website.
 *
 * @param data - Pickup/dropoff addresses + package dimensions.
 * @returns Available shipping rates from all carriers.
 */
export const getShippingEstimates = async (
  data: ShippingEstimateRequest,
): Promise<ShippingEstimateResponse> => {
  const response = await apiClient.post<ShippingEstimateResponse>(
    "/shipping/estimates",
    data,
  );
  return response.data;
};
