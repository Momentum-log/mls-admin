/**
 * Hub routing configuration.
 *
 * MLS can route international shipments through the Łódź sorting centre —
 * two legs, potentially two carriers, one price to the customer. Two switches
 * control it, both database-backed so they change without a deploy.
 */

import type { CarrierAddress } from "@/types/shipping-estimate";

/** A sorting centre row. */
export interface SortingCenter {
  id: string;
  /** Short operational identifier, e.g. "PL-LODZ". Unique. */
  code: string;
  name: string;
  /** 1–3 lines; carriers reject more. */
  streetLines: string[];
  city: string;
  stateOrProvinceCode?: string | null;
  postalCode: string;
  /** ISO 3166-1 alpha-2. */
  countryCode: string;
  /** Required — carriers reject a leg originating at the centre without one. */
  contactName: string;
  contactPhone: string;
  /** Days a parcel sits at the centre between legs. Added to hub transit estimates. */
  dwellDays: number;
  /** Exactly one centre is active; activating one stands the others down. */
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * The hub currently in effect.
 *
 * `source` distinguishes a configured database row from the deploy-time
 * environment fallback. The API also returns a duplicate `resolvedFrom` with
 * the same value; prefer `source`.
 */
export interface ActiveHub {
  id: string;
  code: string;
  name: string;
  address: CarrierAddress;
  dwellDays: number;
  source: "database" | "environment";
  resolvedFrom?: "database" | "environment";
}

/** Response from `GET /admin/settings/hub`. */
export interface HubConfig {
  hubRoutingEnabled: boolean;
  competeBestPrice: boolean;
  /**
   * A plain-English sentence describing the current switch combination.
   * Server-owned — render it verbatim rather than deriving the wording here,
   * so the two stay in step.
   */
  routingMode: string;
  activeHub: ActiveHub | null;
  configured: boolean;
  sortingCenters: SortingCenter[];
}

/**
 * Shared shape of both toggle responses.
 *
 * `effective` is false when the switch was accepted but does nothing — hub
 * routing enabled with no centre configured, or compete flipped while hub
 * routing is off. `warning` explains why and is omitted, not null, when the
 * change took effect.
 */
export interface HubToggleResponse {
  effective: boolean;
  warning?: string;
  hubRoutingEnabled?: boolean;
  competeBestPrice?: boolean;
  /** Returned by the compete toggle only. */
  routingMode?: string;
}

/** Payload for creating a sorting centre. All fields required. */
export interface CreateSortingCenterPayload {
  code: string;
  name: string;
  streetLines: string[];
  city: string;
  stateOrProvinceCode?: string;
  postalCode: string;
  countryCode: string;
  contactName: string;
  contactPhone: string;
  dwellDays: number;
  isActive: boolean;
}

/** Payload for updating a sorting centre. All fields optional. */
export type UpdateSortingCenterPayload = Partial<CreateSortingCenterPayload>;
