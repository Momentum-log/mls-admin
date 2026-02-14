"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useUserByCode } from "@/hooks/users/use-users";
import { useUserShipments } from "@/hooks/shipments/use-shipments";
import { useUserLeads } from "@/hooks/leads/use-leads";
import { useVerifyUser } from "@/hooks/users/use-users";
import { formatDate, formatRelativeTime } from "@/utils/format-date";
import {
  findEstimateForShipment,
  findShipmentForEstimate,
} from "@/utils/estimate-shipment-correlation";
import CopyButton from "@/components/ui/copy-button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import ConversionBadge from "@/components/ui/conversion-badge";
import ShipmentDetailSheet from "@/components/shipments/shipment-detail-sheet";
import EstimateDetailSheet from "@/components/shipments/estimate-detail-sheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { AdminShipment, AdminLead } from "@/types/admin-user-resources";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Mail,
  User as UserIcon,
  Calendar,
  Clock,
  LogIn,
  Phone,
  Loader2,
  Hash,
  BadgeCheck,
  BadgeX,
  Package,
  FileText,
  Truck,
} from "lucide-react";

/**
 * Returns the appropriate badge variant based on user status.
 */
function getStatusVariant(
  status: string,
): "default" | "destructive" | "secondary" | "outline" {
  switch (status) {
    case "ACTIVE":
      return "default";
    case "FLAGGED":
      return "secondary";
    case "WARNED":
      return "outline";
    case "BANNED":
      return "destructive";
    default:
      return "default";
  }
}

/**
 * Formats a city-to-city route string from shipment pickup/dropoff addresses.
 */
function formatRoute(
  pickup: { city: string; countryCode: string },
  dropoff: { city: string; countryCode: string },
): string {
  return `${pickup.city}, ${pickup.countryCode} → ${dropoff.city}, ${dropoff.countryCode}`;
}

/**
 * User details page. Identified by userCode in the URL.
 * Displays a single card with profile info, verification status,
 * and moderation controls. Below the profile card, shows the
 * five most recent shipments and shipping estimates for the user.
 */
