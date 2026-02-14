"use client";

import { useState } from "react";
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

interface OverrideStatusModalProps {
  shipmentId: string | null;
  currentStatus: string;
  currentSync: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export function OverrideStatusModal({
  shipmentId,
  currentStatus,
  currentSync,
  isOpen,
  onClose,
}: OverrideStatusModalProps) {
  const [status, setStatus] = useState(currentStatus);
  const [trackingSyncEnabled, setTrackingSyncEnabled] = useState(currentSync);
  const { mutate: overrideStatus, isPending } = useOverrideStatus();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shipmentId) return;

    overrideStatus(
      {
        shipmentId,
        data: { status, manualOverride: true, trackingSyncEnabled },
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Override Status</DialogTitle>
          <DialogDescription>
            Force update the shipment status. Warning: Disabling sync stops
            automatic updates.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>New Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">PENDING</SelectItem>
                <SelectItem value="IN_TRANSIT">IN_TRANSIT</SelectItem>
                <SelectItem value="DELIVERED">DELIVERED</SelectItem>
                <SelectItem value="EXCEPTION">EXCEPTION</SelectItem>
                <SelectItem value="CANCELLED">CANCELLED</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="sync"
              checked={trackingSyncEnabled}
              onCheckedChange={setTrackingSyncEnabled}
            />
            <Label htmlFor="sync">Enable Carrier Tracking Sync</Label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Updating..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
