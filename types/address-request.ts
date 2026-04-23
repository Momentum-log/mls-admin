export type AddressRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface AddressPayload {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  [key: string]: unknown;
}

export interface AddressRequestUser {
  id: string;
  name?: string;
  email?: string;
  userCode?: string;
}

export interface AddressRequest {
  id: string;
  status: AddressRequestStatus;
  createdAt: string;
  reviewedAt?: string | null;
  adminNote?: string | null;
  feedback?: string | null;
  reviewNotes?: string | null;
  note?: string | null;
  rejectionReason?: string | null;
  user?: AddressRequestUser;
  newAddress?: AddressPayload;
  activeAddress?: AddressPayload | null;
  timeline?: AddressRequestTimelineEvent[];
  [key: string]: unknown;
}

export interface AddressRequestTimelineEvent {
  id?: string;
  type?: string;
  action?: string;
  status?: AddressRequestStatus;
  createdAt?: string;
  timestamp?: string;
  performedBy?: {
    id?: string;
    name?: string;
    email?: string;
  };
  actor?: {
    id?: string;
    name?: string;
    email?: string;
  };
  note?: string | null;
  feedback?: string | null;
  details?: string | null;
  [key: string]: unknown;
}

export interface AddressRequestListResponse {
  requests?: AddressRequest[];
  data?: AddressRequest[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AddressRequestListFilters {
  page?: number;
  limit?: number;
  status?: AddressRequestStatus;
}

export interface RejectAddressRequestPayload {
  feedback: string;
  notes?: string;
}

export interface ApproveAddressRequestPayload {
  notes?: string;
}
