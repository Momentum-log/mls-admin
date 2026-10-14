"use client";

import { useState } from "react";
import { z } from "zod";
import {
  useCreateTaxRule,
  useDeactivateTaxRule,
  useTaxRules,
  useUpdateTaxRule,
} from "@/hooks/admin/use-tax-rules";
import type { CustomerType, TaxRule } from "@/types/tax-rule";
import { formatDate } from "@/utils/format-date";
import { Can } from "@/components/auth/can";
import { Pager } from "@/components/admin/pager";
import { ReasonDialog } from "@/components/admin/reason-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Pencil, Percent, Plus } from "lucide-react";

const ruleSchema = z.object({
  name: z.string().trim().min(1, "Give the rule a name."),
  originCountry: z
    .string()
    .trim()
    .regex(/^[A-Z]{2}$/, "Use a two-letter country code."),
  destinationCountry: z
    .string()
    .trim()
    .regex(/^[A-Z]{2}$/, "Use a two-letter country code."),
  customerType: z.enum(["B2B", "B2C"]),
  vatRate: z.coerce.number().min(0, "0 to 100.").max(100, "0 to 100."),
  description: z.string().trim().optional(),
  reason: z.string().trim().optional(),
});

interface RuleForm {
  name: string;
  originCountry: string;
  destinationCountry: string;
  customerType: CustomerType;
  vatRate: string;
  description: string;
  reason: string;
}

const EMPTY: RuleForm = {
  name: "",
  originCountry: "PL",
  destinationCountry: "",
  customerType: "B2C",
  vatRate: "23",
  description: "",
  reason: "",
};

