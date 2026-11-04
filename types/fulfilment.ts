/** Manual fulfilment (server W6): the queue, the upload and the switches. */

export interface FulfilmentSettings {
  /** Shown to customers in the "label being prepared" email. */
  businessHours: string | null;
}

export interface HandoverPreference {
  method: "PICKUP" | "DROPOFF";
  pickupDate?: string;
  readyTime?: string;
  closeTime?: string;
  notes?: string;
}

export interface QueueAddress {
  streetLines?: string[];
  city?: string;
  postalCode?: string;
  stateOrProvinceCode?: string;
  countryCode?: string;
  contact?: {
    personName?: string;
    companyName?: string;
    phoneNumber?: string;
    emailAddress?: string;
  };
}

export interface QueuePackage {
  weight?: { value: number; units?: string };
  dimensions?: { length: number; width: number; height: number; units?: string };
}

export interface FulfilmentQueueShipment {
  id: string;
  customTrackingNumber: string;
  createdAt: string;
  paidAt: string;
  hoursWaiting: number;
  pickupAddress: QueueAddress;
  dropoffAddress: QueueAddress;
  packages: QueuePackage[] | null;
  customs: Record<string, unknown> | null;
  serviceType: string;
  serviceName: string;
  carrierPrice: number;
  actualPrice: number;
  currency: string;
  isMultiLeg: boolean;
  customerCollectionAddress: QueueAddress | null;
  handoverPreference: HandoverPreference | null;
  paidBy: "STAFF" | "STRIPE" | "PAYU" | null;
  carrier: { id: string; name: string; slug: string };
  user: { id: string; name: string; email: string; phone: string | null; userCode: string };
}

export interface FulfilmentQueue {
  count: number;
  shipments: FulfilmentQueueShipment[];
}

export interface ManualLabelPayload {
  /**
   * At most one of `labelPdfBase64` (an upload) and `labelUrl` (a link).
   * Required for carriers with a carrier system; optional for Momentum.
   */
  labelPdfBase64?: string;
  labelUrl?: string;
  /** Required except for Momentum, where the MLS number is used. */
  carrierTrackingNumber?: string;
  /** The carrier's own tracking page, shown to the customer. */
  carrierTrackingUrl?: string;
  handover: "PICKUP" | "DROPOFF";
  pickupDate?: string;
  pickupReadyTime?: string;
  pickupCloseTime?: string;
  pickupConfirmationCode?: string;
  serviceName?: string;
  notes?: string;
}

export interface ManualLabelResponse {
  message: string;
  replaced: boolean;
  shipmentStatus: string;
  carrierTrackingNumber: string;
}
