"use client";

import { useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import {
  CheckCircle2,
  Clock3,
  Eye,
  FileText,
  Loader2,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { getAddressRequestProofFile } from "@/lib/api/admin/address-requests";
import {
  useAddressRequestDetails,
  useAddressRequests,
  useApproveAddressRequest,
  useRejectAddressRequest,
} from "@/hooks/admin/use-address-requests";
import {
  AddressPayload,
  AddressRequest,
  AddressRequestStatus,
  AddressRequestTimelineEvent,
} from "@/types/address-request";
import { formatDateTime, formatRelativeTime } from "@/utils/format-date";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const DEFAULT_LIMIT = 20;

type StatusFilter = "ALL" | AddressRequestStatus;
type DecisionMode = "approve" | "reject";

const statusStyles: Record<AddressRequestStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REJECTED: "bg-rose-50 text-rose-700 border-rose-200",
};

function formatAddress(address?: AddressPayload | null): string {
  if (!address) return "Not available";

  const parts = [
    address.street,
    address.city,
    address.state,
    address.postalCode,
    address.country,
  ]
    .map((part) => (typeof part === "string" ? part.trim() : ""))
    .filter(Boolean);

  return parts.length ? parts.join(", ") : "Not available";
}

function getNote(request?: AddressRequest): string {
  if (!request) return "";
  return (
    (request.feedback as string) ||
    (request.adminNote as string) ||
    (request.reviewNotes as string) ||
    (request.note as string) ||
    (request.rejectionReason as string) ||
    ""
  );
}

function buildTimeline(request?: AddressRequest): AddressRequestTimelineEvent[] {
  if (!request) return [];

  if (Array.isArray(request.timeline) && request.timeline.length > 0) {
    return request.timeline;
  }

  const fallbackTimeline: AddressRequestTimelineEvent[] = [
    {
      type: "SUBMITTED",
      timestamp: request.createdAt,
      note: "Address verification request submitted by user.",
    },
  ];

  if (request.status !== "PENDING") {
    fallbackTimeline.push({
      type: request.status,
      timestamp:
        (request.reviewedAt as string) ||
        (request.updatedAt as string) ||
        request.createdAt,
      note: getNote(request) || undefined,
    });
  }

  return fallbackTimeline;
}

function TimelineItem({ event }: { event: AddressRequestTimelineEvent }) {
  const action =
    (event.type as string) ||
    (event.action as string) ||
    (event.status as string) ||
    "UPDATE";
  const when = (event.timestamp as string) || (event.createdAt as string);
  const actorName =
    (event.performedBy?.name as string) ||
    (event.actor?.name as string) ||
    "System";
  const note =
    (event.note as string) ||
    (event.feedback as string) ||
    (event.details as string) ||
    "";

  return (
    <li className="relative pl-6 pb-4 last:pb-0">
      <span className="absolute left-0 top-2 h-2.5 w-2.5 rounded-full bg-brand-blue" />
      <div className="rounded-lg border bg-muted/20 p-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold">{action}</p>
          <p className="text-xs text-muted-foreground">
            {when ? formatDateTime(when) : "Unknown time"}
          </p>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">By {actorName}</p>
        {note && <p className="mt-2 text-sm text-foreground">{note}</p>}
      </div>
    </li>
  );
}

export default function AddressRequestsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null,
  );
  const [decisionMode, setDecisionMode] = useState<DecisionMode | null>(null);
  const [decisionNotes, setDecisionNotes] = useState("");
  const [proofLoadingId, setProofLoadingId] = useState<string | null>(null);

  const { data, isLoading, refetch } = useAddressRequests({
    page,
    limit,
    status: status === "ALL" ? undefined : status,
  });

  const {
    data: selectedRequest,
    isLoading: isDetailsLoading,
    refetch: refetchDetails,
  } = useAddressRequestDetails(selectedRequestId ?? undefined, !!selectedRequestId);

  const { mutate: approveRequest, isPending: isApproving } =
    useApproveAddressRequest();
  const { mutate: rejectRequest, isPending: isRejecting } =
    useRejectAddressRequest();

  const requests = useMemo(
    () => data?.requests ?? data?.data ?? [],
    [data?.requests, data?.data],
  );

  const pagination =
    data?.pagination ??
    ({
      total: requests.length,
      page,
      limit,
      totalPages: 1,
    } as const);

  const requestTimeline = buildTimeline(selectedRequest);
  const isDecisionPending = isApproving || isRejecting;

  const isSelectedPending = selectedRequest?.status === "PENDING";

  const closeDecisionDialog = () => {
    setDecisionMode(null);
    setDecisionNotes("");
  };

  const handleOpenProof = async (requestId: string) => {
    try {
      setProofLoadingId(requestId);
      const blob = await getAddressRequestProofFile(requestId);
      const objectUrl = URL.createObjectURL(blob);
      const newTab = window.open(objectUrl, "_blank", "noopener,noreferrer");

      if (!newTab) {
        toast.error("Unable to open a new tab. Please enable popups.");
      }

      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.details ||
          error?.response?.data?.message ||
          "Proof file is unavailable or has already been removed.",
      );
    } finally {
      setProofLoadingId(null);
    }
  };

  const submitDecision = () => {
    if (!selectedRequestId || !decisionMode) return;

    const cleanedNotes = decisionNotes.trim();

    if (decisionMode === "reject" && !cleanedNotes) {
      toast.error("Reject notes are required.");
      return;
    }

    if (decisionMode === "approve") {
      approveRequest(
        {
          requestId: selectedRequestId,
          payload: {
            notes: cleanedNotes || undefined,
          },
        },
        {
          onSuccess: () => {
            closeDecisionDialog();
            refetch();
            refetchDetails();
          },
        },
      );
      return;
    }

    rejectRequest(
      {
        requestId: selectedRequestId,
        payload: {
          feedback: cleanedNotes,
          notes: cleanedNotes,
        },
      },
      {
        onSuccess: () => {
          closeDecisionDialog();
          refetch();
          refetchDetails();
        },
      },
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Address Requests</h2>
          <p className="text-sm text-muted-foreground">
            Review, approve, and reject user address verification submissions.
          </p>
        </div>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => {
            refetch();
            if (selectedRequestId) {
              refetchDetails();
            }
          }}
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Input
          readOnly
          value={`Total Requests: ${pagination.total}`}
          className="w-[210px] bg-muted/20"
          aria-label="Total requests"
        />
        <Select
          value={status}
          onValueChange={(value: StatusFilter) => {
            setStatus(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Request</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Last Update</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-40 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-brand-blue" />
                </TableCell>
              </TableRow>
            ) : requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-40 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <FileText className="h-8 w-8 opacity-30" />
                    <p>No address requests found.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              requests.map((request) => (
                <TableRow
                  key={request.id}
                  className="cursor-pointer hover:bg-muted/20"
                  onClick={() => setSelectedRequestId(request.id)}
                >
                  <TableCell>
                    <p className="font-medium text-brand-blue">{request.id}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatAddress(request.newAddress)}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {request.user?.name || "Unknown User"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {request.user?.email || "No email"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusStyles[request.status]}>
                      {request.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatRelativeTime(request.createdAt)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {request.reviewedAt
                      ? formatDateTime(request.reviewedAt)
                      : "Not reviewed"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelectedRequestId(request.id);
                      }}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-2 flex items-center justify-between px-2">
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground">
            Showing page {pagination.page} of {pagination.totalPages} ({" "}
            {pagination.total} total)
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Rows per page:</span>
            <Select
              value={limit.toString()}
              onValueChange={(value) => {
                setLimit(parseInt(value, 10));
                setPage(1);
              }}
            >
              <SelectTrigger className="h-8 w-[72px]">
                <SelectValue placeholder={limit.toString()} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="30">30</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page === 1 || isLoading}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((current) => current + 1)}
            disabled={page >= pagination.totalPages || isLoading}
          >
            Next
          </Button>
        </div>
      </div>

      <Sheet
        open={!!selectedRequestId}
        onOpenChange={(open) => !open && setSelectedRequestId(null)}
      >
        <SheetContent className="sm:max-w-2xl w-full overflow-y-auto">
          <SheetHeader className="border-b">
            <SheetTitle>Address Request Details</SheetTitle>
            <SheetDescription>
              Review address data, proof file, and decision timeline.
            </SheetDescription>
          </SheetHeader>

          {isDetailsLoading || !selectedRequest ? (
            <div className="flex h-[60vh] items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-brand-blue" />
            </div>
          ) : (
            <div className="space-y-6 p-5">
              <section className="rounded-lg border p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Request Snapshot</h3>
                  <Badge className={statusStyles[selectedRequest.status]}>
                    {selectedRequest.status}
                  </Badge>
                </div>
                <div className="grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <p className="text-muted-foreground">Request ID</p>
                    <p className="font-medium break-all">{selectedRequest.id}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Submitted</p>
                    <p className="font-medium">
                      {formatDateTime(selectedRequest.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">User</p>
                    <p className="font-medium">
                      {selectedRequest.user?.name || "Unknown User"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selectedRequest.user?.email || "No email"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Reviewed At</p>
                    <p className="font-medium">
                      {selectedRequest.reviewedAt
                        ? formatDateTime(selectedRequest.reviewedAt)
                        : "Not reviewed"}
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-lg border p-4 space-y-3">
                <h3 className="font-semibold">Addresses</h3>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Submitted Address
                  </p>
                  <p className="mt-1 text-sm">{formatAddress(selectedRequest.newAddress)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Current Active Address
                  </p>
                  <p className="mt-1 text-sm">
                    {formatAddress(selectedRequest.activeAddress)}
                  </p>
                </div>
              </section>

              <section className="rounded-lg border p-4 space-y-3">
                <h3 className="font-semibold">Proof File</h3>
                <p className="text-sm text-muted-foreground">
                  Open the submitted proof file in a new tab for full review.
                </p>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => handleOpenProof(selectedRequest.id)}
                  disabled={proofLoadingId === selectedRequest.id}
                >
                  {proofLoadingId === selectedRequest.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  View Proof in New Tab
                </Button>
              </section>

              <section className="rounded-lg border p-4 space-y-3">
                <h3 className="font-semibold">Timeline</h3>
                <ul>
                  {requestTimeline.map((event, index) => (
                    <TimelineItem key={`${event.type || event.action}-${index}`} event={event} />
                  ))}
                </ul>
              </section>

              <section className="rounded-lg border p-4 space-y-3">
                <h3 className="font-semibold">Decision</h3>
                {isSelectedPending ? (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      className="gap-2"
                      onClick={() => setDecisionMode("approve")}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      className="gap-2"
                      onClick={() => setDecisionMode("reject")}
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock3 className="h-4 w-4" />
                    This request is already processed. Refresh to sync the latest state.
                  </div>
                )}
              </section>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={!!decisionMode} onOpenChange={(open) => !open && closeDecisionDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {decisionMode === "approve"
                ? "Approve Address Request"
                : "Reject Address Request"}
            </DialogTitle>
            <DialogDescription>
              {decisionMode === "approve"
                ? "You can add optional internal notes before approving this request."
                : "Add rejection notes to explain why this request is being declined."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <p className="text-sm font-medium">
              Notes {decisionMode === "reject" ? "(required)" : "(optional)"}
            </p>
            <Textarea
              value={decisionNotes}
              onChange={(event) => setDecisionNotes(event.target.value)}
              placeholder={
                decisionMode === "reject"
                  ? "Reason for rejection"
                  : "Optional approval note"
              }
              rows={5}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDecisionDialog}>
              Cancel
            </Button>
            <Button
              variant={decisionMode === "reject" ? "destructive" : "default"}
              onClick={submitDecision}
              disabled={
                isDecisionPending ||
                (decisionMode === "reject" && !decisionNotes.trim())
              }
            >
              {isDecisionPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {decisionMode === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
