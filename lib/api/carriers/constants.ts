/**
 * Supported carrier slugs in the MLS system.
 * These must match the backend adapter keys exactly.
 */
export const CARRIER_SLUGS = [
  { id: "fedex", name: "FedEx" },
  { id: "dhl", name: "DHL" },
  { id: "inpost", name: "InPost" },
] as const;

export type CarrierSlug = (typeof CARRIER_SLUGS)[number]["id"];
