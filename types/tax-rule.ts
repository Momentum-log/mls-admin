/**
 * VAT rules the tax engine picks from, per route and customer type.
 */

export type CustomerType = "B2B" | "B2C";

export interface TaxRule {
  id: string;
  name: string;
  originCountry: string;
  destinationCountry: string;
  customerType: CustomerType;
  /** Percent, e.g. 23 for 23%. */
  vatRate: number;
  description: string | null;
  activeFrom: string;
  /** Set once the rule is deactivated. */
  activeTo: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaxRulePayload {
  name: string;
  originCountry: string;
  destinationCountry: string;
  customerType: CustomerType;
  vatRate: number;
  description?: string;
}

/** Route and customer type are fixed once a rule exists; only these change. */
export interface UpdateTaxRulePayload {
  name?: string;
  vatRate?: number;
  description?: string;
  reason?: string;
}
