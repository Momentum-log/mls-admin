"use client";

import { useState } from "react";
import Link from "next/link";
import { useResolveVatReview, useVatReviews } from "@/hooks/admin/use-vat";
import { Can } from "@/components/auth/can";
import { ReasonDialog } from "@/components/admin/reason-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/utils/format-currency";
import { formatDateTime } from "@/utils/format-date";
import {
  CLIENT_TYPE_LABEL,
  REVIEW_REASON_LABEL,
  type VatReview,
  type VatReviewFilter,
} from "@/types/vat";
import { Loader2, ShieldCheck } from "lucide-react";

/**
 * Orders that need a person: accepted at 0% VAT pending accountant review, or
 * held because the Biała lista / VIES registry could not be reached. Resolving
 * records who looked and why; it never changes the customer's price.
 */
export default function VatReviewsPage() {
  const [filter, setFilter] = useState<VatReviewFilter>("OPEN");
  const { data, isLoading } = useVatReviews(filter);
  const reviews = data?.reviews ?? [];
  const [resolving, setResolving] = useState<VatReview | null>(null);
  const { mutate: resolve, isPending } = useResolveVatReview();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">VAT Review</h2>
          <p className="text-muted-foreground">
            Orders waiting for a person to look at their VAT treatment.
          </p>
        </div>
        <Tabs value={filter} onValueChange={(v) => setFilter(v as VatReviewFilter)}>
          <TabsList>
            <TabsTrigger value="OPEN">Open</TabsTrigger>
            <TabsTrigger value="RESOLVED">Resolved</TabsTrigger>
            <TabsTrigger value="ALL">All</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Order</TableHead>
              <TableHead>Why</TableHead>
              <TableHead>Client type</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>VAT</TableHead>
              <TableHead>Total</TableHead>
              <TableHead className="text-right w-[140px]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-64 text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-brand-blue" />
                </TableCell>
              </TableRow>
            ) : reviews.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-64 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <ShieldCheck className="h-10 w-10 opacity-20" />
                    <p className="font-medium">Nothing to review.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              reviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell className="text-sm">
                    <Link
                      href={`/dashboard/shipments?shipment=${review.shipmentId}`}
                      className="font-mono text-brand-blue hover:underline"
                    >
                      {review.shipment.customTrackingNumber ?? review.shipmentId.slice(0, 8)}
                    </Link>
                    <span className="block text-xs text-muted-foreground">
                      {formatDateTime(review.createdAt)}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm max-w-[260px]">
                    {review.reviewReason ? REVIEW_REASON_LABEL[review.reviewReason] : "—"}
                    {review.reviewStatus === "RESOLVED" && review.reviewNote && (
                      <span className="block text-xs text-muted-foreground">
                        Resolved: {review.reviewNote}
                      </span>
                    )}
                    {review.validationStatus !== "NOT_REQUIRED" && (
                      <span className="block text-xs text-muted-foreground">
                        {review.validationProvider} {review.validationStatus}
                        {review.validationRef ? ` · ${review.validationRef}` : ""}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">{CLIENT_TYPE_LABEL[review.clientType]}</TableCell>
                  <TableCell className="text-sm font-mono">{review.routeType}</TableCell>
                  <TableCell className="text-sm">
                    <Badge variant="outline">{review.vatCode}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatCurrency(review.currency, review.totalGross)}
                  </TableCell>
                  <TableCell className="text-right">
                    {review.reviewStatus === "OPEN" ? (
                      <Can do="staff:write" fallback="disable">
                        <Button size="sm" variant="outline" onClick={() => setResolving(review)}>
                          Resolve
                        </Button>
                      </Can>
                    ) : (
                      <Badge variant="secondary">Resolved</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ReasonDialog
        open={resolving !== null}
        onOpenChange={(open) => !open && setResolving(null)}
        title="Resolve VAT review"
        description={
          resolving?.reviewReason === "VALIDATION_UNAVAILABLE"
            ? "The tax ID could not be checked. Resolving releases the held invoice as it stands, so confirm the customer's tax ID by another route first."
            : "Record why this order's VAT treatment is acceptable. The customer's price does not change."
        }
        label="Note"
        placeholder="For example: accountant confirmed 0% VAT for this lane"
        required
        confirmLabel={isPending ? "Resolving…" : "Resolve"}
        isLoading={isPending}
        onConfirm={(note) =>
          resolving && resolve({ id: resolving.id, note }, { onSuccess: () => setResolving(null) })
        }
      />
    </div>
  );
}
