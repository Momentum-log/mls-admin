import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  getMultiLegShipments,
  getMultiLegShipment,
  confirmHubArrival,
  createLegTwo,
} from "@/lib/api/admin/multi-leg";
import { getApiErrorMessage } from "@/lib/api-error";

const QUEUE_KEY = ["multi-leg"];

/**
 * The ops queue. Defaults to everything waiting on someone.
 *
 * @param status - Optional status filter; replaces the server default.
 */
export const useMultiLegShipments = (status?: string) => {
  return useQuery({
    queryKey: [...QUEUE_KEY, status ?? "default"],
    queryFn: () => getMultiLegShipments(status),
    placeholderData: (previous) => previous,
  });
};

/**
 * One hub-routed shipment with both legs.
 *
 * @param id - Shipment id, or undefined to stay idle.
 */
export const useMultiLegShipment = (id?: string) => {
  return useQuery({
    queryKey: [...QUEUE_KEY, "detail", id],
    queryFn: () => getMultiLegShipment(id as string),
    enabled: !!id,
  });
};

export const useConfirmHubArrival = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => confirmHubArrival(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUEUE_KEY });
      toast.success(data.message || "Hub arrival confirmed");
    },
    onError: (error) => {
      // Every failure here is a 409, including "not found" — the endpoint has
      // no 404 path, so never render this as a missing-record error.
      toast.error(getApiErrorMessage(error, "Could not confirm arrival"));
    },
  });
};

/**
 * Creates leg 2.
 *
 * Deliberately does NOT toast on error: the caller inspects the failure first,
 * because a 409 carrying both prices is a re-pricing decision for ops rather
 * than an error to report. See `parseRepriceError`.
 */
export const useCreateLegTwo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      acceptRepricing,
    }: {
      id: string;
      acceptRepricing?: boolean;
    }) => createLegTwo(id, acceptRepricing ?? false),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUEUE_KEY });
      toast.success(data.message || "Leg 2 created");
    },
  });
};
