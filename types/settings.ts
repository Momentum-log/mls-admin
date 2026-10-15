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
