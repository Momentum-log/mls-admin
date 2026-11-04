/**
 * Supported carrier slugs in the MLS system.
 * These must match the backend adapter keys exactly.
 */
export const CARRIER_SLUGS = [
  { id: "fedex", name: "FedEx" },
  { id: "dhl-ecommerce", name: "DHL eCommerce" },
  { id: "dpd", name: "DPD" },
  { id: "momentum", name: "Momentum Logistics" },
  { id: "inpost", name: "InPost" },
] as const;

export type CarrierSlug = (typeof CARRIER_SLUGS)[number]["id"];

/**
 * Carriers with a rate card tab. DPD is priced only from its card (no rates
 * API); Momentum's card is optional weight bands on top of its per-kg prices.
 * FedEx and DHL quote live from their own systems, so a card is not used.
 */
export const RATE_CARD_CARRIER_SLUGS: readonly string[] = ["dpd", "momentum"];

/** Carriers with no carrier system: always manual fulfilment. */
export const ALWAYS_MANUAL_SLUGS: readonly string[] = ["momentum"];
