"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useShipments } from "@/hooks/shipments/use-shipments";
import { useUserLeads } from "@/hooks/leads/use-leads";
import { useDebounce } from "@/hooks/use-debounce";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Search, Truck } from "lucide-react";
import CopyButton from "@/components/ui/copy-button";
import { BypassPaymentModal } from "@/components/shipments/bypass-payment-modal";
import { OverrideStatusModal } from "@/components/shipments/override-status-modal";
import ShipmentDetailSheet from "@/components/shipments/shipment-detail-sheet";
import type { AdminShipment } from "@/types/admin-user-resources";
import { formatDate } from "@/utils/format-date";
import { findEstimateForShipment } from "@/utils/estimate-shipment-correlation";

const PAGE_SIZE = 10;

/**
 * Main Shipments dashboard page.
 * Lists all shipments across the system with filtering.
 */
export default function ShipmentsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  // Detail Sheet State
  const [selectedShipment, setSelectedShipment] =
    useState<AdminShipment | null>(null);

  // Modals state (for legacy actions if still needed, but Detail Sheet is preferred now)
  const [bypassModalOpen, setBypassModalOpen] = useState(false);
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [modalShipment, setModalShipment] = useState<AdminShipment | null>(
    null,
  );

  const { data: responseData, isLoading } = useShipments({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch,
  });

  /**
   * Fetch leads for the selected shipment to show correlation.
   * Since we're in a global list, we fetch on-demand for the selected user.
   */
  const { data: leadsData } = useUserLeads({
    userId: selectedShipment?.user.id ?? "",
    page: 1,
    limit: 100,
  });

  const linkedEstimate = useMemo(
    () =>
      selectedShipment && leadsData?.data
        ? findEstimateForShipment(selectedShipment, leadsData.data)
        : null,
    [selectedShipment, leadsData],
  );

  const shipments = responseData?.data ?? [];
  const pagination = responseData?.pagination;

  // Badge variants
  const getPaymentVariant = (status: string) => {
    switch (status) {
      case "PAID":
        return "default";
      case "PENDING":
        return "secondary";
      case "FAILED":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Shipments</h2>
          <p className="text-muted-foreground">
            Manage all customer shipments and tracking.
          </p>
        </div>
        <Link href="/dashboard/shipments/new">
          <Button className="bg-brand-blue hover:bg-brand-blue/90">
            <Plus className="mr-2 h-4 w-4" />
            Create Shipment
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tracking, user name, email, or code..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[180px]">Tracking #</TableHead>
              <TableHead>User / Customer</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
                    <p className="text-sm text-muted-foreground">
                      Loading shipments...
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : shipments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <Truck className="h-10 w-10 opacity-20" />
                    <p>No shipments found matching your criteria.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              shipments.map((shipment) => (
                <TableRow
                  key={shipment.id}
                  className="cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => setSelectedShipment(shipment)}
                >
                  <TableCell>
                    <div
                      className="flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="font-mono text-sm font-medium">
                        {shipment.customTrackingNumber}
                      </span>
                      <CopyButton
                        text={shipment.customTrackingNumber}
                        tooltipText="Copy tracking #"
                        className="h-6 w-6"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">
                        {shipment.user.name}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">
                        {shipment.user.userCode}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs">
                      {shipment.pickupAddress.city},{" "}
                      {shipment.pickupAddress.countryCode} →{" "}
                      {shipment.dropoffAddress.city},{" "}
                      {shipment.dropoffAddress.countryCode}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs font-semibold">
                      {shipment.shipmentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={getPaymentVariant(shipment.paymentStatus) as any}
                      className="text-xs font-semibold"
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

      <div className="flex items-center justify-between px-2">
        <p className="text-sm text-muted-foreground">
          Showing page {page} of {pagination?.totalPages ?? 1} (
          {pagination?.total ?? 0} total)
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

      {/* Modals for actions if provided in future context menus */}
      {modalShipment && (
        <>
          <BypassPaymentModal
            shipmentId={modalShipment.id}
            isOpen={bypassModalOpen}
            onClose={() => setBypassModalOpen(false)}
          />
          <OverrideStatusModal
            shipmentId={modalShipment.id}
            currentStatus={modalShipment.shipmentStatus}
            currentSync={modalShipment.trackingSyncEnabled}
            isOpen={overrideModalOpen}
            onClose={() => setOverrideModalOpen(false)}
          />
        </>
      )}
    </div>
  );
}
