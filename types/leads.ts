export interface Lead {
  id: string;
  userEmail?: string;
  userPhone?: string;
  origin: string;
  destination: string;
  weight: number;
  dimensions: string;
  calculatedPrice: number;
  /** Whether this estimate was later converted into a shipment. */
  converted?: boolean;
  createdAt: string;
}

export interface LeadListResponse {
  leads: Lead[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface LeadFilter {
  page?: number;
  limit?: number;
  search?: string;
}

/**
 * Filter params for fetching leads (estimates) scoped to a specific user.
 * Used with `GET /api/admin/leads?userId={uuid}`.
 *
 * @param userId - Required user UUID to filter by.
 * @param page - Page number (default: 1).
 * @param limit - Items per page (default: 10).
 * @param search - Search by email, phone, or name.
 * @param converted - Filter by conversion status.
 * @param startDate - ISO date string for range start.
 * @param endDate - ISO date string for range end.
 */
export interface UserLeadFilter {
  userId: string;
  page?: number;
  limit?: number;
  search?: string;
  converted?: string;
  startDate?: string;
  endDate?: string;
}
