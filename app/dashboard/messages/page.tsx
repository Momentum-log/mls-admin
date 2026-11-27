"use client";

import { useEffect, useRef, useState } from "react";
import { RichTextEditor } from "@/components/emails/rich-text-editor";
import {
  useContactMessage,
  useContactMessages,
  useLogCustomerReply,
  useReplyToContactMessage,
  useUpdateContactStatus,
} from "@/hooks/admin/use-contact-messages";
import { useDebounce } from "@/hooks/use-debounce";
import { useCan } from "@/components/auth/can";
import type { ContactStatus } from "@/types/contact";
import { formatDateTime } from "@/utils/format-date";
import { Pager } from "@/components/admin/pager";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle2, Eye, Loader2, MessageSquare, RotateCcw, Search, Send } from "lucide-react";

const STATUS_LABEL: Record<ContactStatus, string> = {
  NEW: "New",
  READ: "Read",
  REPLIED: "Answered",
  RESOLVED: "Resolved",
};

const STATUS_CLASS: Record<ContactStatus, string> = {
  NEW: "bg-brand-blue text-white border-transparent",
  READ: "bg-amber-100 text-amber-900 border-amber-200",
  REPLIED: "bg-sky-100 text-sky-900 border-sky-200",
  RESOLVED: "bg-emerald-100 text-emerald-900 border-emerald-200",
};

function StatusBadge({ status }: { status: ContactStatus }) {
  return (
    <Badge variant="outline" className={`text-xs ${STATUS_CLASS[status]}`}>
      {STATUS_LABEL[status]}
    </Badge>
  );
}

/**
 * Cases from the public contact form. Each submission is also emailed to the
 * company inbox. Staff read it, answer here (the reply is emailed to the
 * customer), and mark the case resolved. Customer emails are not tracked
 * automatically: log them on the case by hand.
 */
