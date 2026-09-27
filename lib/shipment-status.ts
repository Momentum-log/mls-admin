/**
 * Single source of truth for shipment lifecycle and payment states.
 *
 * The server's `ShipmentStatus` enum grew from 7 to 15 values when hub routing
 * and post-payment fulfillment shipped. Anything that switches on status —
 * the override modal, list filters, badges — reads from here so a future
 * addition is a one-file change rather than a hunt.
 */

import type { AdminShipment } from "@/types/admin-user-resources";

/** Badge variants available in `components/ui/badge`. */
type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

/** Every value of the server's `ShipmentStatus` enum, in lifecycle order. */
export const SHIPMENT_STATUSES = [
  "CREATED",
  "PAID",
  "AWAITING_FULFILLMENT",
  "PICKUP_SCHEDULED",
  "AWAITING_DROPOFF",
  "AWAITING_HUB_CONFIRMATION",
  "LEG2_PENDING",
  "LEG2_CREATED",
  "IN_TRANSIT",
  "DELIVERED",
  "COMPLETED",
  "CANCELLED",
  "FAILED",
  "PAYMENT_FAILED",
  "CREATION_FAILED",
] as const;

export type ShipmentStatus = (typeof SHIPMENT_STATUSES)[number];

export interface ShipmentStatusMeta {
  value: ShipmentStatus;
  label: string;
  description: string;
  variant: BadgeVariant;
  /**
   * Only reachable on hub-routed shipments. Forcing one of these onto a
   * single-leg shipment produces a state the ops queue will never surface,
   * because that queue filters on `isMultiLeg`.
   */
  multiLegOnly: boolean;
  /** No further automated transitions are expected from this state. */
  terminal: boolean;
}

const META: Record<ShipmentStatus, Omit<ShipmentStatusMeta, "value">> = {
  CREATED: {
    label: "Created",
    description: "Shipment exists but payment has not completed",
    variant: "outline",
    multiLegOnly: false,
    terminal: false,
  },
  PAID: {
    label: "Paid",
    description: "Payment confirmed, label not yet generated",
    variant: "secondary",
    multiLegOnly: false,
    terminal: false,
  },
  AWAITING_FULFILLMENT: {
    label: "Awaiting Fulfillment",
    description: "Label ready; customer choosing pickup or drop-off",
    variant: "secondary",
    multiLegOnly: false,
    terminal: false,
  },
  PICKUP_SCHEDULED: {
    label: "Pickup Scheduled",
    description: "Courier collection confirmed with the carrier",
    variant: "secondary",
    multiLegOnly: false,
    terminal: false,
  },
  AWAITING_DROPOFF: {
    label: "Awaiting Drop-off",
    description: "Customer indicated they will drop the parcel off",
    variant: "secondary",
    multiLegOnly: false,
    terminal: false,
  },
  AWAITING_HUB_CONFIRMATION: {
    label: "Awaiting Hub Confirmation",
    description:
      "Leg 1 delivered to the sorting centre; ops must confirm the parcel physically arrived",
    variant: "secondary",
    multiLegOnly: true,
    terminal: false,
  },
  LEG2_PENDING: {
    label: "Leg 2 Pending",
    description: "Arrival confirmed; leg 2 has not been created yet",
    variant: "secondary",
    multiLegOnly: true,
    terminal: false,
  },
  LEG2_CREATED: {
    label: "Leg 2 Created",
    description: "Second leg dispatched from the sorting centre",
    variant: "default",
    multiLegOnly: true,
    terminal: false,
  },
  IN_TRANSIT: {
    label: "In Transit",
    description: "On the way to its destination",
    variant: "default",
    multiLegOnly: false,
    terminal: false,
  },
  DELIVERED: {
    label: "Delivered",
    description: "Delivered to the recipient",
    variant: "default",
    multiLegOnly: false,
    terminal: false,
  },
  COMPLETED: {
    label: "Completed",
    description: "Finalised and closed",
    variant: "default",
    multiLegOnly: false,
    terminal: true,
  },
  CANCELLED: {
    label: "Cancelled",
    description: "Cancelled — carrier tracking sync stops",
    variant: "destructive",
    multiLegOnly: false,
    terminal: true,
  },
  FAILED: {
    label: "Failed",
    description: "Failed in transit or at the carrier",
    variant: "destructive",
    multiLegOnly: false,
    terminal: true,
  },
  PAYMENT_FAILED: {
    label: "Payment Failed",
    description: "Payment did not go through",
    variant: "destructive",
    multiLegOnly: false,
    terminal: true,
  },
  CREATION_FAILED: {
    label: "Creation Failed",
    description: "The carrier rejected the shipment at creation",
    variant: "destructive",
    multiLegOnly: false,
    terminal: true,
  },
};

/**
 * Looks up display metadata for a status.
 *
 * Falls back to a neutral entry rather than throwing, so an unrecognised value
 * from a newer server renders as itself instead of blanking the row.
 *
 * @param status - Raw status string from the API.
 */
export function getShipmentStatusMeta(status: string): ShipmentStatusMeta {
  const meta = META[status as ShipmentStatus];
  if (meta) return { value: status as ShipmentStatus, ...meta };

  return {
    value: status as ShipmentStatus,
    label: status,
    description: "Unrecognised status — the server may be ahead of this build.",
    variant: "outline",
    multiLegOnly: false,
    terminal: false,
  };
}

/**
 * The full ordered option list, for selects and filters.
 *
 * @param includeMultiLeg - When false, hub-only states are omitted. Pass false
 *   for a single-leg shipment so ops cannot strand it in a multi-leg state.
 */
export function getShipmentStatusOptions(
  includeMultiLeg = true,
): ShipmentStatusMeta[] {
  return SHIPMENT_STATUSES.map((value) => getShipmentStatusMeta(value)).filter(
    (meta) => includeMultiLeg || !meta.multiLegOnly,
  );
}

/** Whether a status is terminal. */
export function isTerminalStatus(status: string): boolean {
  return getShipmentStatusMeta(status).terminal;
}

/** Whether a status only occurs on hub-routed shipments. */
export function isMultiLegStatus(status: string): boolean {
  return getShipmentStatusMeta(status).multiLegOnly;
}

// ─── Payment status ──────────────────────────────────────────────────────────

/** Every value of the server's `PaymentStatus` enum. */
export const PAYMENT_STATUSES = [
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

const PAYMENT_VARIANTS: Record<PaymentStatus, BadgeVariant> = {
  PAID: "default",
  PENDING: "secondary",
  FAILED: "destructive",
  REFUNDED: "outline",
};

/**
 * Badge variant for a payment status.
 *
 * Replaces the three divergent copies of `getPaymentVariant` that each
 * predated `REFUNDED` and fell through to "outline" for it by accident.
 *
 * @param status - Raw payment status from the API.
 */
export function getPaymentStatusVariant(status: string): BadgeVariant {
  return PAYMENT_VARIANTS[status as PaymentStatus] ?? "outline";
}

/**
 * Whether a shipment is hub-routed.
 *
 * The list endpoints do not return `isMultiLeg`, so status is the reliable
 * signal there.
 *
 * @param shipment - A shipment row.
 */
export function isHubRouted(
  shipment: Pick<AdminShipment, "shipmentStatus">,
): boolean {
  return isMultiLegStatus(shipment.shipmentStatus);
}
