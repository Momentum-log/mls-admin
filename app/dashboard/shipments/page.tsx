"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  useShipments,
  useDeleteShipment,
  useBulkDeleteShipments,
} from "@/hooks/shipments/use-shipments";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Loader2,
  Plus,
  Search,
  Truck,
  MoreHorizontal,
  FileText,
  Trash2,
  Copy,
} from "lucide-react";
import CopyButton from "@/components/ui/copy-button";
import ShipmentDetailSheet from "@/components/shipments/shipment-detail-sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { BulkDeleteBar } from "@/components/admin/bulk-delete-bar";
import type { AdminShipment } from "@/types/admin-user-resources";
import { formatDateTime } from "@/utils/format-date";
import { findEstimateForShipment } from "@/utils/estimate-shipment-correlation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getPaymentStatusVariant,
  getShipmentStatusMeta,
  getShipmentStatusOptions,
} from "@/lib/shipment-status";
export default function ShipmentsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [limit, setLimit] = useState(20);
  const [status, setStatus] = useState<string>("ALL");

  // Detail Sheet State
  const [selectedShipment, setSelectedShipment] =
    useState<AdminShipment | null>(null);

  const { data: responseData, isLoading } = useShipments({
    page,
    limit,
    search: debouncedSearch,
    status: status === "ALL" ? undefined : status,
  });

  const shipments = responseData?.data ?? [];
  const pagination = responseData?.pagination;

  const { mutate: deleteShipment, isPending: isDeleting } = useDeleteShipment();
  const { mutate: bulkDelete, isPending: isBulkDeleting } =
    useBulkDeleteShipments();

  const [shipmentToDelete, setShipmentToDelete] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkDelete, setShowBulkDelete] = useState(false);

  // Selection Logic
  const allIds = shipments.map((s) => s.id);
  const isAllSelected =
    shipments.length > 0 && allIds.every((id) => selectedIds.includes(id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds((prev) => prev.filter((id) => !allIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...allIds])));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleBulkDelete = (force: boolean) => {
    bulkDelete({ ids: selectedIds, force });
    setShowBulkDelete(false);
    setSelectedIds([]);
  };

  const handleSingleDelete = (force: boolean) => {
    if (shipmentToDelete) {
      // If using force, we need to call delete with object (if hook updated) or update hook usage
      // Current usage: deleteShipment(id, force) via updated hook
      deleteShipment({ id: shipmentToDelete, force });
      setShipmentToDelete(null);
    }
  };

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Shipments</h2>
          <p className="text-muted-foreground">
            Manage all customer shipments and tracking.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/shipments/new">
            <Button className="bg-brand-blue hover:bg-brand-blue/90">
              <Plus className="mr-2 h-4 w-4" />
              Create Shipment
            </Button>
          </Link>
        </div>
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
        <Select
          value={status}
          onValueChange={(val) => {
            setStatus(val);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-56">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            {getShipmentStatusOptions().map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={isAllSelected}
                  onChange={toggleSelectAll}
                  className="translate-y-[2px]"
                />
              </TableHead>
              <TableHead className="w-[180px]">Tracking #</TableHead>
              <TableHead className="w-[240px]">User / Customer</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-10"></TableHead>
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
                  className="cursor-pointer hover:bg-muted/30 transition-colors group"
                  onClick={() => setSelectedShipment(shipment)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedIds.includes(shipment.id)}
                      onChange={() => toggleSelectRow(shipment.id)}
                      className="translate-y-[2px]"
                    />
                  </TableCell>
                  <TableCell>
                    <div
                      className="flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="font-mono text-sm font-bold">
                        {shipment.customTrackingNumber}
                      </span>
                      <CopyButton
                        text={shipment.customTrackingNumber}
                        tooltipText="Copy tracking #"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm">
                        {shipment.user.name}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground font-mono">
                          {shipment.user.userCode}
                        </span>
                        <CopyButton
                          text={shipment.user.userCode}
                          className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs font-medium">
                      {shipment.pickupAddress.city},{" "}
                      {shipment.pickupAddress.countryCode} →{" "}
                      {shipment.dropoffAddress.city},{" "}
                      {shipment.dropoffAddress.countryCode}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        getShipmentStatusMeta(shipment.shipmentStatus).variant
                      }
                      className="text-xs font-black"
                    >
                      {getShipmentStatusMeta(shipment.shipmentStatus).label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={getPaymentStatusVariant(shipment.paymentStatus)}
                      className="text-xs font-black"
                    >
                      {shipment.paymentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground font-medium">
                    {formatDateTime(shipment.createdAt)}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => setSelectedShipment(shipment)}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            navigator.clipboard.writeText(
                              shipment.customTrackingNumber,
                            );
                          }}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Tracking #
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            navigator.clipboard.writeText(
                              shipment.user.userCode,
                            );
                          }}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Copy User Code
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setShipmentToDelete(shipment.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Shipment
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground">
            Showing page {page} of {pagination?.totalPages ?? 1} (
            {pagination?.total ?? 0} total)
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              Rows per page:
            </span>
            <Select
              value={limit.toString()}
              onValueChange={(val) => {
                setLimit(parseInt(val));
                setPage(1);
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={limit.toString()} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="30">30</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
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

      {/* Detail Sheet (modals for actions are managed internally) */}
      <ShipmentDetailSheet
        shipment={selectedShipment}
        open={!!selectedShipment}
        onOpenChange={(open) => !open && setSelectedShipment(null)}
        linkedEstimate={linkedEstimate}
      />

      <ConfirmDialog
        open={!!shipmentToDelete}
        onOpenChange={(open) => !open && setShipmentToDelete(null)}
        title="Delete Shipment?"
        description="This will permanently remove this shipment. Use force delete to cascade remove linked records."
        resourceName="Shipment"
        destructive
        enableForce
        onConfirm={handleSingleDelete}
        isLoading={isDeleting}
      />

      <ConfirmDialog
        open={showBulkDelete}
        onOpenChange={(open) => setShowBulkDelete(open)}
        title={`Delete ${selectedIds.length} Shipments?`}
        description={`This will permanently remove ${selectedIds.length} selected shipments. Advanced deletion will bypass safety checks.`}
        resourceName="Shipments"
        destructive
        enableForce
        onConfirm={handleBulkDelete}
        isLoading={isBulkDeleting}
      />

      <BulkDeleteBar
        selectedCount={selectedIds.length}
        resourceName="Shipments"
        onDelete={() => setShowBulkDelete(true)}
        onClear={() => setSelectedIds([])}
      />
    </div>
  );
}
