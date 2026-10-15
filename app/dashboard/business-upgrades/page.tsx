"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import {
  useAccountUpgradeRequests,
  useApproveAccountUpgrade,
  useRejectAccountUpgrade,
} from "@/hooks/admin/use-account-upgrades";
import { getAccountUpgradeProofFile } from "@/lib/api/admin/account-upgrades";
import { getApiErrorMessage } from "@/lib/api-error";
import type { AccountUpgradeRequest, AccountUpgradeStatus } from "@/types/account-upgrade";
import { formatDateTime } from "@/utils/format-date";
import { Can } from "@/components/auth/can";
import { Pager } from "@/components/admin/pager";
import { ReasonDialog } from "@/components/admin/reason-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import CopyButton from "@/components/ui/copy-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Building2, Check, FileSearch, Loader2, X } from "lucide-react";

const STATUS_FILTERS: { value: AccountUpgradeStatus; label: string }[] = [
  { value: "PENDING", label: "Waiting for review" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "CANCELLED", label: "Cancelled by customer" },
];

/**
 * Customers asking to become business accounts. Check the NIP against the
 * public registry (or the attached document), then approve or reject.
 */
export default function BusinessUpgradesPage() {
  const [status, setStatus] = useState<AccountUpgradeStatus>("PENDING");
  const [page, setPage] = useState(1);
  const limit = 20;
  const { data, isLoading, isFetching } = useAccountUpgradeRequests({ status, page, limit });
  const requests = data?.data ?? [];

  const [approveTarget, setApproveTarget] = useState<AccountUpgradeRequest | null>(null);
  const [rejectTarget, setRejectTarget] = useState<AccountUpgradeRequest | null>(null);
  const [openingProof, setOpeningProof] = useState<string | null>(null);
  const { mutate: approve, isPending: isApproving } = useApproveAccountUpgrade();
  const { mutate: reject, isPending: isRejecting } = useRejectAccountUpgrade();

  const openProof = async (id: string) => {
    setOpeningProof(id);
    try {
      const blob = await getAccountUpgradeProofFile(id);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not open the document"));
    } finally {
      setOpeningProof(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Business Upgrades</h2>
          <p className="text-muted-foreground">
            Customers asking to switch to a business account.
          </p>
        </div>
        <Select
          value={status}
          onValueChange={(value) => {
            setStatus(value as AccountUpgradeStatus);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTERS.map((f) => (
              <SelectItem key={f.value} value={f.value}>
                {f.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Customer</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>NIP</TableHead>
              <TableHead>Requested</TableHead>
              <TableHead className="text-right w-[260px]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-brand-blue" />
                </TableCell>
              </TableRow>
            ) : requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Building2 className="h-10 w-10 opacity-20" />
                    <p className="font-medium">No requests here.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    {request.user ? (
                      <Link
                        href={`/dashboard/users/${request.user.userCode}`}
                        className="font-medium text-sm hover:underline"
                      >
                        {request.user.name}
                      </Link>
                    ) : (
                      "—"
                    )}
                    <span className="block text-xs text-muted-foreground">
                      {request.user?.email}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm font-medium">{request.companyName}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1 font-mono text-sm">
                      {request.nip}
                      <CopyButton text={request.nip} tooltipText="Copy NIP" />
                    </span>
                  </TableCell>
                  <TableCell className="text-sm whitespace-nowrap">
                    {formatDateTime(request.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2 flex-wrap">
                      {request.proofFile && (
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={openingProof === request.id}
                          onClick={() => openProof(request.id)}
                        >
                          <FileSearch className="mr-1 h-4 w-4" />
                          Document
                        </Button>
                      )}
                      {request.status === "PENDING" ? (
                        <>
                          <Can do="user:write" fallback="disable">
                            <Button size="sm" variant="outline" onClick={() => setRejectTarget(request)}>
                              <X className="mr-1 h-4 w-4" />
                              Reject
                            </Button>
                          </Can>
                          <Can do="user:write" fallback="disable">
                            <Button size="sm" onClick={() => setApproveTarget(request)}>
                              <Check className="mr-1 h-4 w-4" />
                              Approve
                            </Button>
                          </Can>
                        </>
                      ) : (
                        <Badge
                          variant={request.status === "APPROVED" ? "default" : "outline"}
                          className="text-xs"
                          title={request.adminFeedback ?? undefined}
                        >
                          {request.status}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Pager page={page} pagination={data?.pagination} onPageChange={setPage} isLoading={isFetching} />

      <ConfirmDialog
        open={!!approveTarget}
        onOpenChange={(open) => !open && setApproveTarget(null)}
        title="Approve this business account?"
        description={`${approveTarget?.user?.name ?? "The customer"} becomes a business account for ${approveTarget?.companyName ?? ""} (NIP ${approveTarget?.nip ?? ""}). Check the NIP in the public registry first. The customer is emailed.`}
        confirmLabel="Approve"
        isLoading={isApproving}
        onConfirm={() => {
          if (!approveTarget) return;
          approve(approveTarget.id, { onSettled: () => setApproveTarget(null) });
        }}
      />

      <ReasonDialog
        open={!!rejectTarget}
        onOpenChange={(open) => !open && setRejectTarget(null)}
        title="Reject this request?"
        description="The account stays personal. The customer is emailed what you write below."
        label="What the customer should know"
        placeholder="e.g. The NIP does not match the company name in the registry."
        required
        maxLength={2000}
        destructive
        confirmLabel="Reject request"
        isLoading={isRejecting}
        onConfirm={(feedback) => {
          if (!rejectTarget) return;
          if (feedback.length < 5) {
            toast.error("Write at least 5 characters for the customer.");
            return;
          }
          reject(
            { id: rejectTarget.id, feedback },
            { onSuccess: () => setRejectTarget(null) },
          );
        }}
      />
    </div>
  );
}
