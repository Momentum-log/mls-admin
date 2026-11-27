"use client";

import { useState } from "react";
import {
  useContactMessage,
  useContactMessages,
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
import { Loader2, MessageSquare, Search, Send } from "lucide-react";

const STATUS_LABEL: Record<ContactStatus, string> = {
  NEW: "New",
  REPLIED: "Replied",
  CLOSED: "Closed",
};

/**
 * Messages from the public contact form. Each one is also emailed to the
 * company inbox; staff can answer here and the reply is emailed to the sender.
 */
export default function MessagesPage() {
  const [status, setStatus] = useState<ContactStatus | "ALL">("NEW");
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
          Questions sent through the website contact form.
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
                    <Badge variant={m.status === "NEW" ? "default" : "outline"} className="text-xs">
                      {STATUS_LABEL[m.status]}
                    </Badge>
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
  const { can } = useCan();
  const canWrite = can("inquiries:write");
  const [draft, setDraft] = useState("");

  const send = (): void => {
    if (!id || !draft.trim()) return;
    reply({ id, body: draft.trim() }, { onSuccess: () => setDraft("") });
  };

  return (
    <Sheet open={!!id} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
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
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground">
                {formatDateTime(message.createdAt)}
              </span>
              <Select
                value={message.status}
                disabled={!canWrite || isUpdating}
                onValueChange={(value) => setStatus({ id: message.id, status: value as ContactStatus })}
              >
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(STATUS_LABEL) as ContactStatus[]).map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_LABEL[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <p className="whitespace-pre-wrap rounded-lg bg-muted/50 p-3 text-sm">{message.message}</p>

            {(message.replies ?? []).map((r) => (
              <div key={r.id} className="rounded-lg border border-brand-blue/30 bg-brand-blue/5 p-3">
                <p className="mb-1 text-xs text-muted-foreground">
                  Reply · {formatDateTime(r.createdAt)}
                </p>
                <p className="whitespace-pre-wrap text-sm">{r.body}</p>
              </div>
            ))}

            {canWrite && (
              <div className="space-y-2">
                <Textarea
                  rows={6}
                  placeholder={`Reply to ${message.name}. It is emailed from the company address.`}
                  value={draft}
                  maxLength={5000}
                  onChange={(e) => setDraft(e.target.value)}
                />
                <Button onClick={send} disabled={isReplying || !draft.trim()}>
                  {isReplying ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Send reply
                </Button>
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
