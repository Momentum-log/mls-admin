/**
 * Types for the shipping rate flow used by the admin "Create Shipment" wizard.
 *
 * These mirror the server's canonical carrier schemas exactly. An earlier
 * revision declared a flat address (`street1`/`state`) and a rate carrying
 * `price`/`estimatedDays` — neither shape exists on the server, so the rate
 * step could never have worked.
 */

/**
 * The canonical address every carrier-facing endpoint consumes.
 * Note `streetLines` is an array (max 3 lines) and the state field is
 * `stateOrProvinceCode`, not `state`.
 */
export interface CarrierAddress {
  streetLines: string[];
  city: string;
  stateOrProvinceCode?: string;
  postalCode: string;
  /** ISO 3166-1 alpha-2. Exactly two characters. */
  countryCode: string;
  residential: boolean;
}

/** Package weight. All packages in one request must share units. */
export interface EstimateWeight {
  value: number;
  units: "KG" | "LB";
}

/** Package dimensions. All packages in one request must share units. */
export interface EstimateDimensions {
  length: number;
  width: number;
  height: number;
  units: "CM" | "IN";
}

/** A single package. The server accepts an array of these. */
export interface EstimatePackage {
  weight: EstimateWeight;
  dimensions?: EstimateDimensions;
}

/**
 * Request body for `POST /shipments/get-shipping-quote`.
 *
 * The quote endpoint is used rather than `get-shipping-estimate` because the
 * latter rejects any cross-border request that does not carry a full customs
 * declaration, which the admin wizard does not collect.
 */
export interface ShippingQuoteRequest {
  pickup: CarrierAddress;
  dropoff: CarrierAddress;
  /** At least one package; units must match across all entries. */
  packages: EstimatePackage[];
  userCountryCode?: string;
  email?: string;
  phone?: string;
  currency?: "PLN" | "EUR";
}

/** A single priced rate option returned by the quote endpoint. */
export interface ShippingRate {
  carrier: string;
  /** Programmatic slug — this is what the proxy endpoint expects, not `carrier`. */
  carrierSlug: string;
  serviceType: string;
  serviceName: string;
  /** Raw carrier price before MLS commission. */
  carrierPrice: number;
  /** Customer-facing price after commission. */
  actualPrice: number;
  currency: string;
  /** Estimated delivery date, `YYYY-MM-DD`. Present only when the carrier commits. */
  deliveryDate?: string;
  /** Human-readable duration, e.g. "1-2 Business Days". */
  deliveryDescription?: string;
  warnings?: string[];
}

/** A carrier that failed to return rates for this route. */
export interface CarrierError {
  carrier: string;
  hasError: true;
  errorCode: number;
  details: string;
}

/** Response from `POST /shipments/get-shipping-quote`. */
export interface ShippingQuoteResponse {
  /** Persisted estimate id — pass this to the proxy endpoint to link the shipment. */
  estimateId: string;
  rates: ShippingRate[];
  /** Customer-facing Fastest/Balanced/Economy tiers. Unused by the admin wizard. */
  tiers?: Record<string, unknown>;
  errors?: CarrierError[];
  guestId?: string | null;
}
