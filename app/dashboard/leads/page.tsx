"use client";

import { useState, useMemo } from "react";

import { useLeads, useDeleteLead } from "@/hooks/leads/use-leads";
import {
  useShipments,
  useUserShipments,
} from "@/hooks/shipments/use-shipments";
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
  Search,
  FileText,
  MoreHorizontal,
  Trash2,
  Copy,
} from "lucide-react";
import ConversionBadge from "@/components/ui/conversion-badge";
import EstimateDetailSheet from "@/components/shipments/estimate-detail-sheet";
import type { AdminLead } from "@/types/admin-user-resources";
import { formatDateTime } from "@/utils/format-date";
import { findShipmentForEstimate } from "@/utils/estimate-shipment-correlation";
import CopyButton from "@/components/ui/copy-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/utils/format-currency";

const DEFAULT_PAGE_SIZE = 20;

/**
 * Main Shipping Estimates (Marketing Leads) page.
 * Lists all generated estimates across the system with correlation indicators.
 */
export default function LeadsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [limit, setLimit] = useState(20);

  // Detail Sheet State
  const [selectedEstimate, setSelectedEstimate] = useState<AdminLead | null>(
    null,
  );

  const { data: responseData, isLoading } = useLeads({
    page,
    limit,
    search: debouncedSearch,
  });

  const { mutate: deleteLead } = useDeleteLead();
  const [leadToDelete, setLeadToDelete] = useState<string | null>(null);

  /**
   * Fetch shipments for the selected estimate's user to show correlation.
   * Since we're in a global list, we fetch on-demand for the selected user.
   */
  const { data: shipmentsData } = useUserShipments({
    userId: selectedEstimate?.user?.id ?? "",
    page: 1,
    limit: 100,
  });

  const linkedShipment = useMemo(
    () =>
      selectedEstimate && shipmentsData?.data
        ? findShipmentForEstimate(selectedEstimate, shipmentsData.data)
        : null,
    [selectedEstimate, shipmentsData],
  );

  const leads = responseData?.data ?? [];
  const pagination = responseData?.pagination;

  /**
   * Fetch a pool of recent shipments to correlate with the leads list.
   * This ensures the "Conversion" column accurately reflects shipments created.
   */
  const { data: allShipmentsPool } = useShipments({
    limit: 200, // Fetch a reasonably large pool for correlation
  });

  const shipments = allShipmentsPool?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Shipping Estimates
          </h2>
          <p className="text-muted-foreground">
            Track anonymous and user-generated shipping quotes.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search email, phone, name, or guest ID..."
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
              <TableHead className="w-[360px]">Customer / Guest</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Weight</TableHead>
              <TableHead>Best Price</TableHead>
              <TableHead>Conversion</TableHead>
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
                      Loading estimates...
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : leads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <FileText className="h-10 w-10 opacity-20" />
                    <p>No shipping estimates found.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              leads.map((lead) => {
                const bestRate = lead.rates?.[0];
                return (
                  <TableRow
                    key={lead.id}
                    className="cursor-pointer hover:bg-muted/30 transition-colors group"
                    onClick={() => setSelectedEstimate(lead)}
                  >
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-extrabold text-sm truncate max-w-[280px] text-foreground">
                          {lead.user?.name || lead.email || "Guest User"}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          {lead.user?.userCode ? (
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">
                                {lead.user.userCode}
                              </span>
                              <CopyButton
                                text={lead.user.userCode}
                                className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity"
                              />
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <Badge
                                variant="outline"
                                className="text-[10px] font-bold py-0 h-4 bg-accent-light/5 text-accent-dark border-accent-light/20"
                              >
                                GUEST
                              </Badge>
                              {lead.email && (
                                <div className="flex items-center gap-1">
                                  <span className="text-[11px] text-muted-foreground italic truncate max-w-[150px]">
                                    {lead.email}
                                  </span>
                                  <CopyButton
                                    text={lead.email}
                                    className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity"
                                  />
                                </div>
                              )}
                              {!lead.email && lead.guestId && (
                                <span className="text-[11px] text-muted-foreground opacity-50 font-mono">
                                  ID: {lead.guestId.slice(0, 8)}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-medium">
                        {lead.pickupLocation.city},{" "}
                        {lead.pickupLocation.countryCode} →{" "}
                        {lead.dropoffLocation.city},{" "}
                        {lead.dropoffLocation.countryCode}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {lead.weight.value} {lead.weight.units}
                    </TableCell>
                    <TableCell className="text-sm font-black text-brand-blue">
                      {bestRate
                        ? formatCurrency(
                            bestRate.currency,
                            bestRate.actualPrice,
                          )
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <ConversionBadge
                        converted={
                          lead.converted ||
                          !!findShipmentForEstimate(lead, shipments)
                        }
                      />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground font-medium">
                      {formatDateTime(lead.createdAt)}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => setSelectedEstimate(lead)}
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          {lead.user?.userCode && (
                            <DropdownMenuItem
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  lead.user!.userCode,
                                );
                              }}
                            >
                              <Copy className="mr-2 h-4 w-4" />
                              Copy User Code
                            </DropdownMenuItem>
                          )}
                          {!lead.user && lead.email && (
                            <DropdownMenuItem
                              onClick={() => {
                                navigator.clipboard.writeText(lead.email!);
                              }}
                            >
                              <Copy className="mr-2 h-4 w-4" />
                              Copy Guest Email
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setLeadToDelete(lead.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Lead
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
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

      {/* Detail Sheet */}
      <EstimateDetailSheet
        estimate={selectedEstimate}
        open={!!selectedEstimate}
        onOpenChange={(open) => !open && setSelectedEstimate(null)}
        linkedShipment={linkedShipment}
      />

      {/* Action Dialogs */}
      <ConfirmDialog
        open={!!leadToDelete}
        onOpenChange={(open) => !open && setLeadToDelete(null)}
        title="Delete Shipping Estimate?"
        description="This will permanently remove this record from the marketing leads list. This action cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (leadToDelete) {
            deleteLead(leadToDelete);
            setLeadToDelete(null);
          }
        }}
      />
    </div>
  );
}
