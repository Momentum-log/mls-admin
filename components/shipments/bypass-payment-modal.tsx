"use client";

import { useState } from "react";
import { useBypassPayment } from "@/hooks/shipments/use-shipments";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  EMPTY_MANUAL_PAYMENT,
  ManualPaymentFields,
  isManualPaymentValid,
  toBypassPayload,
  type ManualPaymentValue,
} from "@/components/shipments/manual-payment-fields";

interface BypassPaymentModalProps {
  shipmentId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Records a payment taken outside the gateway. The server then runs the
 * paid pipeline: invoice PAID, payment recorded, label created, customer
 * emailed. The toast says what happened to the label.
 */
export function BypassPaymentModal({
  shipmentId,
  isOpen,
  onClose,
}: BypassPaymentModalProps) {
  const [value, setValue] = useState<ManualPaymentValue>(EMPTY_MANUAL_PAYMENT);
  const { mutate: bypassPayment, isPending } = useBypassPayment();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shipmentId || !isManualPaymentValid(value)) return;

    bypassPayment(
      { shipmentId, data: toBypassPayload(value) },
      {
        onSuccess: () => {
          onClose();
          setValue(EMPTY_MANUAL_PAYMENT);
        },
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record a payment</DialogTitle>
          <DialogDescription>
            Marks the invoice paid and creates the label, exactly as a card
            payment would. The customer gets the payment confirmation.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <ManualPaymentFields value={value} onChange={setValue} idPrefix="bypass" />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !isManualPaymentValid(value)}>
              {isPending ? "Processing..." : "Record payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
