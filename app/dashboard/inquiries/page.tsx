"use client";

import { useState } from "react";
import { useInquiries, useUpdateInquiryStatus } from "@/hooks/admin/use-inquiries";
import { useDebounce } from "@/hooks/use-debounce";
import { useCan } from "@/components/auth/can";
import type { FreightType, InquiryStatus } from "@/types/inquiry";
import { formatDateTime } from "@/utils/format-date";
import { Pager } from "@/components/admin/pager";
import { Badge } from "@/components/ui/badge";
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
import { Handshake, Loader2, Search } from "lucide-react";

const STATUS_LABEL: Record<InquiryStatus, string> = {
  PENDING: "New",
  CONTACTED: "Contacted",
  RESOLVED: "Resolved",
};

const FREIGHT_LABEL: Record<FreightType, string> = { ROAD: "Road", SEA: "Sea", AIR: "Air" };

/**
 * Partner enquiries from the public "work with us" form. Staff contact the
 * sender outside the dashboard and track where each one stands here.
 */
export default function InquiriesPage() {
  const [status, setStatus] = useState<InquiryStatus | "ALL">("PENDING");
  const [freight, setFreight] = useState<FreightType | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, isFetching } = useInquiries({
    status: status === "ALL" ? undefined : status,
    freightType: freight === "ALL" ? undefined : freight,
    search: debouncedSearch,
    page,
    limit,
  });
  const inquiries = data?.data ?? [];

  const { mutate: updateStatus, isPending } = useUpdateInquiryStatus();
  const { can } = useCan();
  const canWrite = can("inquiries:write");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Partner Enquiries</h2>
        <p className="text-muted-foreground">Businesses asking to ship freight with MLS.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-8 w-72"
            placeholder="Name, company, email or phone"
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
            setStatus(value as InquiryStatus | "ALL");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            {(Object.keys(STATUS_LABEL) as InquiryStatus[]).map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_LABEL[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={freight}
          onValueChange={(value) => {
            setFreight(value as FreightType | "ALL");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All freight</SelectItem>
            {(Object.keys(FREIGHT_LABEL) as FreightType[]).map((f) => (
              <SelectItem key={f} value={f}>
                {FREIGHT_LABEL[f]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Contact</TableHead>
              <TableHead>Freight</TableHead>
              <TableHead>What they need</TableHead>
              <TableHead>Received</TableHead>
              <TableHead className="w-[160px]">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-brand-blue" />
                </TableCell>
              </TableRow>
            ) : inquiries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Handshake className="h-10 w-10 opacity-20" />
                    <p className="font-medium">No enquiries match.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              inquiries.map((inquiry) => (
                <TableRow key={inquiry.id} className="align-top">
                  <TableCell>
                    <span className="font-medium text-sm">{inquiry.companyName}</span>
                    <span className="block text-xs">{inquiry.name}</span>
                    <a
                      href={`mailto:${inquiry.email}`}
                      className="block text-xs text-brand-blue hover:underline"
                    >
                      {inquiry.email}
                    </a>
                    <a
                      href={`tel:${inquiry.phone}`}
                      className="block text-xs text-muted-foreground hover:underline"
                    >
                      {inquiry.phone}
                    </a>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {inquiry.freightTypes.map((f) => (
                        <Badge key={f} variant="outline" className="text-xs">
                          {FREIGHT_LABEL[f] ?? f}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[360px] text-sm whitespace-pre-wrap">
                    {inquiry.description}
                  </TableCell>
                  <TableCell className="text-sm whitespace-nowrap">
                    {formatDateTime(inquiry.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={inquiry.status}
                      disabled={!canWrite || isPending}
                      onValueChange={(value) =>
                        updateStatus({ id: inquiry.id, status: value as InquiryStatus })
                      }
                    >
                      <SelectTrigger
                        className="h-8"
                        title={canWrite ? undefined : "Requires inquiries:write"}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(STATUS_LABEL) as InquiryStatus[]).map((s) => (
                          <SelectItem key={s} value={s}>
                            {STATUS_LABEL[s]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Pager page={page} pagination={data?.pagination} onPageChange={setPage} isLoading={isFetching} />
    </div>
  );
}
