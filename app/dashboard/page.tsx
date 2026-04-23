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
  Copy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import CopyButton from "@/components/ui/copy-button";
import { formatDateTime } from "@/utils/format-date";
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

  const revenueEntries = stats
    ? Object.entries(stats.revenue).filter(([curr]) => curr !== "LMP")
    : [];

  const statCards = [
    {
      title: "Revenue",
      entries: revenueEntries,
      icon: DollarSign,
      color: "bg-brand-blue shadow-brand-blue/20",
      textColor: "text-white",
      iconColor: "text-white/20",
      description: "Total generated revenue",
      isPremium: true,
      isRevenue: true,
    },
    {
      title: "Total Users",
      value: stats?.totalUsers?.toLocaleString("pl-PL") ?? "—",
      icon: Users,
      color: "bg-brand-yellow shadow-brand-yellow/20",
      textColor: "text-white",
      iconColor: "text-white/20",
      description: "Total registered customers",
      isPremium: true,
    },
    {
      title: "Total Shipments",
      value: stats?.totalShipments?.toLocaleString("pl-PL") ?? "—",
      icon: Package,
      color: "bg-accent-dark shadow-accent-dark/20",
      textColor: "text-white",
      iconColor: "text-white/20",
      description: "Total shipments created",
      isPremium: true,
    },
    {
      title: "Marketing Leads",
      value: stats?.leads?.toLocaleString("pl-PL") ?? "—",
      icon: Mail,
      color: "bg-accent-light shadow-accent-light/20",
      textColor: "text-white",
      iconColor: "text-white/20",
      description: "Active shipping estimates",
      isPremium: true,
    },
    {
      title: "Active Shipments",
      value: stats?.activeShipments?.toLocaleString("pl-PL") ?? "—",
      icon: TrendingUp,
      color: "bg-brand-blue shadow-brand-blue/20",
      textColor: "text-white",
      iconColor: "text-white/20",
      description: "Shipments currently moving",
      isPremium: true,
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
              className={cn(
                "overflow-hidden transition-all duration-300 relative min-h-35 flex flex-col justify-between group",
                card.isPremium
                  ? `${card.color} ${card.textColor} border-none shadow-xl hover:scale-[1.02] z-10`
                  : "bg-white shadow-sm hover:shadow-md border-border hover:border-brand-blue/30",
              )}
            >
              <card.icon
                className={cn(
                  "absolute -right-4 -bottom-4 h-24 w-24 opacity-10 rotate-12 transition-transform group-hover:rotate-0",
                  card.iconColor,
                )}
              />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 relative z-10">
                <CardTitle
                  className={cn(
                    "text-xs font-bold uppercase tracking-wider",
                    card.isPremium ? "text-white/80" : "text-muted-foreground",
                  )}
                >
                  {card.title}
                </CardTitle>
                <div
                  className={cn(
                    "p-2 rounded-lg",
                    card.isPremium ? "bg-white/10" : "bg-muted",
                  )}
                >
                  <card.icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10 pb-4">
                {statsLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin opacity-50" />
                ) : (
                  <>
                    <div className="relative z-10">
                      {card.isRevenue ? (
                        <div className="flex flex-col gap-0.5">
                          {card.entries && card.entries.length > 0 ? (
                            card.entries.map(([curr, amt]) => (
                              <div
                                key={curr}
                                className="text-xl font-black tracking-tight leading-none"
                              >
                                {formatCurrencyAmount(curr, amt)}
                              </div>
                            ))
                          ) : (
                            <div className="text-2xl font-black tracking-tight">
                              —
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-2xl font-black tracking-tight">
                          {card.value}
                        </div>
                      )}
                    </div>
                    <p
                      className={cn(
                        "text-[10px] mt-1 font-medium relative z-10",
                        card.isPremium
                          ? "text-white/60"
                          : "text-muted-foreground",
                      )}
                    >
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
      <div className="space-y-4">
        <h3 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Clock className="h-5 w-5 text-brand-blue" />
          Recent Activity & Operations
        </h3>
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3 items-start">
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
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hidden md:flex text-muted-foreground hover:text-brand-blue"
                    asChild
                  >
                    <Link
                      href="/dashboard/shipments"
                      className="flex items-center gap-1 text-xs"
                    >
                      See All
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    asChild
                  >
                    <Link href="/dashboard/shipments">
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
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
                        className="group flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-all border border-transparent hover:border-border"
                      >
                        <div className="h-10 w-10 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue shrink-0">
                          <Package className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <p className="text-sm font-bold truncate font-mono">
                              {shipment.customTrackingNumber}
                            </p>
                            <CopyButton
                              text={shipment.customTrackingNumber}
                              className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {shipment.user.name} ({shipment.user.userCode})
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-black text-brand-blue">
                            {formatCurrencyAmount(
                              shipment.currency,
                              shipment.actualPrice,
                            )}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-medium">
                            {formatDateTime(shipment.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full mt-2" asChild>
                      <Link href="/dashboard/shipments">
                        View All Shipments
                      </Link>
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
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hidden md:flex text-muted-foreground hover:text-brand-yellow"
                    asChild
                  >
                    <Link
                      href="/dashboard/leads"
                      className="flex items-center gap-1 text-xs"
                    >
                      See All
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    asChild
                  >
                    <Link href="/dashboard/leads">
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
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
                          <p className="text-sm font-black truncate text-foreground">
                            {lead.user
                              ? lead.user.name
                              : lead.email || "Guest User"}
                          </p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <p className="text-[10px] text-muted-foreground font-mono bg-muted/50 px-1 rounded truncate max-w-30">
                              {lead.user
                                ? lead.user.userCode
                                : lead.email ||
                                  (lead.guestId
                                    ? `G: ${lead.guestId.slice(0, 8)}`
                                    : "Anon")}
                            </p>
                            {(lead.user?.userCode || lead.email) && (
                              <CopyButton
                                text={lead.user?.userCode || lead.email || ""}
                                className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity"
                              />
                            )}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-bold text-brand-blue uppercase tracking-tighter mb-0.5">
                            Route
                          </p>
                          <p className="text-xs text-muted-foreground truncate font-medium">
                            {lead.pickupLocation.city},{" "}
                            {lead.pickupLocation.countryCode} →{" "}
                            {lead.dropoffLocation.city},{" "}
                            {lead.dropoffLocation.countryCode}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span
                            className={cn(
                              "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase",
                              lead.converted
                                ? "bg-green-100 text-green-700"
                                : "bg-brand-yellow/10 text-brand-yellow",
                            )}
                          >
                            {lead.converted ? "Converted" : "New"}
                          </span>
                          <p className="text-[10px] text-muted-foreground mt-1 font-medium">
                            {formatDateTime(lead.createdAt)}
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
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hidden md:flex text-muted-foreground hover:text-accent-dark"
                    asChild
                  >
                    <Link
                      href="/dashboard/users"
                      className="flex items-center gap-1 text-xs"
                    >
                      See All
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    asChild
                  >
                    <Link href="/dashboard/users">
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
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
                          <p className="text-sm font-bold truncate">
                            {user.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {user.email}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-black text-accent-dark">
                            {user.userCode}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-medium">
                            {formatDateTime(user.createdAt)}
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
      </div>
    </motion.div>
  );
}
