"use client";

import { useState, useEffect } from "react";
import { useMyActivityLogs } from "@/hooks/admin-profile/use-admin-profile";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ActivityLog } from "@/types/profile";
import { ChevronDown, ChevronUp } from "lucide-react";

function ActivityLogItem({ log }: { log: ActivityLog }) {
  const [showDetails, setShowDetails] = useState(false);

  // Safely parse details if it's a string, otherwise use directly if it's an object
  let parsedDetails = log.details;
  if (typeof log.details === "string") {
    try {
      parsedDetails = JSON.parse(log.details);
    } catch {
      parsedDetails = log.details;
    }
  }

  const hasDetails =
    parsedDetails &&
    (typeof parsedDetails === "object"
      ? Object.keys(parsedDetails).length > 0
      : true);

  const timestampStr = log.timestamp || (log as any).createdAt;
  const isValidDate = timestampStr && !isNaN(new Date(timestampStr).getTime());

  return (
    <div className="relative group">
      <div className="absolute w-3 h-3 bg-brand-blue rounded-full -left-[29px] top-1.5 shadow-[0_0_0_4px_var(--background)] transition-transform group-hover:scale-110" />
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-foreground">
          {log.action || `Accessed ${log.resource || (log as any).path}`}
        </span>
        <span className="text-xs text-brand-blue/80 font-medium">
          {isValidDate
            ? format(new Date(timestampStr), "EEEE, MMMM d, yyyy • h:mm:ss a")
            : "Unknown time"}
        </span>

        {hasDetails && (
          <div className="mt-1">
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs text-muted-foreground flex items-center hover:text-brand-blue transition-colors"
            >
              {showDetails ? (
                <>
                  <ChevronUp className="h-3 w-3 mr-1" />
                  Hide Details
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3 mr-1" />
                  View Details
                </>
              )}
            </button>
            {showDetails && (
              <div className="mt-2 text-xs bg-muted/40 p-2 rounded-md border border-border/50 text-muted-foreground overflow-x-auto">
                <pre className="font-mono m-0 whitespace-pre-wrap">
                  {typeof parsedDetails === "object"
                    ? JSON.stringify(parsedDetails, null, 2)
                    : String(parsedDetails)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function ActivityLogs() {
  const [page, setPage] = useState(1);
  const [accumulatedLogs, setAccumulatedLogs] = useState<ActivityLog[]>([]);

  const { data, isLoading, isFetching } = useMyActivityLogs({
    page,
    limit: 10,
  });

  useEffect(() => {
    if (data?.logs) {
      if (page === 1) {
        setAccumulatedLogs(data.logs);
      } else {
        setAccumulatedLogs((prev) => [...prev, ...data.logs]);
      }
    }
  }, [data, page]);

  if (isLoading && page === 1) {
    return (
      <div className="text-sm text-muted-foreground p-4 text-center">
        Loading activities...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {accumulatedLogs.length === 0 ? (
        <div className="p-4 rounded-xl bg-muted/30 border border-border/40 text-center text-sm text-muted-foreground">
          No recent activity found.
        </div>
      ) : (
        <div className="relative border-l-2 border-brand-blue/20 ml-3 pl-6 py-2 space-y-6 flex flex-col">
          {accumulatedLogs.map((log, index) => (
            <ActivityLogItem key={`${log.id}-${index}`} log={log} />
          ))}
        </div>
      )}

      {data?.pagination &&
        data.pagination.page < data.pagination.totalPages && (
          <div className="flex justify-center pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={isFetching}
              className="w-full text-brand-blue border-brand-blue/20 bg-brand-blue/5 hover:bg-brand-blue/10 transition-colors"
            >
              {isFetching ? "Loading..." : "Load More Activity"}
            </Button>
          </div>
        )}
    </div>
  );
}
