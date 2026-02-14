"use client";

import { useState } from "react";
import Link from "next/link";
import { useShipments } from "@/hooks/shipments/use-shipments";
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
import { Loader2, MoreHorizontal, Plus, Link as LinkIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CopyButton from "@/components/ui/copy-button";
import { BypassPaymentModal } from "@/components/shipments/bypass-payment-modal";
import { OverrideStatusModal } from "@/components/shipments/override-status-modal";

export default function ShipmentsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  // Modals state
  const [bypassModalOpen, setBypassModalOpen] = useState(false);
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<any>(null);

  const debouncedSearch = useDebounce(search, 500);

  const { data, isLoading } = useShipments({
    page,
    limit: 10,
    search: debouncedSearch,
  });

  const openBypass = (shipment: any) => {
    setSelectedShipment(shipment);
    setBypassModalOpen(true);
  };

  const openOverride = (shipment: any) => {
    setSelectedShipment(shipment);
    setOverrideModalOpen(true);
  };

  // Helper for Payment Badge color
  const getPaymentColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "default"; // or green custom variant
      case "PENDING":
        return "secondary"; // yellow?
      case "FAILED":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Shipments</h2>
        <Link href="/dashboard/shipments/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Shipment
          </Button>
        </Link>
      </div>
      <div className="flex items-center space-x-2">
        <Input
          placeholder="Search tracking number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tracking #</TableHead>
              <TableHead>Carrier</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                </TableCell>
              </TableRow>
            ) : data?.shipments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No shipments found.
                </TableCell>
              </TableRow>
            ) : (
              data?.shipments.map((shipment) => (
                <TableRow key={shipment.id}>
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
                  <TableCell>{shipment.carrierName}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {shipment.user?.name || "Guest"}
                      </span>
                      {shipment.user?.email && (
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground">
                            {shipment.user.email}
                          </span>
                          <CopyButton
                            text={shipment.user.email}
                            tooltipText="Copy email"
                          />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{shipment.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={getPaymentColor(shipment.paymentStatus) as any}
                    >
                      {shipment.paymentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(shipment.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() =>
                            navigator.clipboard.writeText(
                              shipment.customTrackingNumber,
                            )
                          }
                        >
                          Copy Tracking #
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => openOverride(shipment)}
                        >
                          Override Status
                        </DropdownMenuItem>
                        {shipment.paymentStatus !== "PAID" && (
                          <DropdownMenuItem
                            onClick={() => openBypass(shipment)}
                          >
                            Mark as Paid (Bypass)
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination controls */}
      <div className="flex items-center justify-end space-x-2 py-4">
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
          disabled={!data || data.shipments.length < 10 || isLoading}
        >
          Next
        </Button>
      </div>

      {/* Modals */}
      {selectedShipment && (
        <>
          <BypassPaymentModal
            shipmentId={selectedShipment.id}
            isOpen={bypassModalOpen}
            onClose={() => setBypassModalOpen(false)}
          />
          <OverrideStatusModal
            shipmentId={selectedShipment.id}
            currentStatus={selectedShipment.status}
            currentSync={selectedShipment.trackingSyncEnabled}
            isOpen={overrideModalOpen}
            onClose={() => setOverrideModalOpen(false)}
          />
        </>
      )}
    </div>
  );
}
