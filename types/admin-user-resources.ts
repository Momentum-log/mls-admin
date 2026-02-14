/**
 * Types for user-scoped resource endpoints.
 * These match the actual response shapes from:
 * - GET /api/admin/shipments?userId=...
 * - GET /api/admin/leads?userId=...
 *
 * The API wraps results in a `data` array (not `shipments`/`leads`).
 */

// ─── Shipments ───────────────────────────────────────────────────────────────

/** Address shape returned by the admin shipment endpoint. */
export interface AdminShipmentAddress {
  city: string;
  postalCode: string;
  countryCode: string;
  residential: boolean;
  streetLines: string[];
  stateOrProvinceCode: string;
  contact?: {
    personName: string;
    companyName?: string;
    phoneNumber?: string;
  };
}

/** A single shipment returned by `GET /api/admin/shipments`. */
export interface AdminShipment {
  id: string;
  customTrackingNumber: string;
  carrierTrackingNumber?: string;
  pickupAddress: AdminShipmentAddress;
  dropoffAddress: AdminShipmentAddress;
  weight: { units: string; value: number };
  dimensions: { units: string; width: number; height: number; length: number };
  carrierPrice: number;
  actualPrice: number;
  serviceType: string;
  serviceName: string;
  currency: string;
  paymentStatus: string;
  shipmentStatus: string;
  labelUrl?: string;
  manualOverride: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    userCode: string;
  };
  carrier: {
    name: string;
  };
}

/** Paginated response from `GET /api/admin/shipments`. */
export interface AdminShipmentListResponse {
  data: AdminShipment[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ─── Leads / Estimates ───────────────────────────────────────────────────────

/** Location shape returned by the admin leads endpoint. */
export interface AdminLeadLocation {
  city: string;
  postalCode: string;
  countryCode: string;
  residential?: boolean;
  streetLines: string[];
  stateOrProvinceCode: string;
}

/** A single rate from an estimate. */
export interface AdminLeadRate {
  carrier: string;
  currency: string;
  actualPrice: number;
  carrierPrice: number;
  serviceName: string;
  serviceType: string;
  deliveryDescription?: string;
  warnings?: string[];
}

/** A single lead (estimate) returned by `GET /api/admin/leads`. */
export interface AdminLead {
  id: string;
  pickupLocation: AdminLeadLocation;
  dropoffLocation: AdminLeadLocation;
  weight: { units: string; value: number };
  dimensions: { units: string; width: number; height: number; length: number };
  rates: AdminLeadRate[];
  actualPrice: number | null;
  errors: string | null;
  email: string | null;
  phone: string | null;
  fullPayload: unknown;
  fullResponse: unknown;
  converted: boolean;
  userId: string | null;
  guestId: string | null;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    userCode: string;
  };
}

/** Paginated response from `GET /api/admin/leads`. */
export interface AdminLeadListResponse {
  data: AdminLead[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
