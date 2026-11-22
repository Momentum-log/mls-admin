"use client";

import { useVatMatrix } from "@/hooks/admin/use-vat";
import { MatrixEditor } from "@/components/vat/matrix-editor";
import { VersionHistory } from "@/components/vat/version-history";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Percent } from "lucide-react";

/**
 * VAT rules: which VAT code applies for each route and client type. The
 * accountant can correct a cell here without a software release; every change
 * is a new, audited version.
 */
export default function VatRulesPage() {
  const { data, isLoading } = useVatMatrix();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">VAT Rules</h2>
          <p className="text-muted-foreground">
            The VAT code per route and client type, and the wording printed on invoices.
          </p>
        </div>
        {data && (
          <Badge variant="outline" className="gap-1">
            <Percent className="h-3 w-3" />
            Live: version {data.active.version}
          </Badge>
        )}
      </div>

      {isLoading || !data ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
        </div>
      ) : (
        <Tabs defaultValue="matrix">
          <TabsList>
            <TabsTrigger value="matrix">Matrix</TabsTrigger>
            <TabsTrigger value="history">History ({data.versions.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="matrix" className="pt-4">
            {/* Keyed by version so a publish or revert resets the draft to the new live matrix. */}
            <MatrixEditor key={data.active.id} active={data.active.content} />
          </TabsContent>
          <TabsContent value="history" className="pt-4">
            <VersionHistory versions={data.versions} active={data.active.content} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
