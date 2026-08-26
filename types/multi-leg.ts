/**
 * Multi-leg (hub-routed) shipments.
 *
 * When a shipment routes through the sorting centre it has two carrier legs.
 * Leg 2 is created by a human on purpose: the system can see a carrier mark
 * leg 1 delivered, but only a person at the centre can confirm the parcel is
 * physically there. Creating leg 2 off a carrier status alone dispatches a
 * courier to collect something that has not arrived.
 */

/** One carrier leg of a hub-routed journey. */
export interface ShipmentLeg {
  id: string;
  shipmentId: string;
  /** 1 = feeder (customer → hub), 2 = long-haul (hub → destination). */
  sequence: number;
  carrierCode: string;
  carrierSlug: string;
  serviceType: string;
  serviceName: string;
  originAddress: Record<string, unknown>;
  destAddress: Record<string, unknown>;
  /** Price quoted for this leg when the customer booked. */
  quotedPrice: number;
  currency: string;
  trackingNumber?: string | null;
  labelUrl?: string | null;
  /**
   * The carrier's own free-text status — NOT the MLS `ShipmentStatus` enum.
   * Display only.
   */
  status?: string | null;
  /** True when ops logged this leg from a carrier outside MLS. */
  isManualEntry: boolean;
  createdAt: string;
  updatedAt: string;
}

/** The customer, as returned on both list and detail. */
export interface MultiLegCustomer {
  id: string;
  email: string;
  name: string;
}

/**
 * A row in the ops queue.
 *
 * `canConfirmArrival` and `canCreateLegTwo` come from the server so the state
 * rules live in one place. Drive the action buttons from these flags rather
 * than re-deriving them from `shipmentStatus`.
 */
export interface MultiLegShipment {
  id: string;
  customTrackingNumber: string;
  shipmentStatus: string;
  customer: MultiLegCustomer;
  canConfirmArrival: boolean;
  canCreateLegTwo: boolean;
  legs: ShipmentLeg[];
}

/** Response from `GET /admin/shipments/multi-leg`. */
export interface MultiLegListResponse {
  count: number;
  shipments: MultiLegShipment[];
}

/**
 * Detail view.
 *
 * The endpoint spreads the entire shipment row, including a full `carrier`
 * object carrying `apiKey`/`apiSecret`. The API layer narrows that to a safe
 * subset before it reaches component state.
 */
export interface MultiLegShipmentDetail extends MultiLegShipment {
  carrierTrackingNumber?: string | null;
  serviceName?: string;
  serviceType?: string;
  carrierPrice?: number;
  actualPrice?: number;
  currency?: string;
  paymentStatus?: string;
  labelUrl?: string | null;
  isMultiLeg?: boolean;
  createdAt?: string;
  updatedAt?: string;
  pickupAddress?: Record<string, unknown>;
  dropoffAddress?: Record<string, unknown>;
  /** Narrowed — credentials are stripped in the API layer. */
  carrier?: { id: string; name: string; slug?: string };
}

/** Success response from `confirm-arrival`. */
export interface ConfirmArrivalResponse {
  shipmentId: string;
  shipmentStatus: string;
  message: string;
}

/** Success response from `create-leg-two`. */
export interface CreateLegTwoResponse {
  shipmentId: string;
  shipmentStatus: string;
  leg?: ShipmentLeg;
  message: string;
}

/**
 * The 409 the server returns when leg 2's live rate exceeds what the customer
 * was quoted by more than 10%.
 *
 * This is a decision, not a failure: the customer paid a combined price
 * possibly days earlier, and absorbing the difference silently turns margin
 * into a loss nobody sees. Both figures are shown and ops chooses.
 */
export interface RepriceDetails {
  message: string;
  quotedPrice: number;
  livePrice: number;
  resolution: string;
}
