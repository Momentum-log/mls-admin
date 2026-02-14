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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface BypassPaymentModalProps {
  shipmentId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BypassPaymentModal({
  shipmentId,
  isOpen,
  onClose,
}: BypassPaymentModalProps) {
  const [manualTransactionId, setManualTransactionId] = useState("");
  const [notes, setNotes] = useState("");
  const { mutate: bypassPayment, isPending } = useBypassPayment();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shipmentId) return;

    bypassPayment(
      { shipmentId, data: { manualTransactionId, notes } },
      {
        onSuccess: () => {
          onClose();
          setManualTransactionId("");
          setNotes("");
        },
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bypass Payment</DialogTitle>
          <DialogDescription>
            Manually mark this shipment as PAID.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="transactionId">Transaction ID / Reference</Label>
            <Input
              id="transactionId"
              required
              value={manualTransactionId}
              onChange={(e) => setManualTransactionId(e.target.value)}
              placeholder="BANK-REF-123"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Reason for bypass..."
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Processing..." : "Confirm Payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
