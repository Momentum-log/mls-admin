"use client";

import { useState, useMemo } from "react";
import { useLeads } from "@/hooks/leads/use-leads";
import { useUserShipments } from "@/hooks/shipments/use-shipments";
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
import { Loader2, Download, Search, FileText } from "lucide-react";
import ConversionBadge from "@/components/ui/conversion-badge";
import EstimateDetailSheet from "@/components/shipments/estimate-detail-sheet";
import type { AdminLead } from "@/types/admin-user-resources";
import { formatDate } from "@/utils/format-date";
import { findShipmentForEstimate } from "@/utils/estimate-shipment-correlation";

const PAGE_SIZE = 10;

/**
 * Main Shipping Estimates (Marketing Leads) page.
 * Lists all generated estimates across the system with correlation indicators.
 */
export default function LeadsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  // Detail Sheet State
  const [selectedEstimate, setSelectedEstimate] = useState<AdminLead | null>(
    null,
  );

  const { data: responseData, isLoading } = useLeads({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch,
  });

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

  const handleExport = () => {
    if (!leads.length) return;

    const headers = [
      "ID",
      "User / Guest",
      "Origin",
      "Destination",
      "Weight",
      "Price",
      "Converted",
      "Date",
    ];
    const rows = leads.map((lead) => [
      lead.id,
      lead.user?.name || lead.email || lead.guestId || "Anonymous",
      `${lead.pickupLocation.city}, ${lead.pickupLocation.countryCode}`,
      `${lead.dropoffLocation.city}, ${lead.dropoffLocation.countryCode}`,
      `${lead.weight.value} ${lead.weight.units}`,
      `${lead.rates?.[0]?.actualPrice ?? "—"} ${
        lead.rates?.[0]?.currency ?? ""
      }`,
      lead.converted ? "Yes" : "No",
      new Date(lead.createdAt).toISOString(),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `estimates_export_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
        <Button
          variant="outline"
          onClick={handleExport}
          disabled={!leads.length}
        >
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
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
              <TableHead>Customer / Guest</TableHead>
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
                    className="cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => setSelectedEstimate(lead)}
                  >
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">
                          {lead.user?.name || lead.email || "Guest User"}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">
                          {lead.user?.userCode ||
                            (lead.guestId
                              ? `G: ${lead.guestId.slice(0, 8)}…`
                              : "Anonymous")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs">
                        {lead.pickupLocation.city},{" "}
                        {lead.pickupLocation.countryCode} →{" "}
                        {lead.dropoffLocation.city},{" "}
                        {lead.dropoffLocation.countryCode}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {lead.weight.value} {lead.weight.units}
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {bestRate
                        ? `${bestRate.actualPrice} ${bestRate.currency}`
                        : "—"}
                    </TableCell>
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
      <EstimateDetailSheet
        estimate={selectedEstimate}
        open={!!selectedEstimate}
        onOpenChange={(open) => !open && setSelectedEstimate(null)}
        linkedShipment={linkedShipment}
      />
    </div>
  );
}
