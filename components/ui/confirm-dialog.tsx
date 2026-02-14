"use client";

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
  /** Called when the user clicks the confirm button. */
  onConfirm: () => void;
}

/**
 * Reusable confirmation dialog built on shadcn AlertDialog.
 * Replaces all native `confirm()` calls throughout the app.
 *
 * @example
 * ```tsx
 * <ConfirmDialog
 *   open={showBanDialog}
 *   onOpenChange={setShowBanDialog}
 *   title="Ban User?"
 *   description="This action cannot be undone."
 *   confirmLabel="Ban"
 *   destructive
 *   onConfirm={handleBan}
 * />
 * ```
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
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={
              destructive
                ? "bg-destructive text-white hover:bg-destructive/90"
                : ""
            }
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
