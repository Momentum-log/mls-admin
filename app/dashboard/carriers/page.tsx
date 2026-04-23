"use client";

import { useState } from "react";
import { useCarriers } from "@/hooks/carriers/use-carriers";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Plus,
  Truck,
  MoreHorizontal,
  Settings2,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CarrierDetailSheet from "@/components/carriers/carrier-detail-sheet";
import { Carrier } from "@/types/carriers";
import { formatDateTime } from "@/utils/format-date";

import GlobalCommissionSheet from "@/components/carriers/global-commission-sheet";
import { ShieldAlert } from "lucide-react";

export default function CarriersPage() {
  const { data: carriers, isLoading, isError, error } = useCarriers();
  const [selectedCarrier, setSelectedCarrier] = useState<Carrier | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isGlobalSheetOpen, setIsGlobalSheetOpen] = useState(false);

  const handleCreate = () => {
    setSelectedCarrier(null);
    setIsSheetOpen(true);
  };

  const handleEdit = (carrier: Carrier) => {
    setSelectedCarrier(carrier);
    setIsSheetOpen(true);
  };

  const hasActiveCarriers = carriers?.some((c) => c.isActive && c.slug);
  const carriersWithoutSlug = carriers?.filter((c) => !c.slug);
  const hasConfigErrors = (carriersWithoutSlug?.length ?? 0) > 0;

  if (isError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Carriers</h2>
        </div>
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-6 text-center text-destructive">
          <p className="font-medium">Failed to load carriers.</p>
          <p className="text-sm opacity-80 mt-1">
            {(error as any)?.response?.data?.message ||
              (error as Error)?.message ||
              "Unknown error occurred."}
          </p>
          <Button
            variant="outline"
            className="mt-4 border-destructive/20 hover:bg-destructive/20"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Carriers</h2>
          <p className="text-muted-foreground">
            Manage shipping providers and commission rules.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setIsGlobalSheetOpen(true)}
            className="hidden sm:flex"
          >
            <ShieldAlert className="mr-2 h-4 w-4 text-brand-blue" />
            Global Safety Net
          </Button>
          <Button
            onClick={handleCreate}
            className="bg-brand-blue hover:bg-brand-blue/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Carrier
          </Button>
        </div>
      </div>

      {!isLoading && !hasActiveCarriers && carriers?.length! > 0 && (
        <div className="rounded-md border border-amber-500/50 bg-amber-50 p-4 text-amber-800 flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
          <p className="text-sm font-medium">
            <span className="font-bold">System Warning:</span> No active
            shipping carriers are configured with a valid slug. Users will not
            be able to get shipping estimates.
          </p>
        </div>
      )}

      {!isLoading && hasConfigErrors && (
        <div className="rounded-md border border-destructive/50 bg-destructive/5 p-4 text-destructive flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-destructive animate-pulse shrink-0" />
          <p className="text-sm font-medium">
            <span className="font-bold">Configuration Error:</span>{" "}
            {carriersWithoutSlug?.length} carrier(s) are missing a programmatic
            slug. Please configure them to enable integrations.
          </p>
        </div>
      )}

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Carrier Name</TableHead>
              <TableHead>Programmatic Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Base URL</TableHead>
              <TableHead>API Key (Masked)</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex justify-center items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Loading carriers...
                  </div>
                </TableCell>
              </TableRow>
            ) : carriers?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Truck className="h-8 w-8 opacity-20" />
                    <p>No carriers configured yet.</p>
                    <Button variant="link" onClick={handleCreate}>
                      Add your first carrier
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              carriers?.map((carrier) => (
                <TableRow
                  key={carrier.id}
                  className="group cursor-pointer hover:bg-muted/50"
                  onClick={() => handleEdit(carrier)}
                >
                  <TableCell className="font-bold text-base">
                    {carrier.name}
                  </TableCell>
                  <TableCell>
                    {carrier.slug ? (
                      <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">
                        {carrier.slug}
                      </code>
                    ) : (
                      <span className="text-destructive text-xs font-medium italic">
                        Missing Slug
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={carrier.isActive ? "default" : "secondary"}
                      className={
                        carrier.isActive
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-gray-100 text-gray-500"
                      }
                    >
                      {carrier.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {carrier.baseUrl || "—"}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {carrier.apiKey
                      ? "••••••••" + carrier.apiKey.slice(-4)
                      : "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDateTime(carrier.createdAt)}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(carrier)}>
                          <Settings2 className="mr-2 h-4 w-4" />
                          Configure
                        </DropdownMenuItem>
                        {/* We use the Configure sheet for deletion too */}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CarrierDetailSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        carrier={selectedCarrier}
      />
      <GlobalCommissionSheet
        open={isGlobalSheetOpen}
        onOpenChange={setIsGlobalSheetOpen}
      />
    </div>
  );
}
