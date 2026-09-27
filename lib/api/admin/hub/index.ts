import apiClient from "../../index";
import type {
  HubConfig,
  HubToggleResponse,
  SortingCenter,
  CreateSortingCenterPayload,
  UpdateSortingCenterPayload,
} from "@/types/hub";

const BASE_ROUTE = "/admin/settings/hub";

/**
 * Fetches everything the hub panel needs in one call: which centre is in
 * effect, whether it came from the database or the environment fallback, both
 * routing switches, and a plain-English summary of what they currently mean.
 *
 * Requires `staff:read`.
 */
export const getHubConfig = async (): Promise<HubConfig> => {
  const { data } = await apiClient.get<HubConfig>(BASE_ROUTE);
  return data;
};

/**
 * Master switch. Off means every quote is direct; on routes international
 * shipments through the sorting centre.
 *
 * Enabling it with no centre configured is a no-op — the response comes back
 * with `effective: false` and a `warning` rather than silently doing nothing.
 *
 * Requires `staff:write`.
 *
 * @param enabled - Desired state.
 */
export const setHubRouting = async (
  enabled: boolean,
): Promise<HubToggleResponse> => {
  const { data } = await apiClient.put<HubToggleResponse>(
    `${BASE_ROUTE}/routing`,
    { enabled },
  );
  return data;
};

/**
 * Compete-best-price. Only meaningful while hub routing is on: off routes
 * every tier through the centre, on lets hub and direct rates compete per tier.
 *
 * Flipping this while hub routing is off is a no-op and says so.
 *
 * Requires `staff:write`.
 *
 * @param enabled - Desired state.
 */
export const setCompeteBestPrice = async (
  enabled: boolean,
): Promise<HubToggleResponse> => {
  const { data } = await apiClient.put<HubToggleResponse>(
    `${BASE_ROUTE}/compete`,
    { enabled },
  );
  return data;
};

/**
 * Creates a sorting centre. Returns 409 "Duplicate Code" when the code is taken.
 *
 * @param payload - Full centre details.
 */
export const createSortingCenter = async (
  payload: CreateSortingCenterPayload,
): Promise<SortingCenter> => {
  const { data } = await apiClient.post<SortingCenter>(
    `${BASE_ROUTE}/centers`,
    payload,
  );
  return data;
};

/**
 * Updates a sorting centre. Setting `isActive` stands every other centre down
 * in the same transaction.
 *
 * @param id - Centre id.
 * @param payload - Partial update.
 */
export const updateSortingCenter = async (
  id: string,
  payload: UpdateSortingCenterPayload,
): Promise<SortingCenter> => {
  const { data } = await apiClient.put<SortingCenter>(
    `${BASE_ROUTE}/centers/${id}`,
    payload,
  );
  return data;
};

/**
 * Deletes a sorting centre.
 *
 * Returns 409 "Centre In Use" for the active centre — removing it would
 * silently revert routing to the environment fallback, or to direct-only.
 *
 * @param id - Centre id.
 */
export const deleteSortingCenter = async (id: string): Promise<void> => {
  await apiClient.delete(`${BASE_ROUTE}/centers/${id}`);
};
