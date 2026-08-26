"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp } from "lucide-react";
import type { RepriceDetails } from "@/types/multi-leg";
import { formatCurrency } from "@/utils/format-currency";

interface RepriceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  details: RepriceDetails | null;
  /** Currency of the quoted leg — the 409 body carries figures but no currency. */
  currency: string;
  isLoading: boolean;
  onAccept: () => void;
}

/**
 * The leg-2 re-pricing decision.
 *
 * The server refuses to create leg 2 when its live rate exceeds the quoted
 * price by more than 10%, and hands back both figures. That refusal is a
 * decision for ops, not an error: the customer paid a combined price days ago,
 * and quietly absorbing the difference turns margin into a loss nobody sees.
 *
 * Both numbers and the shortfall are shown, and proceeding is an explicit act.
 */
export default function RepriceDialog({
  open,
  onOpenChange,
  details,
  currency,
  isLoading,
  onAccept,
}: RepriceDialogProps) {
  if (!details) return null;

  const difference = details.livePrice - details.quotedPrice;
  const percent =
    details.quotedPrice > 0
      ? (difference / details.quotedPrice) * 100
      : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-amber-600" />
            Leg 2 costs more than quoted
          </DialogTitle>
          <DialogDescription>{details.message}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border p-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Customer paid
              </p>
              <p className="text-lg font-bold mt-1">
                {formatCurrency(currency, details.quotedPrice)}
              </p>
            </div>
            <div className="rounded-lg border border-amber-500/40 bg-amber-50 p-3">
              <p className="text-xs font-medium text-amber-800 uppercase tracking-wide">
                Live rate now
              </p>
              <p className="text-lg font-bold mt-1 text-amber-900">
                {formatCurrency(currency, details.livePrice)}
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-destructive/5 border border-destructive/20 p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-destructive">
                Absorbed by MLS
              </span>
              <span className="text-base font-bold text-destructive">
                {formatCurrency(currency, difference)}
                <span className="ml-1 text-xs font-medium">
                  ({percent.toFixed(1)}%)
                </span>
              </span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Proceeding creates leg 2 at the new price. The customer is not
            re-charged — the difference comes out of margin on this shipment.
          </p>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button variant="destructive" onClick={onAccept} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Proceed at {formatCurrency(currency, details.livePrice)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
