/**
 * VAT matrix, VAT reviews, exchange-rate settings, hidden carrier services,
 * billing settings and the per-order tax detail (server `vat-and-currency`).
 */

export const CLIENT_TYPES = ["B2C", "PL_B2B", "EU_B2B", "NONEU_B2B"] as const;
export type ClientType = (typeof CLIENT_TYPES)[number];

export const ROUTE_TYPES = ["R1", "R2", "R3", "R4", "R5", "R6", "R7"] as const;
export type RouteType = (typeof ROUTE_TYPES)[number];

export const VAT_CODES = ["23", "0", "RC", "NP", "NP_REVIEW"] as const;
export type VatCode = (typeof VAT_CODES)[number];

export const CLIENT_TYPE_LABEL: Record<ClientType, string> = {
  B2C: "Private (B2C)",
  PL_B2B: "Polish business",
  EU_B2B: "EU business",
  NONEU_B2B: "Non-EU business",
};

export const ROUTE_LABEL: Record<RouteType, string> = {
  R1: "Poland to Poland",
  R2: "Poland to another EU country",
  R3: "Another EU country to Poland",
  R4: "Poland and a non-EU country",
  R5: "Another EU country and a non-EU country",
  R6: "Both non-EU",
  R7: "Two EU countries, neither Poland",
};

export const VAT_CODE_LABEL: Record<VatCode, string> = {
  "23": "23% VAT",
  "0": "0% (export proof)",
  RC: "Reverse charge",
  NP: "Not taxable in Poland",
  NP_REVIEW: "Not taxable, review",
};

export interface VatCell {
  code: VatCode;
  /** Used instead of `code` when the journey transits Poland. */
  transitCode?: VatCode;
  /** The accountant has not confirmed this cell; orders raise an alert. */
  accountantPending?: boolean;
}

export type VatCells = Record<RouteType, Record<ClientType, VatCell>>;

export interface VatNote {
  pl: string;
  en: string;
}
export type VatNotes = Record<VatCode, VatNote>;

export interface TransitLane {
  from: string;
  to: string;
}

export interface VatMatrixContent {
  cells: VatCells;
  notes: VatNotes;
  transitLanes: TransitLane[];
}

export interface VatMatrixVersionSummary {
  id: string;
  version: number;
  reason: string;
  createdById: string | null;
  createdAt: string;
  isActive: boolean;
}

/** `GET /admin/vat-matrix` */
export interface VatMatrixOverview {
  active: { id: string; version: number; content: VatMatrixContent };
  versions: VatMatrixVersionSummary[];
}

/** `GET /admin/vat-matrix/versions/:id` */
export interface VatMatrixVersion extends VatMatrixVersionSummary, VatMatrixContent {}

export interface VatMatrixChange {
  route: RouteType;
  client: ClientType;
  from: VatCell;
  to: VatCell;
}

export interface PublishVatMatrixPayload extends VatMatrixContent {
  reason: string;
}

export interface PublishVatMatrixResult {
  version: VatMatrixVersionSummary;
  changes: VatMatrixChange[];
}

export type ReviewStatus = "NONE" | "OPEN" | "RESOLVED";
export type ReviewReason = "NP_REVIEW" | "ACCOUNTANT_PENDING_CELL" | "VALIDATION_UNAVAILABLE";
export type ValidationStatus = "VALID" | "INVALID" | "PENDING" | "UNAVAILABLE" | "NOT_REQUIRED";

export const REVIEW_REASON_LABEL: Record<ReviewReason, string> = {
  NP_REVIEW: "Accepted at 0% VAT, needs accountant review",
  ACCOUNTANT_PENDING_CELL: "Matrix cell not yet confirmed by the accountant",
  VALIDATION_UNAVAILABLE: "Held: tax ID registry was down",
};

