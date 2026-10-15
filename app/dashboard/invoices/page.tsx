"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { useInvoices } from "@/hooks/admin/use-invoices";
import { exportInvoicesCsv } from "@/lib/api/admin/invoices";
import { getApiErrorMessage } from "@/lib/api-error";
import type { InvoiceStatus } from "@/types/invoice";
import { formatCurrency } from "@/utils/format-currency";
import { formatDate } from "@/utils/format-date";
import { Pager } from "@/components/admin/pager";
import { InvoiceDetailSheet } from "@/components/invoices/invoice-detail-sheet";
import { INVOICE_STATUS_VARIANT } from "@/components/invoices/invoice-status";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, FileText, Loader2 } from "lucide-react";

const STATUSES: (InvoiceStatus | "ALL")[] = ["ALL", "PENDING", "PAID", "EXPIRED", "REFUNDED"];

/**
 * Every invoice, with filters, a CSV export for accounting, and a detail
 * sheet for marking one paid or opening a refund.
 */
export default function InvoicesPage() {
  const [status, setStatus] = useState<InvoiceStatus | "ALL">("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const limit = 25;

  const filters = {
    status: status === "ALL" ? undefined : status,
    startDate: startDate || undefined,
    // The end date is inclusive of the whole day.
    endDate: endDate ? `${endDate}T23:59:59.999Z` : undefined,
  };
  const { data, isLoading, isFetching } = useInvoices({ ...filters, page, limit });
  const invoices = data?.data ?? [];

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await exportInvoicesCsv(filters);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoices-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not export invoices"));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Invoices</h2>
          <p className="text-muted-foreground">Every invoice issued to customers.</p>
        </div>
        <Button variant="outline" onClick={handleExport} disabled={isExporting}>
          {isExporting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Export CSV
        </Button>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(value as InvoiceStatus | "ALL");
              setPage(1);
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="from">From</Label>
          <Input
            id="from"
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="to">To</Label>
          <Input
            id="to"
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Invoice #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Issued</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-brand-blue" />
                </TableCell>
              </TableRow>
            ) : invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <FileText className="h-10 w-10 opacity-20" />
                    <p className="font-medium">No invoices match.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((invoice) => (
                <TableRow
                  key={invoice.id}
                  className="cursor-pointer hover:bg-muted/30"
                  onClick={() => setSelectedId(invoice.id)}
                >
                  <TableCell className="font-mono text-sm font-bold">
                    {invoice.invoiceNumber}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-sm">{invoice.user?.name ?? "—"}</span>
                    <span className="block text-xs text-muted-foreground">
                      {invoice.user?.email}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {formatCurrency(invoice.currency ?? "PLN", invoice.totalAmount)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={INVOICE_STATUS_VARIANT[invoice.status]} className="text-xs">
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDate(invoice.invoiceDate ?? invoice.createdAt)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Pager page={page} pagination={data?.pagination} onPageChange={setPage} isLoading={isFetching} />

      <InvoiceDetailSheet
        invoiceId={selectedId}
        onOpenChange={(open) => !open && setSelectedId(null)}
      />
    </div>
  );
}
