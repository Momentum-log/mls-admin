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
import { Loader2, AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  /** Whether the dialog is open. */
  open: boolean;
  /** Called when the dialog's open state changes (e.g., clicking outside or Cancel). */
  onOpenChange: (open: boolean) => void;
  /** Dialog title. */
  title: string;
  /** Description shown below the title. */
  description: string;
  /** Text for the confirm button. Defaults to "Confirm". */
  confirmLabel?: string;
  /** Text for the cancel button. Defaults to "Cancel". */
  cancelLabel?: string;
  /** Whether the confirm button should be styled as destructive (red). */
  destructive?: boolean;
  /** Called when the user clicks the confirm button. Receives force flag if enabled. */
  onConfirm: (force: boolean) => void;
  /** Whether the confirm button is in a loading state. */
  isLoading?: boolean;
  /** Whether to show the force delete toggle (advanced deletion). */
  enableForce?: boolean;
  /** The name of the resource being deleted (used in force warning). */
  resourceName?: string;
}

/**
 * Reusable confirmation dialog built on shadcn AlertDialog.
 * Replaces all native `confirm()` calls throughout the app.
 * Supports standard confirmation and advanced "Force Delete" patterns.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  onConfirm,
  isLoading = false,
  enableForce = false,
  resourceName = "record",
}: ConfirmDialogProps) {
  const [force, setForce] = useState(false);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle
            className={
              destructive ? "flex items-center gap-2 text-destructive" : ""
            }
          >
            {destructive && <AlertTriangle className="h-5 w-5" />}
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
              <Label htmlFor="force-mode" className="text-base font-semibold">
                Force Mode
              </Label>
              <p className="text-xs text-muted-foreground">
                Bypass safety checks and cascade delete all linked records.
              </p>
            </div>
            <Switch
              id="force-mode"
              checked={force}
              onCheckedChange={setForce}
              disabled={isLoading}
            />
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm(force);
            }}
            disabled={isLoading}
            className={
              destructive
                ? "bg-destructive text-white hover:bg-destructive/90"
                : ""
            }
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Processing..." : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
