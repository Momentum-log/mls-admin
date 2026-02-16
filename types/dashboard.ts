/**
 * Dashboard statistics response from GET /api/admin/dashboard/stats.
 * Revenue is returned as a map of currency codes to amounts,
 * since shipments can be priced in different currencies (EUR, PLN, etc.).
 */
export interface DashboardStats {
  totalUsers: number;
  totalShipments: number;
  revenue: Record<string, number>;
  pendingPayments: number;
  inTransit: number;
  totalLeads: number;
  recentSignupsCount: number;
}
