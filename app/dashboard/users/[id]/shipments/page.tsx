"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUsers } from "@/hooks/users/use-users";
import { useUserShipments } from "@/hooks/shipments/use-shipments";
import { useUserLeads } from "@/hooks/leads/use-leads";
import { findEstimateForShipment } from "@/utils/estimate-shipment-correlation";
import { formatDate } from "@/utils/format-date";
import UserInfoHeader from "@/components/users/user-info-header";
import CopyButton from "@/components/ui/copy-button";
import ShipmentDetailSheet from "@/components/shipments/shipment-detail-sheet";
import type { AdminShipment } from "@/types/admin-user-resources";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, Package } from "lucide-react";
import {
  getPaymentStatusVariant,
  getShipmentStatusMeta,
} from "@/lib/shipment-status";

/** Items per page for the paginated table. */
const PAGE_SIZE = 10;

/**
 * "See All" page for a user's shipments.
 * Route: /dashboard/users/[id]/shipments
 *
 * Displays a compact user info header at the top and a paginated
 * table of all shipments belonging to that user.
 */
export default function UserShipmentsPage() {
  const params = useParams();
  const router = useRouter();
  const userCode = params.id as string;
  const [page, setPage] = useState(1);
  const [selectedShipment, setSelectedShipment] =
    useState<AdminShipment | null>(null);

  const { data: usersData, isLoading: userLoading } = useUsers({
    search: userCode,
    limit: 1,
  });
  const user = usersData?.users.find((u) => u.userCode === userCode) || null;

  const { data: responseData, isLoading } = useUserShipments({
    userId: user?.id ?? "",
    page,
    limit: PAGE_SIZE,
  });

  /** Fetch all estimates for this user (for correlation lookups). */
  const { data: estimatesData } = useUserLeads({
    userId: user?.id ?? "",
    page: 1,
    limit: 100,
  });

  /** Resolved shipments from the `data` wrapper. */
  const shipments = responseData?.data ?? [];
  const pagination = responseData?.pagination;
  const allEstimates = estimatesData?.data ?? [];

  /**
   * Compute correlation for the selected shipment.
   *
   * Must stay above the early returns below — React counts hooks per render,
   * so a `useMemo` placed after them runs on the loaded render but not the
   * loading one, and the mismatch throws "Rendered more hooks than during the
   * previous render" the moment the user query resolves.
   */
  const linkedEstimate = useMemo(
    () =>
      selectedShipment
        ? findEstimateForShipment(selectedShipment, allEstimates)
        : null,
    [selectedShipment, allEstimates],
  );

  if (userLoading) {
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
      {/* Back + Title */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h2 className="text-2xl font-bold tracking-tight">User Shipments</h2>
      </div>

      {/* Compact user header */}
      <UserInfoHeader user={user} />

      {/* Shipments table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tracking #</TableHead>
              <TableHead>Carrier</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                </TableCell>
              </TableRow>
            ) : shipments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Package className="h-8 w-8 mb-2" />
                    <p className="text-sm">No shipments found for this user.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              shipments.map((shipment) => (
                <TableRow
                  key={shipment.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedShipment(shipment)}
                >
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-sm">
                        {shipment.customTrackingNumber}
                      </span>
                      <CopyButton
                        text={shipment.customTrackingNumber}
                        tooltipText="Copy tracking #"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {shipment.carrier?.name ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        getShipmentStatusMeta(shipment.shipmentStatus).variant
                      }
                    >
                      {getShipmentStatusMeta(shipment.shipmentStatus).label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={getPaymentStatusVariant(shipment.paymentStatus)}
                    >
                      {shipment.paymentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(shipment.createdAt)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between py-2">
        <p className="text-sm text-muted-foreground">
          Page {page}
          {pagination?.totalPages ? ` of ${pagination.totalPages}` : ""}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || isLoading}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= (pagination?.totalPages ?? 1) || isLoading}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Detail Sheet */}
      <ShipmentDetailSheet
        shipment={selectedShipment}
        open={!!selectedShipment}
        onOpenChange={(open) => !open && setSelectedShipment(null)}
        linkedEstimate={linkedEstimate}
      />
    </div>
  );
}
