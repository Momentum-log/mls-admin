"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";

interface DeleteResourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  resourceName: string; // e.g. "Shipment", "User"
  onConfirm: (force: boolean) => void;
  isLoading?: boolean;
  enableForce?: boolean; // Whether to show the force delete toggle
}

export function DeleteResourceDialog({
  open,
  onOpenChange,
  title,
  description,
  resourceName,
  onConfirm,
  isLoading,
  enableForce = true,
}: DeleteResourceDialogProps) {
  const [force, setForce] = useState(false);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {description}
            {force && (
              <div className="mt-2 rounded-md bg-destructive/10 p-2 text-xs font-medium text-destructive">
                Warning: Force delete will permanently remove this{" "}
                {resourceName.toLowerCase()} and all associated data
                (cascading). This action cannot be undone.
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {enableForce && (
          <div className="flex items-center justify-between py-4">
            <div className="space-y-0.5">
              <Label htmlFor="force-mode" className="text-base">
                Force Delete
              </Label>
              <p className="text-xs text-muted-foreground">
                Bypass safety checks and cascade delete all linked records.
              </p>
            </div>
            <Switch
              id="force-mode"
              checked={force}
              onCheckedChange={setForce}
            />
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={() => onConfirm(force)}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Deleting..." : `Delete ${resourceName}`}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
