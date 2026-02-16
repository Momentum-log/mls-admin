"use client";

import { useDashboardStats } from "@/hooks/dashboard/use-dashboard";
import { useShipments } from "@/hooks/shipments/use-shipments";
import { useLeads } from "@/hooks/leads/use-leads";
import { useUsers } from "@/hooks/users/use-users";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Package,
  DollarSign,
  Clock,
  TrendingUp,
  Loader2,
  ArrowRight,
  TrendingDown,
  Mail,
  UserPlus,
  Truck,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { format } from "date-fns";

/**
 * Formats a single currency amount with its proper locale and symbol.
 */
function formatCurrencyAmount(currency: string, amount: number): string {
  const locale = currency === "PLN" ? "pl-PL" : "en-IE";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 },
};

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();

  // Fetch recent data
  const { data: recentShipmentsData, isLoading: shipmentsLoading } =
    useShipments({
      page: 1,
      limit: 5,
    });
  const { data: recentLeadsData, isLoading: leadsLoading } = useLeads({
    page: 1,
    limit: 5,
  });
  const { data: recentUsersData, isLoading: usersLoading } = useUsers({
    page: 1,
    limit: 5,
  });

  const revenueEntries = stats ? Object.entries(stats.revenue) : [];

  const statCards = [
    {
      title: "Revenue",
      value:
        revenueEntries.length > 0
          ? revenueEntries
              .map(([curr, amt]) => formatCurrencyAmount(curr, amt))
              .join(" / ")
          : "—",
      icon: DollarSign,
      color: "bg-brand-blue",
      textColor: "text-white",
      iconColor: "text-brand-blue-foreground/20",
      description: "Total generated revenue",
    },
    {
      title: "Total Users",
      value: stats?.totalUsers?.toLocaleString("pl-PL") ?? "—",
      icon: Users,
      color: "bg-brand-yellow",
      textColor: "text-black",
      iconColor: "text-black/10",
      description: "Total registered customers",
    },
    {
      title: "Total Shipments",
      value: stats?.totalShipments?.toLocaleString("pl-PL") ?? "—",
      icon: Package,
      color: "bg-accent-dark",
      textColor: "text-white",
      iconColor: "text-white/20",
      description: "Total shipments created",
    },
    {
      title: "Marketing Leads",
      value: stats?.totalLeads?.toLocaleString("pl-PL") ?? "—",
      icon: Mail,
      color: "bg-accent-light",
      textColor: "text-white",
      iconColor: "text-white/20",
      description: "Active shipping estimates",
    },
    {
      title: "In Transit",
      value: stats?.inTransit?.toLocaleString("pl-PL") ?? "—",
      icon: TrendingUp,
      color: "bg-secondary",
      textColor: "text-secondary-foreground",
      iconColor: "text-primary/20",
      description: "Shipments currently moving",
    },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Dashboard Overview
          </h2>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's what's happening today in MLS.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {statCards.map((card, idx) => (
          <motion.div key={card.title} variants={item}>
            <Card
              className={`overflow-hidden border-none shadow-lg hover:shadow-xl transition-shadow relative ${card.color} ${card.textColor}`}
            >
              <card.icon
                className={`absolute -right-2 -bottom-2 h-24 w-24 opacity-10 rotate-12 ${card.iconColor}`}
              />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium opacity-90">
                  {card.title}
                </CardTitle>
                <card.icon className="h-4 w-4 opacity-70" />
              </CardHeader>
              <CardContent className="relative z-10">
                {statsLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin opacity-50" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{card.value}</div>
                    <p className="text-[10px] mt-1 opacity-70 uppercase tracking-wider font-semibold">
                      {card.description}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity Section */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        {/* Recent Shipments */}
        <motion.div variants={item}>
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold">
                  Recent Shipments
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Latest 5 shipments created
                </p>
              </div>
              <Button variant="ghost" size="icon" asChild>
                <Link href="/dashboard/shipments">
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {shipmentsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : recentShipmentsData?.data.length === 0 ? (
                <p className="text-sm text-center text-muted-foreground py-8">
                  No recent shipments
                </p>
              ) : (
                <div className="space-y-4">
                  {recentShipmentsData?.data.map((shipment) => (
                    <div
                      key={shipment.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border"
                    >
                      <div className="h-10 w-10 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue">
                        <Package className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {shipment.customTrackingNumber}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {shipment.user.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-brand-blue">
                          {formatCurrencyAmount(
                            shipment.currency,
                            shipment.actualPrice,
                          )}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {format(new Date(shipment.createdAt), "MMM d, HH:mm")}
                        </p>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full mt-2" asChild>
                    <Link href="/dashboard/shipments">View All Shipments</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Marketing Leads */}
        <motion.div variants={item}>
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold">
                  Marketing Leads
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Recent shipping estimates
                </p>
              </div>
              <Button variant="ghost" size="icon" asChild>
                <Link href="/dashboard/leads">
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {leadsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : recentLeadsData?.data.length === 0 ? (
                <p className="text-sm text-center text-muted-foreground py-8">
                  No recent leads
                </p>
              ) : (
                <div className="space-y-4">
                  {recentLeadsData?.data.map((lead) => (
                    <div
                      key={lead.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border"
                    >
                      <div className="h-10 w-10 rounded-full bg-brand-yellow/10 flex items-center justify-center text-brand-yellow">
                        <Mail className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {lead.email || lead.user?.email || "Guest"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {lead.pickupLocation.city} →{" "}
                          {lead.dropoffLocation.city}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${lead.converted ? "bg-green-100 text-green-700" : "bg-brand-yellow/20 text-brand-yellow-foreground"}`}
                        >
                          {lead.converted ? "Converted" : "New"}
                        </span>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {format(new Date(lead.createdAt), "MMM d, HH:mm")}
                        </p>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full mt-2" asChild>
                    <Link href="/dashboard/leads">View All Leads</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent User Signups */}
        <motion.div variants={item}>
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold">
                  Recent Signups
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Latest registered users
                </p>
              </div>
              <Button variant="ghost" size="icon" asChild>
                <Link href="/dashboard/users">
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : recentUsersData?.users.length === 0 ? (
                <p className="text-sm text-center text-muted-foreground py-8">
                  No recent signups
                </p>
              ) : (
                <div className="space-y-4">
                  {recentUsersData?.users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border"
                    >
                      <div className="h-10 w-10 rounded-full bg-accent-dark/10 flex items-center justify-center text-accent-dark">
                        <UserPlus className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-accent-dark">
                          {user.userCode || "MLS-U-..."}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {format(new Date(user.createdAt), "MMM d, HH:mm")}
                        </p>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full mt-2" asChild>
                    <Link href="/dashboard/users">View All Users</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
