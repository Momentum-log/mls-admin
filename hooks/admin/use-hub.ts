import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  getHubConfig,
  setHubRouting,
  setCompeteBestPrice,
  createSortingCenter,
  updateSortingCenter,
  deleteSortingCenter,
} from "@/api/admin/hub";
import type {
  HubToggleResponse,
  CreateSortingCenterPayload,
  UpdateSortingCenterPayload,
} from "@/types/hub";
import { getApiErrorMessage } from "@/lib/api-error";

const HUB_KEY = ["hub-config"];

export const useHubConfig = () => {
  return useQuery({
    queryKey: HUB_KEY,
    queryFn: getHubConfig,
  });
};

/**
 * Surfaces a toggle result honestly.
 *
 * A toggle can succeed at the HTTP level and still change nothing — enabling
 * hub routing with no centre configured, or flipping compete while routing is
 * off. Reporting those as successes would leave an admin believing they had
 * switched something on, so the no-op case is raised as a warning toast and
 * the caller refetches to snap the switch back to reality.
 */
function reportToggle(data: HubToggleResponse): void {
  if (data.effective) {
    toast.success("Setting updated");
    return;
  }

  toast(data.warning ?? "That change had no effect.", {
    icon: "⚠️",
    duration: 6000,
  });
}

export const useSetHubRouting = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (enabled: boolean) => setHubRouting(enabled),
    onSuccess: (data) => {
      reportToggle(data);
      queryClient.invalidateQueries({ queryKey: HUB_KEY });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Failed to update hub routing"));
      queryClient.invalidateQueries({ queryKey: HUB_KEY });
    },
  });
};

export const useSetCompeteBestPrice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (enabled: boolean) => setCompeteBestPrice(enabled),
    onSuccess: (data) => {
      reportToggle(data);
      queryClient.invalidateQueries({ queryKey: HUB_KEY });
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, "Failed to update compete-best-price"),
      );
      queryClient.invalidateQueries({ queryKey: HUB_KEY });
    },
  });
};

export const useCreateSortingCenter = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSortingCenterPayload) =>
      createSortingCenter(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HUB_KEY });
      toast.success("Sorting centre created");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Failed to create sorting centre"));
    },
  });
};

export const useUpdateSortingCenter = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateSortingCenterPayload;
    }) => updateSortingCenter(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HUB_KEY });
      toast.success("Sorting centre updated");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Failed to update sorting centre"));
    },
  });
};

export const useDeleteSortingCenter = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSortingCenter(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HUB_KEY });
      toast.success("Sorting centre deleted");
    },
    onError: (error) => {
      // The 409 for an active centre carries a specific explanation; the
      // shared extractor already prefers the server's own wording.
      toast.error(getApiErrorMessage(error, "Failed to delete sorting centre"));
    },
  });
};
