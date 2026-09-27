import type {
  CarrierAddress,
  EstimatePackage,
} from "@/types/shipping-estimate";

/**
 * Flat address shape used by the Create Shipment wizard's form inputs.
 * Map it to `CarrierAddress` before sending — the API never accepts this shape.
 */
export interface Address {
  street1: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: string;
  countryCode: string;
}

export interface Weight {
  value: number;
  units: "KG" | "LB";
}

export interface Dimensions {
  length: number;
  width: number;
  height: number;
  units: "CM" | "IN";
}

export interface Package {
  weight: Weight;
  dimensions: Dimensions;
}

export interface Rate {
  serviceType: string;
  serviceName: string;
  carrierPrice: number;
}

export interface Shipment {
  id: string;
  customTrackingNumber: string;
  carrierName: string;
  status: "PENDING" | "IN_TRANSIT" | "DELIVERED" | "EXCEPTION" | "CANCELLED";
  paymentStatus: "PENDING" | "PAID" | "FAILED";
  pickupAddress: Address;
  dropoffAddress: Address;
  package: Package;
  createdAt: string;
  userId: string;
  trackingSyncEnabled: boolean;
  user?: {
    name: string;
    email: string;
  };
}

export interface ShipmentListResponse {
  shipments: Shipment[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Payload for `POST /admin/shipments/proxy` — creating a shipment on behalf
 * of a user.
 *
 * Mirrors the server schema exactly. Three fields are easy to get wrong:
 * - `carrierSlug`, not a display name. The server resolves the adapter from it.
 * - `packages` is an array, even for a single parcel.
 * - `rate.currency` feeds the commission calculation and defaults to PLN
 *   server-side, so omitting it on a EUR rate books the shipment at roughly a
 *   quarter of its price.
 *
 * `rate.actualPrice` is required by the schema but recomputed server-side from
 * `carrierPrice` and the route's commission tier, so it is advisory.
 */
export interface CreateProxyShipmentPayload {
  targetUserId: string;
  carrierSlug: string;
  pickupAddress: CarrierAddress;
  dropoffAddress: CarrierAddress;
  packages: EstimatePackage[];
  customs?: unknown;
  rate: {
    serviceType: string;
    serviceName: string;
    carrierPrice: number;
    actualPrice: number;
    currency: string;
  };
  /** Links the shipment back to the quote it came from. */
  estimateId?: string;
}

export interface BypassPaymentPayload {
  manualTransactionId: string;
  notes?: string;
}

/**
 * Payload for the manual status override endpoint.
 * `PUT /api/admin/shipments/:id/manual-status`
 *
 * @param status - Any valid ShipmentStatus (CREATED, PAID, IN_TRANSIT, DELIVERED, COMPLETED, CANCELLED, FAILED).
 * @param manualOverride - Marks the shipment as manually adjusted (default: true).
 * @param trackingSyncEnabled - If false, carrier tracking updates are ignored (default: false).
 * @param notify - If true, sends an email notification to the user about the change (default: true).
 */
export interface OverrideStatusPayload {
  status: string;
  manualOverride: boolean;
  trackingSyncEnabled: boolean;
  notify: boolean;
}

export interface ShipmentFilter {
  page?: number;
  limit?: number;
  status?: string;
  search?: string; // tracking number, user name, email, or userCode
  userId?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Filter params for fetching shipments scoped to a specific user.
 * Used with `GET /api/admin/shipments?userId={uuid}`.
 *
 * @param userId - Required user UUID to filter by.
 * @param page - Page number (default: 1).
 * @param limit - Items per page (default: 10).
 * @param status - Filter by shipment status.
 * @param search - Search by tracking number.
 * @param startDate - ISO date string for range start.
 * @param endDate - ISO date string for range end.
 */
export interface UserShipmentFilter {
  userId: string;
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}
