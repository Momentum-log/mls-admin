export type CommissionType = "PERCENT" | "FIXED";
export type CommissionCurrency = "PLN" | "EUR";

/** A single commission configuration. */
export interface Commission {
  type: CommissionType;
  /**
   * For PERCENT: 0.15 = 15%
   * For FIXED: 15.00 = 15.00 (Currency)
   */
  value: number;
  /** Required if type is FIXED. */
  currency?: CommissionCurrency;
}

/**
 * Carrier object as returned by the API.
 * API keys/secrets are masked in the response.
 */
export interface Carrier {
  id: string;
  name: string;
  /** Programmatic slug for backend adapter routing (e.g. "fedex") */
  slug: string;
  baseUrl?: string;
  /** Masked API key (e.g. "sk_live_...4321") */
  apiKey?: string;
  /** Masked API secret */
  apiSecret?: string;
  isActive: boolean;

  // Commission configuration per stage
  localCommission: Commission;
  exportCommission: Commission;
  importCommission: Commission;
  internationalCommission: Commission;

  createdAt: string;
  updatedAt: string;
}

/** Payload for creating a new carrier. */
export interface CreateCarrierPayload {
  name: string;
  slug: string;
  baseUrl?: string;
  apiKey?: string;
  apiSecret?: string;
  isActive?: boolean;
}

/** Payload for updating a carrier profile. */
export interface UpdateCarrierPayload {
  name?: string;
  slug?: string;
  baseUrl?: string;
  apiKey?: string;
  apiSecret?: string;
  isActive?: boolean;
}

/** Payload for updating commissions (CL02 logic enforced by backend). */
export interface UpdateCommissionsPayload {
  local: Commission;
  export: Commission;
  import: Commission;
  international: Commission;
}
