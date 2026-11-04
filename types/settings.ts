/**
 * How the price a customer pays is built from the carrier price (W4).
 * - FIXED_MARKUP: the carrier's percent/fixed commission per stage, then the
 *   minimum threshold safety net. The behaviour before W4.
 * - TARGET_UPLIFT: the customer pays carrier x (1 + target%) in total, VAT
 *   included; the handling fee is what is left after VAT.
 * - NONE: no commission, the customer pays the carrier price plus VAT.
 */
export type CommissionMode = "FIXED_MARKUP" | "TARGET_UPLIFT" | "NONE";

/**
 * The global safety net (`GlobalCommission` row). Its field names differ from
 * a carrier's own thresholds (`minRatePln` here, `minRateThresholdPln` there).
 */
export interface GlobalCommissionSettings {
  id?: string;
  minRatePln: number | null;
  minFlatPln: number | null;
  isEurManual: boolean;
  minRateEur: number | null;
  minFlatEur: number | null;
  /** W4. Missing on servers older than mls-server PR #24. */
  mode?: CommissionMode;
  targetUpliftPercent?: number;
  /** Whether the minimum flat commission applies (FIXED_MARKUP only). */
  minThresholdEnabled?: boolean;
}

export interface RouteCommissionOverrides {
  localMinRatePln: number | null;
  localMinFlatPln: number | null;
  isLocalEurManual: boolean;
  localMinRateEur: number | null;
  localMinFlatEur: number | null;

  exportMinRatePln: number | null;
  exportMinFlatPln: number | null;
  isExportEurManual: boolean;
  exportMinRateEur: number | null;
  exportMinFlatEur: number | null;

  importMinRatePln: number | null;
  importMinFlatPln: number | null;
  isImportEurManual: boolean;
  importMinRateEur: number | null;
  importMinFlatEur: number | null;

  // The server names the international route `intl`, unlike the commission
  // stage (`international`). Sending `international*` here saved nothing.
  intlMinRatePln: number | null;
  intlMinFlatPln: number | null;
  isIntlEurManual: boolean;
  intlMinRateEur: number | null;
  intlMinFlatEur: number | null;
}

export interface CarrierCommissionSettings extends RouteCommissionOverrides {
  id?: string;
  carrierId: string;
  minRateThresholdPln: number | null;
  minFlatCommissionPln: number | null;
  isEurManual: boolean;
  minRateThresholdEur: number | null;
  minFlatCommissionEur: number | null;
  /** W4 override; null = use the global mode. */
  commissionMode?: CommissionMode | null;
  /** W4 override; null = use the global target. */
  targetUpliftPercent?: number | null;
}

/** `POST /admin/settings/commission/preview` body. */
export interface CommissionPreviewInput {
  carrierPrice: number;
  carrierSlug: string;
  originCountry: string;
  destCountry: string;
  currency: "PLN" | "EUR";
  /** "S" = business customer. */
  customsType?: string;
}

/** What the customer would see, from the same code checkout uses. */
export interface PriceBreakdown {
  carrier: number;
  handlingFee: number;
  net: number;
  vatRate: number;
  vat: number;
  pickupFee: number;
  total: number;
  currency: string;
}

export interface CommissionPreview {
  settings: { mode: CommissionMode; targetUpliftPercent: number; minThresholdEnabled: boolean };
  commission: number;
  breakdown: PriceBreakdown;
  /** total / carrier - 1, in percent. */
  upliftPercent: number;
}

/** DHL eCommerce settings (`GET/PUT /admin/settings/dhl`). */
export interface DhlSettings {
  /** Fee charged for MLS collecting an export parcel, in PLN. */
  firstMileFeePln: number;
  /** Which hub handoff the collections queue pre-selects. */
  hubHandoffDefault: "COURIER" | "SERVICE_POINT";
  /** Whether VAT is added to the collection fee. */
  applyVat: boolean;
}

/** Payment reminder emails (`/admin/reminder-settings`). */
export interface ReminderSettings {
  isEnabled: boolean;
  /** Hours before the invoice expires that the reminder is sent (1–24). */
  reminderHoursBefore: number;
}
