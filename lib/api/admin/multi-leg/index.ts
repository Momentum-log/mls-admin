import apiClient from "../../index";
import type {
  MultiLegListResponse,
  MultiLegShipmentDetail,
  ConfirmArrivalResponse,
  CreateLegTwoResponse,
  RepriceDetails,
} from "@/types/multi-leg";
import { getApiErrorDetails, hasStatus } from "@/lib/api-error";

const BASE_ROUTE = "/admin/shipments/multi-leg";

/**
 * Fetches the ops queue.
 *
 * With no `status` the server returns everything waiting on someone —
 * `AWAITING_HUB_CONFIRMATION` and `LEG2_PENDING` — oldest first, which is the
 * order the work should be done in. Passing `status` REPLACES that default
 * rather than narrowing it.
 *
 * Requires `shipment:read`.
 *
 * @param status - Optional single status to filter by.
 */
export const getMultiLegShipments = async (
  status?: string,
): Promise<MultiLegListResponse> => {
  const { data } = await apiClient.get<MultiLegListResponse>(BASE_ROUTE, {
    params: status ? { status } : undefined,
  });
  return data;
};

/**
 * Fetches one hub-routed shipment with both legs.
 *
 * The raw response spreads the whole shipment row, which includes the full
 * carrier record and its `apiKey`/`apiSecret`. Those are stripped here so
 * credentials never reach component state or a React devtools inspection.
 *
 * Requires `shipment:read`.
 *
 * @param id - Shipment id.
 */
export const getMultiLegShipment = async (
  id: string,
): Promise<MultiLegShipmentDetail> => {
  const { data } = await apiClient.get<Record<string, unknown>>(
    `${BASE_ROUTE}/${id}`,
  );

  const rawCarrier = data.carrier as
    | { id?: string; name?: string; slug?: string }
    | undefined;

  // The detail endpoint names the customer `user`; the list names it
  // `customer`. Normalised here so components see one field.
  const customer = (data.user ?? data.customer) as
    MultiLegShipmentDetail["customer"];

  return {
    ...(data as unknown as MultiLegShipmentDetail),
    customer,
    carrier: rawCarrier
      ? { id: rawCarrier.id ?? "", name: rawCarrier.name ?? "", slug: rawCarrier.slug }
      : undefined,
  };
};

/**
 * Records that ops has physically seen the parcel at the sorting centre,
 * moving the shipment to `LEG2_PENDING`.
 *
 * Requires `shipment:write`.
 *
 * @param id - Shipment id.
 */
export const confirmHubArrival = async (
  id: string,
): Promise<ConfirmArrivalResponse> => {
  const { data } = await apiClient.post<ConfirmArrivalResponse>(
    `${BASE_ROUTE}/${id}/confirm-arrival`,
  );
  return data;
};

/**
 * Creates the second leg out of the sorting centre.
 *
 * Requires `shipment:write`.
 *
 * @param id - Shipment id.
 * @param acceptRepricing - Proceed even though leg 2 now costs materially more
 *   than the customer was quoted. Only set this after a human has seen both
 *   figures.
 */
export const createLegTwo = async (
  id: string,
  acceptRepricing = false,
): Promise<CreateLegTwoResponse> => {
  const { data } = await apiClient.post<CreateLegTwoResponse>(
    `${BASE_ROUTE}/${id}/create-leg-two`,
    { acceptRepricing },
  );
  return data;
};

/**
 * Detects the "Price Changed" 409 and pulls out both figures.
 *
 * The figures are nested inside `details`, not at the top level, and the
 * shared Axios interceptor only flattens `details` into `error.message` when
 * it is a string — here it is an object, so it must be read directly.
 *
 * @param error - The value caught from `createLegTwo`.
 * @returns The two prices, or null if this was some other failure.
 */
export function parseRepriceError(error: unknown): RepriceDetails | null {
  if (!hasStatus(error, 409)) return null;

  const details = getApiErrorDetails(error);
  if (
    !details ||
    typeof details.quotedPrice !== "number" ||
    typeof details.livePrice !== "number"
  ) {
    return null;
  }

  return {
    message: String(details.message ?? "Leg 2 now costs more than quoted."),
    quotedPrice: details.quotedPrice,
    livePrice: details.livePrice,
    resolution: String(details.resolution ?? ""),
  };
}
