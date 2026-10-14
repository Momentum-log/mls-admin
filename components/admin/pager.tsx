"use client";

import { Button } from "@/components/ui/button";
import type { Pagination } from "@/types/api";

interface PagerProps {
  page: number;
  pagination?: Pagination;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

/**
 * Previous / next footer for a paginated table. Reads the normalised
 * pagination from `envelope.ts`, so offset- and page-style endpoints look
 * the same here.
 */
export function Pager({ page, pagination, onPageChange, isLoading }: PagerProps) {
  const totalPages = pagination?.totalPages ?? 1;

  return (
    <div className="flex items-center justify-between px-2">
      <p className="text-sm text-muted-foreground">
        Page {page} of {totalPages} ({pagination?.total ?? 0} total)
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1 || isLoading}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages || isLoading}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
