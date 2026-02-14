"use client";

import { useDashboardStats } from "@/hooks/dashboard/use-dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Package,
  DollarSign,
  Clock,
  TrendingUp,
  Loader2,
} from "lucide-react";

/**
 * Formats a single currency amount with its proper locale and symbol.
 *
 * @param currency - ISO currency code (e.g., "EUR", "PLN").
 * @param amount - The monetary amount.
 * @returns Formatted string (e.g., "€375.04" or "2 344,09 zł").
 */
function formatCurrencyAmount(currency: string, amount: number): string {
  const locale = currency === "PLN" ? "pl-PL" : "en-IE";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
}

/**
 * Dashboard overview page displaying key statistics fetched from the API.
 * Revenue is displayed per currency with each on its own line.
 */
export default function DashboardPage() {
  const { data: stats, isLoading } = useDashboardStats();

  const revenueEntries = stats ? Object.entries(stats.revenue) : [];

  const cards = [
    {
      title: "Total Users",
      value: stats?.totalUsers?.toLocaleString("pl-PL") ?? "—",
      icon: Users,
    },
    {
      title: "Total Shipments",
      value: stats?.totalShipments?.toLocaleString("pl-PL") ?? "—",
      icon: Package,
    },
    {
      title: "In Transit",
      value: stats?.inTransit?.toLocaleString("pl-PL") ?? "—",
      icon: TrendingUp,
    },
    {
      title: "Pending Payments",
      value: stats?.pendingPayments?.toLocaleString("pl-PL") ?? "—",
      icon: Clock,
    },
  ];

  return (
    <div>
      <h2 className="text-3xl font-bold tracking-tight mb-4">Dashboard</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {/* Revenue card — shows each currency on its own line */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : revenueEntries.length === 0 ? (
              <div className="text-2xl font-bold">—</div>
            ) : (
              <div className="space-y-1">
                {revenueEntries.map(([currency, amount]) => (
                  <div key={currency} className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">
                      {formatCurrencyAmount(currency, amount)}
                    </span>
                    <span className="text-xs text-muted-foreground uppercase">
                      {currency}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Other stat cards */}
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              ) : (
                <div className="text-2xl font-bold">{card.value}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
