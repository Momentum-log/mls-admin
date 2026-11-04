"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useSetCarriersFulfilmentMode } from "@/hooks/carriers/use-carriers";
import { ALWAYS_MANUAL_SLUGS } from "@/lib/api/carriers/constants";
import type { Carrier, FulfilmentMode } from "@/types/carriers";

const isAlwaysManual = (carrier: Carrier) =>
  ALWAYS_MANUAL_SLUGS.includes(carrier.slug);

/** What a carrier is now: Momentum is always manual. */
export const effectiveMode = (carrier: Carrier): FulfilmentMode =>
  isAlwaysManual(carrier) ? "MANUAL" : (carrier.fulfilmentMode ?? "AUTOMATIC");

function FulfilmentModeForm({
  carriers,
  onDone,
}: {
  carriers: Carrier[];
  onDone: () => void;
}) {
  const [mode, setMode] = useState<FulfilmentMode>("MANUAL");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const { mutate: apply, isPending } = useSetCarriersFulfilmentMode();

  // Momentum cannot be automatic, so it is not offered for Automatic.
  const choosable = carriers.filter(
    (c) => c.slug && !(mode === "AUTOMATIC" && isAlwaysManual(c)),
  );
  const chosen = choosable.filter((c) => selected.has(c.id));
  const allChosen = choosable.length > 0 && chosen.length === choosable.length;

  const toggle = (id: string, on: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });

  return (
    <>
      <div className="space-y-5">
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Set to</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {(
              [
                [
                  "AUTOMATIC",
                  "Automatic",
                  "The carrier's system creates the label right after payment.",
                ],
                [
                  "MANUAL",
                  "Manual",
                  "Paid shipments go to Labels to prepare; staff book them.",
                ],
              ] as const
            ).map(([value, title, hint]) => (
              <label
                key={value}
                className={`flex cursor-pointer gap-3 rounded-lg border p-3 text-sm ${
                  mode === value ? "border-brand-blue bg-brand-blue/5" : ""
                }`}
              >
                <input
                  type="radio"
                  name="fulfilment-mode"
                  className="mt-0.5"
                  checked={mode === value}
                  onChange={() => setMode(value)}
                />
                <span>
                  <span className="font-medium">{title}</span>
                  <span className="block text-xs text-muted-foreground">
                    {hint}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="space-y-2">
          <div className="flex items-center justify-between">
            <legend className="text-sm font-medium">For these carriers</legend>
            <Button
              type="button"
              variant="link"
              size="sm"
              className="h-auto p-0"
              onClick={() =>
                setSelected(
                  allChosen ? new Set() : new Set(choosable.map((c) => c.id)),
                )
              }
            >
              {allChosen ? "Clear all" : "Select all"}
            </Button>
          </div>
          <ul className="divide-y rounded-lg border">
            {carriers
              .filter((c) => c.slug)
              .map((carrier) => {
                const locked = mode === "AUTOMATIC" && isAlwaysManual(carrier);
                const id = `fulfilment-${carrier.id}`;
                return (
                  <li
                    key={carrier.id}
                    className="flex items-center gap-3 px-3 py-2.5"
                  >
                    <Checkbox
                      id={id}
                      checked={!locked && selected.has(carrier.id)}
                      disabled={locked}
                      onChange={(e) => toggle(carrier.id, e.target.checked)}
                    />
                    <label htmlFor={id} className="flex-1 text-sm">
                      <span className="font-medium">{carrier.name}</span>
                      {locked && (
                        <span className="block text-xs text-muted-foreground">
                          No carrier system, so always Manual.
                        </span>
                      )}
                    </label>
                    <Badge variant="outline" className="text-xs">
                      Now:{" "}
                      {effectiveMode(carrier) === "MANUAL"
                        ? "Manual"
                        : "Automatic"}
                    </Badge>
                  </li>
                );
              })}
          </ul>
          <p className="text-xs text-muted-foreground">
            Applies to shipments paid from now on. Shipments already paid stay
            where they are.
          </p>
        </fieldset>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button
          type="button"
          disabled={isPending || chosen.length === 0}
          onClick={() =>
            apply(
              { mode, carrierIds: chosen.map((c) => c.id) },
              { onSuccess: onDone },
            )
          }
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Apply to {chosen.length} carrier{chosen.length === 1 ? "" : "s"}
        </Button>
      </DialogFooter>
    </>
  );
}

/**
 * One place to make carriers automatic or manual: pick the mode, tick the
 * carriers, apply. Each carrier's own setting changes, so its page agrees.
 */
export function FulfilmentModeDialog({
  open,
  onOpenChange,
  carriers,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  carriers: Carrier[];
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Fulfilment</DialogTitle>
          <DialogDescription>
            Choose Automatic or Manual, tick the carriers it applies to, then
            apply.
          </DialogDescription>
        </DialogHeader>
        {/* Mounted only while open, so each opening starts fresh. */}
        {open && (
          <FulfilmentModeForm
            carriers={carriers}
            onDone={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
