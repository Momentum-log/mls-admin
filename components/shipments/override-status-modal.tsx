"use client";

import { useState, useEffect } from "react";
import { useOverrideStatus } from "@/hooks/shipments/use-shipments";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Bell, BellOff, RefreshCcw, Shield } from "lucide-react";

/**
 * All valid shipment statuses the backend recognises.
 * Mapped with labels and descriptions for the admin UI.
 */
const SHIPMENT_STATUSES = [
  {
    value: "CREATED",
    label: "Created",
    description: "Shipment has been created but not yet processed",
  },
  {
    value: "PAID",
    label: "Paid",
    description: "Payment confirmed, awaiting pickup",
  },
  {
    value: "IN_TRANSIT",
    label: "In Transit",
    description: "Shipment is on the way to destination",
  },
  {
    value: "DELIVERED",
    label: "Delivered",
    description: "Package has been delivered to the recipient",
  },
  {
    value: "COMPLETED",
    label: "Completed",
    description: "Shipment is completed and finalised",
  },
  {
    value: "CANCELLED",
    label: "Cancelled",
    description: "Shipment has been cancelled",
  },
  {
    value: "FAILED",
    label: "Failed",
    description: "Shipment failed due to an issue",
  },
] as const;

/**
 * Props for the Override Status Modal.
 */
interface OverrideStatusModalProps {
  /** UUID of the shipment to update. */
  shipmentId: string | null;
  /** Current status of the shipment (used for display context). */
  currentStatus: string;
  /** Current carrier sync toggle state. */
  currentSync: boolean;
  /** Whether the dialog is open. */
  isOpen: boolean;
  /** Callback to close the dialog. */
  onClose: () => void;
}

/**
 * Modal dialog for manually overriding a shipment's lifecycle status.
 *
 * Features:
 * - Full status selection with human-readable descriptions.
 * - Carrier sync toggle to stop/allow automated carrier tracking updates.
 * - Notification toggle to control whether the user is emailed about the change.
 * - Confirmation warnings for destructive actions (CANCELLED, FAILED).
 */
export function OverrideStatusModal({
  shipmentId,
  currentStatus,
  currentSync,
  isOpen,
  onClose,
}: OverrideStatusModalProps) {
  const [status, setStatus] = useState(currentStatus);
  const [trackingSyncEnabled, setTrackingSyncEnabled] = useState(currentSync);
  const [notify, setNotify] = useState(true);
  const { mutate: overrideStatus, isPending } = useOverrideStatus();

  /** Reset form state whenever the dialog opens with new values. */
  useEffect(() => {
    if (isOpen) {
      setStatus(currentStatus);
      setTrackingSyncEnabled(currentSync);
      setNotify(true);
    }
  }, [isOpen, currentStatus, currentSync]);

  const isDestructive = status === "CANCELLED" || status === "FAILED";
  const hasChanged = status !== currentStatus;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shipmentId) return;

    overrideStatus(
      {
        shipmentId,
        data: {
          status,
          manualOverride: true,
          trackingSyncEnabled,
          notify,
        },
      },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-brand-blue" />
            Manual Status Override
          </DialogTitle>
          <DialogDescription>
            Force this shipment into a new status. This overrides the automated
            carrier lifecycle and logs the action in the audit trail.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {/* Current Status */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Current Status:</span>
            <Badge variant="outline">{currentStatus}</Badge>
          </div>

          {/* New Status Selection */}
          <div className="space-y-2">
            <Label htmlFor="status-select">New Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status-select">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {SHIPMENT_STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{s.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {s.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Destructive warning */}
          {isDestructive && hasChanged && (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
              <p className="text-sm text-destructive">
                Setting status to <strong>{status}</strong> is a terminal
                action. Carrier sync will be automatically disabled. The user{" "}
                {notify ? "will" : "will NOT"} be notified.
              </p>
            </div>
          )}

          {/* Carrier Sync Toggle */}
          <div className="flex items-center justify-between rounded-md border p-3">
            <div className="flex items-center gap-2">
              <RefreshCcw className="h-4 w-4 text-muted-foreground" />
              <div className="space-y-0.5">
                <Label
                  htmlFor="sync-toggle"
                  className="text-sm font-medium cursor-pointer"
                >
                  Carrier Tracking Sync
                </Label>
                <p className="text-xs text-muted-foreground">
                  When disabled, automated carrier updates are ignored.
                </p>
              </div>
            </div>
            <Switch
              id="sync-toggle"
              checked={trackingSyncEnabled}
              onCheckedChange={setTrackingSyncEnabled}
            />
          </div>

          {/* Notification Toggle */}
          <div className="flex items-center justify-between rounded-md border p-3">
            <div className="flex items-center gap-2">
              {notify ? (
                <Bell className="h-4 w-4 text-brand-blue" />
              ) : (
                <BellOff className="h-4 w-4 text-muted-foreground" />
              )}
              <div className="space-y-0.5">
                <Label
                  htmlFor="notify-toggle"
                  className="text-sm font-medium cursor-pointer"
                >
                  Notify User
                </Label>
                <p className="text-xs text-muted-foreground">
                  Send an email notification to the user about this status
                  change.
                </p>
              </div>
            </div>
            <Switch
              id="notify-toggle"
              checked={notify}
              onCheckedChange={setNotify}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || !hasChanged}
              variant={isDestructive ? "destructive" : "default"}
              className={
                !isDestructive
                  ? "bg-brand-blue hover:bg-brand-blue/90"
                  : undefined
              }
            >
              {isPending ? "Updating..." : "Confirm Update"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
