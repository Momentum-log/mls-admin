"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ManualPaymentMethod } from "@/types/shipment";

export const MANUAL_PAYMENT_METHODS: {
  value: ManualPaymentMethod;
  label: string;
  description: string;
}[] = [
  { value: "BANK_TRANSFER", label: "Bank transfer", description: "Money arrived in the company account" },
  { value: "CASH", label: "Cash", description: "Paid at the office" },
  { value: "ON_ACCOUNT", label: "On account", description: "Business customer, invoiced later" },
  { value: "WAIVED", label: "Waived", description: "No charge (goodwill, replacement); notes required" },
];

export interface ManualPaymentValue {
  method: ManualPaymentMethod;
  reference: string;
  notes: string;
}

export const EMPTY_MANUAL_PAYMENT: ManualPaymentValue = {
  method: "BANK_TRANSFER",
  reference: "",
  notes: "",
};

/** True when the form can be sent: a reference, and notes when waived. */
export function isManualPaymentValid(value: ManualPaymentValue): boolean {
  if (!value.reference.trim()) return false;
  return value.method !== "WAIVED" || !!value.notes.trim();
}

/** The payload the bypass endpoint takes. */
export function toBypassPayload(value: ManualPaymentValue) {
  return {
    method: value.method,
    reference: value.reference.trim(),
    notes: value.notes.trim() || undefined,
  };
}

interface ManualPaymentFieldsProps {
  value: ManualPaymentValue;
  onChange: (value: ManualPaymentValue) => void;
  idPrefix: string;
}

/**
 * Method, reference and notes for a payment staff record by hand. Used by
 * the shipment bypass and by "Create & bypass" on the new-shipment page.
 */
export function ManualPaymentFields({ value, onChange, idPrefix }: ManualPaymentFieldsProps) {
  const notesRequired = value.method === "WAIVED";
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-method`}>How was it paid?</Label>
        <Select
          value={value.method}
          onValueChange={(method) => onChange({ ...value, method: method as ManualPaymentMethod })}
        >
          <SelectTrigger id={`${idPrefix}-method`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MANUAL_PAYMENT_METHODS.map((m) => (
              <SelectItem key={m.value} value={m.value} description={m.description}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-reference`}>
          Reference <span className="text-destructive">*</span>
        </Label>
        <Input
          id={`${idPrefix}-reference`}
          required
          value={value.reference}
          onChange={(e) => onChange({ ...value, reference: e.target.value })}
          placeholder={value.method === "WAIVED" ? "GOODWILL-2026-11" : "BANK-REF-123"}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-notes`}>
          Notes {notesRequired && <span className="text-destructive">*</span>}
        </Label>
        <Textarea
          id={`${idPrefix}-notes`}
          required={notesRequired}
          value={value.notes}
          onChange={(e) => onChange({ ...value, notes: e.target.value })}
          placeholder={notesRequired ? "Why this shipment is free" : "Optional"}
        />
      </div>
    </div>
  );
}
