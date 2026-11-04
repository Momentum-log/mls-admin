"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  EMPTY_MANUAL_PAYMENT,
  ManualPaymentFields,
  isManualPaymentValid,
  type ManualPaymentValue,
} from "@/components/shipments/manual-payment-fields";
import type { MarkInvoicePaidPayload } from "@/lib/api/admin/invoices";

interface MarkPaidDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading: boolean;
  onConfirm: (payload: MarkInvoicePaidPayload) => void;
}

/**
 * Marks an invoice paid with the same method, reference and notes as the
 * shipment bypass. For a shipment invoice the server also creates the label.
 */
export function MarkPaidDialog({
  open,
  onOpenChange,
  isLoading,
  onConfirm,
}: MarkPaidDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mark this invoice paid?</DialogTitle>
          <DialogDescription>
            Use this when the customer paid outside the gateway. If the invoice
            belongs to a shipment, its label is created too.
          </DialogDescription>
        </DialogHeader>
        {/* Mounted only while open, so every opening starts empty. */}
        <MarkPaidForm
          isLoading={isLoading}
          onCancel={() => onOpenChange(false)}
          onConfirm={onConfirm}
        />
      </DialogContent>
    </Dialog>
  );
}

function MarkPaidForm({
  isLoading,
  onCancel,
  onConfirm,
}: Pick<MarkPaidDialogProps, "isLoading" | "onConfirm"> & {
  onCancel: () => void;
}) {
  const [value, setValue] = useState<ManualPaymentValue>(EMPTY_MANUAL_PAYMENT);
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!isManualPaymentValid(value)) return;
        onConfirm({
          method: value.method,
          reference: value.reference.trim(),
          reason: value.notes.trim() || undefined,
        });
      }}
    >
      <ManualPaymentFields
        value={value}
        onChange={setValue}
        idPrefix="mark-paid"
      />
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading || !isManualPaymentValid(value)}
        >
          {isLoading ? "Saving..." : "Mark as paid"}
        </Button>
      </DialogFooter>
    </form>
  );
}
