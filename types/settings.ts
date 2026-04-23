export interface GlobalCommissionSettings {
  id?: string;
  minRateThresholdPln: number | null;
  minFlatCommissionPln: number | null;
  isEurManual: boolean;
  minRateThresholdEur: number | null;
  minFlatCommissionEur: number | null;
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

  internationalMinRatePln: number | null;
  internationalMinFlatPln: number | null;
  isInternationalEurManual: boolean;
  internationalMinRateEur: number | null;
  internationalMinFlatEur: number | null;
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
