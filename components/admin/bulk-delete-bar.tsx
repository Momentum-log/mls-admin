"use client";

import { Button } from "@/components/ui/button";
import { Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface BulkDeleteBarProps {
  selectedCount: number;
  resourceName: string;
  onDelete: () => void;
  onClear: () => void;
  className?: string;
}

export function BulkDeleteBar({
  selectedCount,
  resourceName,
  onDelete,
  onClear,
  className,
}: BulkDeleteBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div
      className={cn(
        "fixed bottom-6 left-1/2 -translate-x-1/2 bg-foreground text-background rounded-full shadow-lg px-6 py-3 flex items-center gap-4 animate-in slide-in-from-bottom-4 z-50 border border-border/50 supports-backdrop-filter:bg-foreground/90 supports-backdrop-filter:backdrop-blur-md",
        className,
      )}
    >
      <div className="flex items-center gap-2 font-medium">
        <span className="bg-primary text-primary-foreground rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold">
          {selectedCount}
        </span>
        <span className="text-sm">{resourceName} Selected</span>
      </div>

      <div className="h-4 w-px bg-background/20" />

      <div className="flex items-center gap-2">
        <Button
          variant="destructive"
          size="sm"
          className="h-8 rounded-full"
          onClick={onDelete}
        >
          <Trash2 className="mr-2 h-3.5 w-3.5" />
          Delete
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full hover:bg-background/20 hover:text-background"
          onClick={onClear}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