/** Create, or edit when `rule` is given (route and customer type are fixed then). */
function TaxRuleDialog({
  open,
  rule,
  onOpenChange,
}: {
  open: boolean;
  rule: TaxRule | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{rule ? "Edit tax rule" : "New tax rule"}</DialogTitle>
          <DialogDescription>
            {rule
              ? "Changes apply to new invoices. Issued invoices keep their rate."
              : "One rule per route and customer type."}
          </DialogDescription>
        </DialogHeader>
        {/* Mounted only while open, so each opening starts from the chosen rule. */}
        <TaxRuleForm rule={rule} onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

function TaxRuleForm({
  rule,
  onDone,
}: {
  rule: TaxRule | null;
  onDone: () => void;
}) {
  const [form, setForm] = useState<RuleForm>(
    rule
      ? {
          name: rule.name,
          originCountry: rule.originCountry,
          destinationCountry: rule.destinationCountry,
          customerType: rule.customerType,
          vatRate: String(rule.vatRate),
          description: rule.description ?? "",
          reason: "",
        }
      : EMPTY,
  );
  const [error, setError] = useState<string | null>(null);
  const { mutate: create, isPending: isCreating } = useCreateTaxRule();
  const { mutate: update, isPending: isUpdating } = useUpdateTaxRule();

  const set = (field: keyof RuleForm) => (value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const submit = () => {
    const parsed = ruleSchema.safeParse({
      ...form,
      originCountry: form.originCountry.toUpperCase(),
      destinationCountry: form.destinationCountry.toUpperCase(),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the form.");
      return;
    }
    const v = parsed.data;
    const done = { onSuccess: onDone };
    if (rule) {
      update(
        {
          id: rule.id,
          payload: {
            name: v.name,
            vatRate: v.vatRate,
            description: v.description || undefined,
            reason: v.reason || undefined,
          },
        },
        done,
      );
    } else {
      create(
        {
          name: v.name,
          originCountry: v.originCountry,
          destinationCountry: v.destinationCountry,
          customerType: v.customerType,
          vatRate: v.vatRate,
          description: v.description || undefined,
        },
        done,
      );
    }
  };

  const busy = isCreating || isUpdating;

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <div className="space-y-1.5">
        <Label htmlFor="rule-name">Name</Label>
        <Input
          id="rule-name"
          value={form.name}
          onChange={(e) => set("name")(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="rule-from">From</Label>
          <Input
            id="rule-from"
            maxLength={2}
            disabled={!!rule}
            value={form.originCountry}
            onChange={(e) => set("originCountry")(e.target.value.toUpperCase())}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="rule-to">To</Label>
          <Input
            id="rule-to"
            maxLength={2}
            disabled={!!rule}
            placeholder="DE"
            value={form.destinationCountry}
            onChange={(e) =>
              set("destinationCountry")(e.target.value.toUpperCase())
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label>Customer</Label>
          <Select
            value={form.customerType}
            onValueChange={set("customerType")}
            disabled={!!rule}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="B2C">Private (B2C)</SelectItem>
              <SelectItem value="B2B">Business (B2B)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="rule-rate">VAT rate (%)</Label>
        <Input
          id="rule-rate"
          type="number"
          min={0}
          max={100}
          step="0.01"
          value={form.vatRate}
          onChange={(e) => set("vatRate")(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="rule-description">
          Notes{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Input
          id="rule-description"
          value={form.description}
          onChange={(e) => set("description")(e.target.value)}
        />
      </div>
      {rule && (
        <div className="space-y-1.5">
          <Label htmlFor="rule-reason">
            Why the change{" "}
            <span className="text-muted-foreground font-normal">
              (kept in the audit log)
            </span>
          </Label>
          <Input
            id="rule-reason"
            value={form.reason}
            onChange={(e) => set("reason")(e.target.value)}
          />
        </div>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" disabled={busy}>
          {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {rule ? "Save" : "Create rule"}
        </Button>
      </DialogFooter>
    </form>
  );
}

/**
 * VAT rules: which rate applies per route (origin → destination) and
 * customer type. The tax engine picks the active rule when invoicing.
 */
export default function TaxRulesPage() {
  const [activeOnly, setActiveOnly] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 25;
  const { data, isLoading, isFetching } = useTaxRules({
    activeOnly,
    page,
    limit,
  });
  const rules = data?.data ?? [];

  const [editing, setEditing] = useState<TaxRule | null>(null);
  const [creating, setCreating] = useState(false);
  const [deactivating, setDeactivating] = useState<TaxRule | null>(null);
  const { mutate: deactivate, isPending: isDeactivating } =
    useDeactivateTaxRule();

  const isActive = (rule: TaxRule) =>
    !rule.activeTo || new Date(rule.activeTo) > new Date();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tax Rules</h2>
          <p className="text-muted-foreground">
            The VAT rate per route and customer type.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              id="active-only"
              checked={activeOnly}
              onCheckedChange={(checked) => {
                setActiveOnly(checked);
                setPage(1);
              }}
            />
            <Label htmlFor="active-only">Active only</Label>
          </div>
          <Can do="shipment:write" fallback="disable">
            <Button onClick={() => setCreating(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New rule
            </Button>
          </Can>
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Name</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>VAT</TableHead>
              <TableHead>Valid</TableHead>
              <TableHead className="text-right w-[200px]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-brand-blue" />
                </TableCell>
              </TableRow>
            ) : rules.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Percent className="h-10 w-10 opacity-20" />
                    <p className="font-medium">No tax rules.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              rules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell>
                    <span className="font-medium text-sm">{rule.name}</span>
                    {rule.description && (
                      <span className="block text-xs text-muted-foreground">
                        {rule.description}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {rule.originCountry} → {rule.destinationCountry}
                  </TableCell>
                  <TableCell className="text-sm">{rule.customerType}</TableCell>
                  <TableCell className="text-sm font-medium">
                    {rule.vatRate}%
                  </TableCell>
                  <TableCell className="text-sm">
                    {isActive(rule) ? (
                      <Badge variant="default" className="text-xs">
                        Since {formatDate(rule.activeFrom)}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        Ended {formatDate(rule.activeTo as string)}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {isActive(rule) && (
                      <div className="flex justify-end gap-2">
                        <Can do="shipment:write" fallback="disable">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditing(rule)}
                          >
                            <Pencil className="mr-1 h-3.5 w-3.5" />
                            Edit
                          </Button>
                        </Can>
                        <Can do="shipment:write" fallback="disable">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setDeactivating(rule)}
                          >
                            Deactivate
                          </Button>
                        </Can>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Pager
        page={page}
        pagination={data?.pagination}
        onPageChange={setPage}
        isLoading={isFetching}
      />

      <TaxRuleDialog
        open={creating || !!editing}
        rule={editing}
        onOpenChange={(open) => {
          if (!open) {
            setCreating(false);
            setEditing(null);
          }
        }}
      />

      <ReasonDialog
        open={!!deactivating}
        onOpenChange={(open) => !open && setDeactivating(null)}
        title={`Deactivate "${deactivating?.name ?? ""}"?`}
        description="The rule stops applying now. Invoices already issued keep their rate. Make sure another active rule covers this route."
        label="Reason"
        destructive
        confirmLabel="Deactivate"
        isLoading={isDeactivating}
        onConfirm={(reason) => {
          if (!deactivating) return;
          deactivate(
            { id: deactivating.id, reason: reason || undefined },
            { onSuccess: () => setDeactivating(null) },
          );
        }}
      />
    </div>
  );
}
