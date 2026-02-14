/**
 * Types for the shipping estimate flow used in the admin
 * "Create Shipment" page. These mirror the user-facing estimate
 * API but are structured for the admin panel's proxy shipment flow.
 */

/** Address payload for an estimate request. */
export interface EstimateAddress {
  street1: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: string;
  countryCode: string;
}

/** Package dimensions for an estimate request. */
export interface EstimateDimensions {
  length: number;
  width: number;
  height: number;
  units: "CM" | "IN";
}

/** Package weight for an estimate request. */
export interface EstimateWeight {
  value: number;
  units: "KG" | "LB";
}

/** The full estimate request payload. */
export interface ShippingEstimateRequest {
  pickup: EstimateAddress;
  dropoff: EstimateAddress;
  package: {
    weight: EstimateWeight;
    dimensions: EstimateDimensions;
  };
  email?: string;
  phone?: string;
}

/** A single rate option returned by the estimate API. */
export interface ShippingRate {
  carrier: string;
  serviceType: string;
  serviceName: string;
  estimatedDays: number;
  price: number;
  currency: string;
}

/** The full estimate response from the API. */
export interface ShippingEstimateResponse {
  rates: ShippingRate[];
}