export default function MessagesPage() {
  const [status, setStatus] = useState<ContactStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState<string | null>(null);
  const limit = 20;

  const { data, isLoading } = useContactMessages({
    status: status === "ALL" ? undefined : status,
    search: debouncedSearch,
    page,
    limit,
  });
  const messages = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Messages</h2>
        <p className="text-muted-foreground">
          Each message from the website contact form is a case: new, read, answered or resolved.
          {data ? ` ${data.newCount} new.` : ""}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-8 w-72"
            placeholder="Name, email or subject"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Select
          value={status}
          onValueChange={(value) => {
            setStatus(value as ContactStatus | "ALL");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            {(Object.keys(STATUS_LABEL) as ContactStatus[]).map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_LABEL[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>From</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Received</TableHead>
              <TableHead className="w-[120px]">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-64 text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-brand-blue" />
                </TableCell>
              </TableRow>
            ) : messages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-64 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <MessageSquare className="h-10 w-10 opacity-20" />
                    <p className="font-medium">No messages here.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              messages.map((m) => (
                <TableRow
                  key={m.id}
                  className="cursor-pointer"
                  onClick={() => setOpenId(m.id)}
                >
                  <TableCell>
                    <span className="block text-sm font-medium">{m.name}</span>
                    <span className="block text-xs text-muted-foreground">{m.email}</span>
                  </TableCell>
                  <TableCell className="max-w-md truncate text-sm">{m.subject}</TableCell>
                  <TableCell className="text-sm whitespace-nowrap">
                    {formatDateTime(m.createdAt)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={m.status} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Pager page={page} pagination={data?.pagination} onPageChange={setPage} isLoading={isLoading} />

      <MessageSheet id={openId} onClose={() => setOpenId(null)} />
    </div>
  );
}

function MessageSheet({ id, onClose }: { id: string | null; onClose: () => void }) {
  const { data: message, isLoading } = useContactMessage(id);
  const { mutate: setStatus, isPending: isUpdating } = useUpdateContactStatus();
  const { mutate: reply, isPending: isReplying } = useReplyToContactMessage();
  const { mutate: logReply, isPending: isLogging } = useLogCustomerReply();
  const { can } = useCan();
  const canWrite = can("inquiries:write");
  const [draft, setDraft] = useState({ html: "", empty: true });
  const [editorKey, setEditorKey] = useState(0);
  const [logText, setLogText] = useState("");
  const [logOpen, setLogOpen] = useState(false);
  const autoRead = useRef<string | null>(null);

  // Opening a new case marks it read, once per case.
  useEffect(() => {
    if (!message || !canWrite || message.status !== "NEW" || autoRead.current === message.id) return;
    autoRead.current = message.id;
    setStatus({ id: message.id, status: "READ", silent: true });
  }, [message, canWrite, setStatus]);

  const send = (): void => {
    if (!id || draft.empty) return;
    reply(
      { id, bodyHtml: draft.html },
      {
        onSuccess: () => {
          setDraft({ html: "", empty: true });
          setEditorKey((k) => k + 1);
        },
      },
    );
  };

  const saveLog = (): void => {
    if (!id || !logText.trim()) return;
    logReply(
      { id, body: logText.trim() },
      {
        onSuccess: () => {
          setLogText("");
          setLogOpen(false);
        },
      },
    );
  };

  const change = (status: ContactStatus): void => {
    if (message) setStatus({ id: message.id, status });
  };

  return (
    <Sheet open={!!id} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>{message?.subject ?? "Message"}</SheetTitle>
          <SheetDescription>
            {message ? `${message.name} · ${message.email}${message.phone ? ` · ${message.phone}` : ""}` : ""}
          </SheetDescription>
        </SheetHeader>

        {isLoading || !message ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-brand-blue" />
          </div>
        ) : (
          <div className="space-y-5 px-4 pb-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <StatusBadge status={message.status} />
                <span className="text-xs text-muted-foreground">
                  Received {formatDateTime(message.createdAt)}
                </span>
              </div>
              {canWrite && (
                <div className="flex gap-2">
                  {message.status === "NEW" && (
                    <Button size="sm" variant="outline" disabled={isUpdating} onClick={() => change("READ")}>
                      <Eye className="mr-1.5 h-4 w-4" />
                      Mark read
                    </Button>
                  )}
                  {message.status === "RESOLVED" ? (
                    <Button size="sm" variant="outline" disabled={isUpdating} onClick={() => change("READ")}>
                      <RotateCcw className="mr-1.5 h-4 w-4" />
                      Reopen
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" disabled={isUpdating} onClick={() => change("RESOLVED")}>
                      <CheckCircle2 className="mr-1.5 h-4 w-4" />
                      Mark resolved
                    </Button>
                  )}
                </div>
              )}
            </div>

            <div className="rounded-lg bg-muted/50 p-3">
              <p className="mb-1 text-xs text-muted-foreground">{message.name} wrote</p>
              <p className="whitespace-pre-wrap text-sm">{message.message}</p>
            </div>

            {(message.replies ?? []).map((r) =>
              r.direction === "INBOUND" ? (
                <div key={r.id} className="rounded-lg border border-amber-300/60 bg-amber-50 p-3">
                  <p className="mb-1 text-xs text-muted-foreground">
                    Customer reply (logged{r.sentByName ? ` by ${r.sentByName}` : ""}) ·{" "}
                    {formatDateTime(r.createdAt)}
                  </p>
                  <p className="whitespace-pre-wrap text-sm">{r.body}</p>
                </div>
              ) : (
                <div key={r.id} className="rounded-lg border border-brand-blue/30 bg-brand-blue/5 p-3">
                  <p className="mb-1 text-xs text-muted-foreground">
                    Our reply{r.sentByName ? ` · ${r.sentByName}` : ""} · {formatDateTime(r.createdAt)}
                  </p>
                  {r.bodyHtml ? (
                    // Sanitized by the server to a short list of formatting tags.
                    <div className="mls-editor text-sm" dangerouslySetInnerHTML={{ __html: r.bodyHtml }} />
                  ) : (
                    <p className="whitespace-pre-wrap text-sm">{r.body}</p>
                  )}
                </div>
              ),
            )}

            {canWrite && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Reply to {message.name}</p>
                <RichTextEditor
                  key={`${message.id}-${editorKey}`}
                  initialContent=""
                  onChange={(html, empty) => setDraft({ html, empty })}
                />
                <p className="text-xs text-muted-foreground">
                  Emailed from the company address with their message quoted. The case is marked answered.
                </p>
                <Button onClick={send} disabled={isReplying || draft.empty}>
                  {isReplying ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Send reply
                </Button>

                <div className="border-t pt-3">
                  {logOpen ? (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Log a customer reply</p>
                      <p className="text-xs text-muted-foreground">
                        Replies by email are not tracked. Paste what they wrote from the mailbox; the case
                        goes back to New.
                      </p>
                      <Textarea
                        rows={4}
                        value={logText}
                        maxLength={10000}
                        onChange={(e) => setLogText(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={saveLog} disabled={isLogging || !logText.trim()}>
                          {isLogging && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Save to case
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setLogOpen(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button size="sm" variant="ghost" onClick={() => setLogOpen(true)}>
                      Log a customer reply
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
