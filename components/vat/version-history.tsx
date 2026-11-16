"use client";

import { useState } from "react";
import { useRevertVatMatrix, useVatMatrixVersion } from "@/hooks/admin/use-vat";
import { Can } from "@/components/auth/can";
import { ReasonDialog } from "@/components/admin/reason-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/utils/format-date";
import type { VatMatrixContent, VatMatrixVersionSummary } from "@/types/vat";
import { diffMatrix } from "./matrix-diff";

/** What this old version differs in compared with the live matrix. */
function VersionDiff({ id, active }: { id: string; active: VatMatrixContent }) {
  const { data, isLoading } = useVatMatrixVersion(id);
  if (isLoading || !data) return <p className="text-xs text-muted-foreground">Loading…</p>;
  const lines = diffMatrix(data, active);
  if (lines.length === 0) {
    return <p className="text-xs text-muted-foreground">Identical to the live matrix.</p>;
  }
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium">Changed since this version (this version → live):</p>
      <ul className="list-disc space-y-0.5 pl-5 text-xs text-muted-foreground">
        {lines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Every version ever published, newest first. Versions are never edited; a
 * revert publishes the old content as a new version, so the audit trail stays
 * complete and every order still points at the table it was taxed under.
 */
export function VersionHistory({
  versions,
  active,
}: {
  versions: VatMatrixVersionSummary[];
  active: VatMatrixContent;
}) {
  const [open, setOpen] = useState<string | null>(null);
  const [reverting, setReverting] = useState<VatMatrixVersionSummary | null>(null);
  const { mutate: revert, isPending } = useRevertVatMatrix();

  return (
    <div className="space-y-3">
      <ul className="divide-y rounded-xl border bg-card shadow-sm">
        {versions.map((v) => (
          <li key={v.id} className="space-y-2 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono font-semibold">v{v.version}</span>
              {v.isActive && <Badge>Live</Badge>}
              <span className="text-xs text-muted-foreground">{formatDateTime(v.createdAt)}</span>
              <div className="ml-auto flex gap-2">
                {!v.isActive && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-expanded={open === v.id}
                      onClick={() => setOpen(open === v.id ? null : v.id)}
                    >
                      {open === v.id ? "Hide changes" : "Compare with live"}
                    </Button>
                    <Can do="staff:write" fallback="disable">
                      <Button variant="outline" size="sm" onClick={() => setReverting(v)}>
                        Revert to this
                      </Button>
                    </Can>
                  </>
                )}
              </div>
            </div>
            <p className="text-sm">{v.reason}</p>
            {open === v.id && <VersionDiff id={v.id} active={active} />}
          </li>
        ))}
      </ul>

      <ReasonDialog
        open={reverting !== null}
        onOpenChange={(next) => !next && setReverting(null)}
        title={`Revert to version ${reverting?.version ?? ""}`}
        description="The old cells and wording go live as a new version. Orders already placed are not changed."
        label="Why revert"
        required
        confirmLabel={isPending ? "Reverting…" : "Revert"}
        isLoading={isPending}
        onConfirm={(reason) =>
          reverting && revert({ id: reverting.id, reason }, { onSuccess: () => setReverting(null) })
        }
      />
    </div>
  );
}
