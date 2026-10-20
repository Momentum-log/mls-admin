import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  arrangeHubHandoff,
  getCollections,
  getHubHandoffOptions,
  markCollected,
  markHandedOver,
  setCustomerCollectionFeeWaiver,
  waiveCollectionFee,
} from "@/lib/api/admin/collections";
import { getApiErrorMessage } from "@/lib/api-error";
import type { HubHandoffPayload } from "@/types/collection";

const KEY = ["collections"];

export const useCollections = (status?: string) => {
  return useQuery({
    queryKey: [...KEY, status ?? "open"],
    queryFn: () => getCollections(status),
    placeholderData: (previous) => previous,
  });
};

/** Carrier lookups are live calls, so they are fetched only when the dialog opens. */
export const useHubHandoffOptions = (id: string | null) => {
  return useQuery({
    queryKey: [...KEY, "handoff-options", id],
    queryFn: () => getHubHandoffOptions(id as string),
    enabled: !!id,
    staleTime: 60_000,
  });
};

const useCollectionMutation = <V,>(
  mutationFn: (variables: V) => Promise<unknown>,
  success: string,
  failure: string,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => toast.success(success),
    onError: (error) => toast.error(getApiErrorMessage(error, failure)),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: KEY });
      queryClient.invalidateQueries({ queryKey: ["shipments"] });
    },
  });
};

export const useMarkCollected = () =>
  useCollectionMutation(
    (id: string) => markCollected(id),
    "Marked as at the hub",
    "Could not mark the parcel collected",
  );

export const useMarkHandedOver = () =>
  useCollectionMutation(
    (id: string) => markHandedOver(id),
    "Marked as handed to the carrier. The customer has been told.",
    "Could not mark the parcel handed over",
  );

export const useWaiveCollectionFee = () =>
  useCollectionMutation(
    ({ id, reason }: { id: string; reason?: string }) => waiveCollectionFee(id, reason),
    "Collection fee waived",
    "Could not waive the fee",
  );

export const useArrangeHubHandoff = () =>
  useCollectionMutation(
    ({ id, payload }: { id: string; payload: HubHandoffPayload }) =>
      arrangeHubHandoff(id, payload),
    "Carrier handoff arranged",
    "Could not arrange the handoff",
  );

export const useSetCustomerCollectionFeeWaiver = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, waived }: { userId: string; waived: boolean }) =>
      setCustomerCollectionFeeWaiver(userId, waived),
    onSuccess: (_, { waived }) =>
      toast.success(
        waived
          ? "This customer will not be charged collection fees"
          : "Collection fees apply to this customer again",
      ),
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "Could not update the waiver")),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: KEY });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};