export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userCode = params.id as string;

  const { data: user, isLoading } = useUserByCode(userCode);
  const { mutate: verifyUser } = useVerifyUser();

  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [selectedShipment, setSelectedShipment] =
    useState<AdminShipment | null>(null);
  const [selectedEstimate, setSelectedEstimate] = useState<AdminLead | null>(
    null,
  );

  /** Fetch the five most recent shipments once we know the user id. */
  const { data: shipmentsData, isLoading: shipmentsLoading } = useUserShipments(
    {
      userId: user?.id ?? "",
      page: 1,
      limit: 5,
    },
  );

  /** Fetch the five most recent leads (estimates) once we know the user id. */
  const { data: leadsData, isLoading: leadsLoading } = useUserLeads({
    userId: user?.id ?? "",
    page: 1,
    limit: 5,
  });

  const handleVerify = () => {
    if (!user) return;
    verifyUser(user.id);
    setShowVerifyDialog(false);
  };

  /** Resolved shipment & lead arrays from the `data` wrapper. */
  const shipments = shipmentsData?.data ?? [];
  const leads = leadsData?.data ?? [];

  /** Compute correlation for the currently selected shipment or estimate. */
  const linkedEstimate = useMemo(
    () =>
      selectedShipment
        ? findEstimateForShipment(selectedShipment, leads)
        : null,
    [selectedShipment, leads],
  );

  const linkedShipment = useMemo(
    () =>
      selectedEstimate
        ? findShipmentForEstimate(selectedEstimate, shipments)
        : null,
    [selectedEstimate, shipments],
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <p className="text-center text-muted-foreground">User not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">{user.name}</h2>
          <Badge variant={getStatusVariant(user.status)}>{user.status}</Badge>
        </div>
        <div className="flex items-center gap-2">
          {!user.is_verified && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowVerifyDialog(true)}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Verify User
            </Button>
          )}
          <Button
            size="sm"
            onClick={() =>
              router.push(
                `/dashboard/shipments/new?userCode=${user.userCode || user.id}`,
              )
            }
          >
            <Package className="mr-2 h-4 w-4" />
            Create Shipment
          </Button>
        </div>
      </div>

      {/* Unified Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">User Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Left column — identity */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <UserIcon className="h-4 w-4" />
                  Name
                </div>
                <span className="text-sm font-medium">{user.name}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  Email
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{user.email}</span>
                  {user.is_verified ? (
                    <BadgeCheck className="h-4 w-4 text-green-500 shrink-0" />
                  ) : (
                    <BadgeX className="h-4 w-4 text-red-500 shrink-0" />
                  )}
                  <CopyButton text={user.email} tooltipText="Copy email" />
                </div>
              </div>

              {user.userCode && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Hash className="h-4 w-4" />
                    User Code
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-mono">{user.userCode}</span>
                    <CopyButton
                      text={user.userCode}
                      tooltipText="Copy user code"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Hash className="h-4 w-4" />
                  User ID
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-mono text-muted-foreground">
                    {user.id}
                  </span>
                  <CopyButton text={user.id} tooltipText="Copy ID" />
                </div>
              </div>
            </div>

            {/* Right column — status & activity */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Account Status
                </span>
                <Badge variant={getStatusVariant(user.status)}>
                  {user.status}
                </Badge>
              </div>

              {user.status === "BANNED" && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Ban Type
                  </span>
                  <Badge variant="destructive">{user.banType}</Badge>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Phone Verified
                </span>
                {user.is_phone_verified ? (
                  <div className="flex items-center gap-1">
                    <Phone className="h-4 w-4 text-green-500" />
                    <BadgeCheck className="h-4 w-4 text-green-500" />
                  </div>
                ) : (
                  <BadgeX className="h-4 w-4 text-red-500" />
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Joined
                </div>
                <span className="text-sm">{formatDate(user.createdAt)}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Last Active
                </div>
                <span className="text-sm text-muted-foreground">
                  {user.lastActiveAt
                    ? formatRelativeTime(user.lastActiveAt)
                    : "—"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <LogIn className="h-4 w-4" />
                  Last Login
                </div>
                <span className="text-sm text-muted-foreground">
                  {user.lastLoginAt
                    ? formatRelativeTime(user.lastLoginAt)
                    : "—"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Shipments + Recent Estimates — 2-column grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Shipments Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Truck className="h-5 w-5 text-muted-foreground" />
              Recent Shipments
            </CardTitle>
            <Link
              href={`/dashboard/users/${userCode}/shipments`}
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              See All
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            {shipmentsLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : shipments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                <Package className="h-8 w-8 mb-2" />
                <p className="text-sm">No shipments yet.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tracking #</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Carrier</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shipments.map((shipment) => (
                    <TableRow
                      key={shipment.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedShipment(shipment)}
                    >
                      <TableCell>
                        <span className="font-mono text-xs">
                          {shipment.customTrackingNumber}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {shipment.shipmentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {shipment.carrier?.name ?? "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(shipment.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Recent Shipping Estimates Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              Recent Estimates
            </CardTitle>
            <Link
              href={`/dashboard/users/${userCode}/estimates`}
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              See All
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            {leadsLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : leads.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                <FileText className="h-8 w-8 mb-2" />
                <p className="text-sm">No shipping estimates yet.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Route</TableHead>
                    <TableHead>Weight</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => (
                    <TableRow
                      key={lead.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedEstimate(lead)}
                    >
                      <TableCell>
                        <span className="text-xs">
                          {formatRoute(
                            lead.pickupLocation,
                            lead.dropoffLocation,
                          )}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">
                        {lead.weight.value} {lead.weight.units}
                      </TableCell>
                      <TableCell>
                        <ConversionBadge converted={lead.converted ?? false} />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(lead.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Verify Confirmation Dialog */}
      <ConfirmDialog
        open={showVerifyDialog}
        onOpenChange={setShowVerifyDialog}
        title="Manually Verify User"
        description={`This will mark ${user.name}'s email as verified. This action cannot be undone.`}
        confirmLabel="Verify"
        onConfirm={handleVerify}
      />

      {/* Detail Sheets */}
      <ShipmentDetailSheet
        shipment={selectedShipment}
        open={!!selectedShipment}
        onOpenChange={(open) => !open && setSelectedShipment(null)}
        linkedEstimate={linkedEstimate}
      />
      <EstimateDetailSheet
        estimate={selectedEstimate}
        open={!!selectedEstimate}
        onOpenChange={(open) => !open && setSelectedEstimate(null)}
        linkedShipment={linkedShipment}
      />
    </div>
  );
}
