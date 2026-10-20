"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

interface ReasonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: ReactNode;
  /** Label above the text box. */
  label: string;
  placeholder?: string;
  /** Refuse to confirm with an empty text box. */
  required?: boolean;
  maxLength?: number;
  confirmLabel: string;
  destructive?: boolean;
  isLoading?: boolean;
  /** Extra controls shown between the text box and the buttons. */
  children?: ReactNode;
  onConfirm: (text: string) => void;
}

/**
 * A confirmation that asks for a reason or a note first. Used wherever the
 * server records why staff decided something (rejections, approvals, refund
 * requests), so every one of those reads and validates the same way.
 */
export function ReasonDialog({
  open,
  onOpenChange,
  title,
  description,
  ...formProps
}: ReasonDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription asChild>
            <div>{description}</div>
          </DialogDescription>
        </DialogHeader>
        {/* Mounted only while open, so every opening starts with an empty box
            and one decision's note never leaks into the next. */}
        <ReasonForm {...formProps} onCancel={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

function ReasonForm({
  label,
  placeholder,
  required = false,
  maxLength = 500,
  confirmLabel,
  destructive = false,
  isLoading = false,
  children,
  onConfirm,
  onCancel,
}: Omit<ReasonDialogProps, "open" | "onOpenChange" | "title" | "description"> & {
  onCancel: () => void;
}) {
  const [text, setText] = useState("");

  const trimmed = text.trim();
  const canConfirm = !isLoading && (!required || trimmed.length > 0);

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (canConfirm) onConfirm(trimmed);
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="reason-dialog-text">
          {label}
          {!required && (
            <span className="text-muted-foreground font-normal"> (optional)</span>
          )}
        </Label>
        <Textarea
          id="reason-dialog-text"
          value={text}
          maxLength={maxLength}
          placeholder={placeholder}
          onChange={(e) => setText(e.target.value)}
        />
      </div>
      {children}
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant={destructive ? "destructive" : "default"}
          disabled={!canConfirm}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {confirmLabel}
        </Button>
      </DialogFooter>
    </form>
  );
}
