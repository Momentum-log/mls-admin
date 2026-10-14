/**
 * MLS collection of DHL export parcels (server: `collection.service.ts`).
 *
 * DHL eCommerce exports only leave from the hub, so MLS collects the parcel
 * from the customer, brings it to the hub, and hands it to DHL there:
 *
 *   AWAITING_MLS_COLLECTION → AT_HUB → PICKUP_SCHEDULED | AWAITING_DROPOFF → IN_TRANSIT
 */

export type CollectionFeeStatus = "PENDING_PAYMENT" | "PAID" | "WAIVED";

export interface CollectionShipment {
  id: string;
  customTrackingNumber: string;
  shipmentStatus: string;
  paymentStatus: string;
  collectionRequestedAt: string | null;
  collectedAt: string | null;
  customerCollectionAddress: CollectionAddress | null;
  pickupConfirmationCode: string | null;
  pickupLocationCode: string | null;
  dropoffCenterId: string | null;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    collectionFeeWaived: boolean;
  } | null;
  collectionFee: {
    amount: number;
    currency: string;
    status: CollectionFeeStatus;
    waivedReason: string | null;
  } | null;
}

export interface CollectionAddress {
  streetLines?: string[];
  city?: string;
  postalCode?: string;
  countryCode?: string;
  contactName?: string;
  contactPhone?: string;
}

/** A lookup that failed comes back as `{ error }` rather than failing both. */
type OrError<T> = T | { error: string };

export interface CourierAvailability {
  availableDates: string[];
  cutoffTime: string;
  accessTime: string;
  defaultReadyTime: string;
  residentialAvailable: boolean;
}

export interface ServicePoint {
  /** The carrier's own point code. Older servers do not send it. */
  id?: string;
  centerName: string;
  address: CollectionAddress;
  distanceKm: number | null;
  operatingHours: Record<string, string>;
  locationType: string;
}

export interface HubHandoffOptions {
  defaultMode: "COURIER" | "SERVICE_POINT";
  courier: OrError<CourierAvailability>;
  servicePoints: OrError<ServicePoint[]>;
}

export type HubHandoffPayload =
  | {
      mode: "COURIER";
      /** YYYY-MM-DD */
      date: string;
      /** HH:MM */
      readyTime: string;
      /** HH:MM */
      closeTime: string;
      remarks?: string;
    }
  | { mode: "SERVICE_POINT"; servicePointId: string; servicePointName?: string };