/** An `OrderTaxSnapshot` row: what an order was taxed under. */
export interface OrderTaxSnapshot {
  id: string;
  shipmentId: string;
  invoiceId: string | null;
  matrixVersionId: string | null;
  matrixVersion?: { id: string; version: number } | null;
  matrixCell: VatCell | null;
  clientType: ClientType;
  routeType: RouteType;
  transitsPoland: boolean;
  vatCode: VatCode;
  vatRatePercent: number;
  currency: string;
  totalGross: number;
  totalNet: number;
  totalVat: number;
  noteEn: string | null;
  notePl: string | null;
  validationProvider: string | null;
  validationStatus: ValidationStatus;
  validationRef: string | null;
  validatedAt: string | null;
  reviewStatus: ReviewStatus;
  reviewReason: ReviewReason | null;
  reviewResolvedAt: string | null;
  reviewNote: string | null;
  proofRequired: boolean;
  proofStatus: "NOT_REQUIRED" | "MISSING" | "OK";
  fxSnapshot: FxQuoteSnapshot | null;
  source: "LIVE" | "BACKFILL";
  createdAt: string;
}

export interface FxQuoteSnapshot {
  rate?: number;
  source?: string;
  effectiveDate?: string | null;
  bufferPercent?: number;
}

export interface VatReview extends OrderTaxSnapshot {
  shipment: {
    id: string;
    customTrackingNumber: string | null;
    userId: string | null;
  };
}

export interface VatReviewList {
  reviews: VatReview[];
  openCount?: number;
}

export type VatReviewFilter = "OPEN" | "RESOLVED" | "ALL";

/** `GET /admin/shipments/:id/tax`: admin-only, carrier cost and margin included. */
export interface ShipmentTax {
  snapshot: OrderTaxSnapshot | null;
  internal: {
    carrierPrice: number | null;
    currency: string;
    total: number;
    net: number;
    vat: number;
    margin: number | null;
  } | null;
}

export interface FxSettings {
  autoEnabled: boolean;
  manualRate: { rate: number; setBy: string | null; setAt: string } | null;
  bufferPercent: number;
}

/** `GET/PUT /admin/settings/fx` */
export interface FxStatus {
  settings: FxSettings;
  effective: {
    source: "NBP" | "MANUAL";
    eurPln: number | null;
    usdPln: number | null;
    effectiveDate: string | null;
    stale: boolean;
    staleAfterDays: number;
  };
  history: Array<{ pair: string; mid: number; effectiveDate: string; source: string }>;
}

export interface FxSettingsUpdate {
  autoEnabled?: boolean;
  /** PLN per EUR, or null to clear. */
  manualRate?: number | null;
  bufferPercent?: number;
}

/** `{ fedex: ["INTERNATIONAL_FIRST"] }` */
export type HiddenServices = Record<string, string[]>;

/** Hide rates slower than N days, or whose name contains a keyword. */
export interface HideRateRules {
  maxTransitDays: number | null;
  keywords: string[];
}

export interface VatSimulationInput {
  pickupCountry: string;
  deliveryCountry: string;
  clientType: ClientType;
  viaPolandHub?: boolean;
}

export interface VatSimulation {
  matrixVersion: number;
  decision: {
    routeType: RouteType;
    vatCode: VatCode;
    vatRatePercent: number;
    noteEn: string | null;
    needsReview: boolean;
  };
  seed: { vatCode: VatCode; vatRatePercent: number };
  /** The live matrix gives a different VAT code than the built-in defaults. */
  differsFromSeed: boolean;
}

export interface VatAlertSettings {
  emails: string[];
}

/** `GET/PUT /admin/settings/billing` */
export interface RegistryOutage {
  since: string;
  lastDetail: string;
  alertedAt: string | null;
}

export interface BillingSettingsStatus {
  settings: { addressProofRequired: boolean; enforced: boolean };
  registries: Record<"BIALA_LISTA" | "VIES", { outage: RegistryOutage | null }>;
}

export interface BillingProfile {
  fullName: string;
  street: string;
  postalCode: string;
  city: string;
  countryCode: string;
  email: string;
  phone: string;
  isBusiness: boolean;
  companyName: string | null;
  taxIdType: string | null;
  taxId: string | null;
  lastValidation: {
    provider: string;
    status: ValidationStatus;
    reference: string | null;
    checkedAt: string;
    detail?: string;
  } | null;
  updatedAt: string;
}
