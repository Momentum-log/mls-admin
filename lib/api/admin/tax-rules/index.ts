import apiClient from "../../index";
import { unwrapList } from "@/lib/api/_shared/envelope";
import type { Paged } from "@/types/api";
import type {
  CreateTaxRulePayload,
  TaxRule,
  UpdateTaxRulePayload,
} from "@/types/tax-rule";

const BASE_ROUTE = "/admin/tax/rules";

/**
 * Tax rules, newest first. `activeOnly` hides deactivated rules; the server
 * only honours the literal string "true".
 */
export const getTaxRules = async (params: {
  activeOnly: boolean;
  page: number;
  limit: number;
}): Promise<Paged<TaxRule>> => {
  const { data } = await apiClient.get<unknown>(BASE_ROUTE, {
    params: {
      activeOnly: String(params.activeOnly),
      limit: params.limit,
      offset: (params.page - 1) * params.limit,
    },
  });
  return unwrapList<TaxRule>(data);
};

export const createTaxRule = async (payload: CreateTaxRulePayload): Promise<void> => {
  await apiClient.post(BASE_ROUTE, payload);
};

export const updateTaxRule = async (
  id: string,
  payload: UpdateTaxRulePayload,
): Promise<void> => {
  await apiClient.put(`${BASE_ROUTE}/${id}`, payload);
};

/** Ends a rule's validity now. Invoices already issued keep their rate. */
export const deactivateTaxRule = async (id: string, reason?: string): Promise<void> => {
  await apiClient.post(`${BASE_ROUTE}/${id}/deactivate`, reason ? { reason } : {});
};
