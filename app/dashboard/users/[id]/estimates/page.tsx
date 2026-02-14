"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUserByCode } from "@/hooks/users/use-users";
import { useUserLeads } from "@/hooks/leads/use-leads";
import { useUserShipments } from "@/hooks/shipments/use-shipments";
import { findShipmentForEstimate } from "@/utils/estimate-shipment-correlation";
import { formatDate } from "@/utils/format-date";
import UserInfoHeader from "@/components/users/user-info-header";
import ConversionBadge from "@/components/ui/conversion-badge";
import EstimateDetailSheet from "@/components/shipments/estimate-detail-sheet";
import type { AdminLead } from "@/types/admin-user-resources";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, FileText } from "lucide-react";

/** Items per page for the paginated table. */
const PAGE_SIZE = 10;

/**
 * Formats a route from pickup/dropoff location objects.
 *
 * @param pickup - Pickup location with city and countryCode.
 * @param dropoff - Dropoff location with city and countryCode.
 * @returns A formatted route string, e.g. "Abuja, NG → Łódź, PL".
 */
function formatRoute(
  pickup: { city: string; countryCode: string },
  dropoff: { city: string; countryCode: string },
): string {
  return `${pickup.city}, ${pickup.countryCode} → ${dropoff.city}, ${dropoff.countryCode}`;
}

/**
 * "See All" page for a user's shipping estimates (leads).
 * Route: /dashboard/users/[id]/estimates
 *
 * Displays a compact user info header at the top and a paginated
 * table of all shipping estimates belonging to that user.
 * Each row shows the estimate's conversion status via ConversionBadge.
 */
export default function UserEstimatesPage() {
  const params = useParams();
  const router = useRouter();
  const userCode = params.id as string;
  const [page, setPage] = useState(1);
  const [selectedEstimate, setSelectedEstimate] = useState<AdminLead | null>(
    null,
  );

  const { data: user, isLoading: userLoading } = useUserByCode(userCode);

  const { data: responseData, isLoading } = useUserLeads({
    userId: user?.id ?? "",
    page,
    limit: PAGE_SIZE,
  });

  /** Fetch all shipments for this user (for correlation lookups). */
  const { data: shipmentsData } = useUserShipments({
    userId: user?.id ?? "",
    page: 1,
    limit: 100,
  });

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

  /** Resolved leads from the `data` wrapper. */
  const leads = responseData?.data ?? [];
  const pagination = responseData?.pagination;
  const allShipments = shipmentsData?.data ?? [];

  /** Compute correlation for the selected estimate. */
  const linkedShipment = useMemo(
    () =>
      selectedEstimate
        ? findShipmentForEstimate(selectedEstimate, allShipments)
        : null,
    [selectedEstimate, allShipments],
  );

  return (
    <div className="space-y-6">
      {/* Back + Title */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h2 className="text-2xl font-bold tracking-tight">
          User Shipping Estimates
        </h2>
      </div>

      {/* Compact user header */}
      <UserInfoHeader user={user} />

      {/* Estimates table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Route</TableHead>
              <TableHead>Weight</TableHead>
              <TableHead>Best Price</TableHead>
              <TableHead>Conversion</TableHead>
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
            ) : leads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <FileText className="h-8 w-8 mb-2" />
                    <p className="text-sm">
                      No shipping estimates found for this user.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              leads.map((lead) => {
                /** Pick the lowest rate for display, if available. */
                const bestRate = lead.rates?.[0];
                const priceDisplay = bestRate
                  ? `${bestRate.actualPrice} ${bestRate.currency}`
                  : "—";

                return (
                  <TableRow
                    key={lead.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedEstimate(lead)}
                  >
                    <TableCell>
                      <span className="text-sm">
                        {formatRoute(lead.pickupLocation, lead.dropoffLocation)}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">
                      {lead.weight.value} {lead.weight.units}
                    </TableCell>
                    <TableCell className="text-sm">{priceDisplay}</TableCell>
                    <TableCell>
                      <ConversionBadge converted={lead.converted ?? false} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(lead.createdAt)}
                    </TableCell>
                  </TableRow>
                );
              })
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
            disabled={!leads.length || leads.length < PAGE_SIZE || isLoading}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Detail Sheet */}
      <EstimateDetailSheet
        estimate={selectedEstimate}
        open={!!selectedEstimate}
        onOpenChange={(open) => !open && setSelectedEstimate(null)}
        linkedShipment={linkedShipment}
      />
    </div>
  );
}
