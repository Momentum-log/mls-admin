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

export interface CreateProxyShipmentPayload {
  targetUserId: string;
  carrierName: string;
  pickupAddress: Address;
  dropoffAddress: Address;
  package: Package;
  rate: Rate;
}

export interface BypassPaymentPayload {
  manualTransactionId: string;
  notes?: string;
}

export interface OverrideStatusPayload {
  status: string;
  manualOverride: boolean;
  trackingSyncEnabled: boolean;
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
