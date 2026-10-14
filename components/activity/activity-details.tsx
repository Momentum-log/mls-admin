"use client";

import { useState } from "react";

/**
 * An audit entry's `details`, collapsed to one line until clicked. The
 * server stores whatever the action logged, sometimes as a JSON string.
 */
export function ActivityDetails({ details }: { details: unknown }) {
  const [open, setOpen] = useState(false);
  if (details == null || details === "") return <span className="text-muted-foreground">—</span>;

  let value = details;
  if (typeof details === "string") {
    try {
      value = JSON.parse(details);
    } catch {
      value = details;
    }
  }
  const text = typeof value === "string" ? value : JSON.stringify(value, null, 2);

  return (
    <button
      type="button"
      onClick={() => setOpen((prev) => !prev)}
      className="max-w-[360px] text-left font-mono text-[11px] text-muted-foreground hover:text-foreground"
      title={open ? "Collapse" : "Expand"}
    >
      {open ? (
        <pre className="whitespace-pre-wrap break-all">{text}</pre>
      ) : (
        <span className="line-clamp-1 break-all">{text.replace(/\s+/g, " ")}</span>
      )}
    </button>
  );
}

/** "UPDATE_GLOBAL_COMMISSION" → "Update global commission". */
export function formatAction(action: string): string {
  const words = action.replaceAll("_", " ").toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}
