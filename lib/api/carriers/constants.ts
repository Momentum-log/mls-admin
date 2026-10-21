/**
 * Supported carrier slugs in the MLS system.
 * These must match the backend adapter keys exactly.
 */
export const CARRIER_SLUGS = [
  { id: "fedex", name: "FedEx" },
  { id: "dhl-ecommerce", name: "DHL eCommerce" },
  { id: "dpd", name: "DPD" },
  { id: "inpost", name: "InPost" },
] as const;

export type CarrierSlug = (typeof CARRIER_SLUGS)[number]["id"];

/** Carriers priced from a stored rate card rather than a rates API. */
export const RATE_CARD_CARRIER_SLUGS: readonly string[] = ["dpd"];
