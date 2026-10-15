import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  createTaxRule,
  deactivateTaxRule,
  getTaxRules,
  updateTaxRule,
} from "@/lib/api/admin/tax-rules";
import { getApiErrorMessage } from "@/lib/api-error";
import type { CreateTaxRulePayload, UpdateTaxRulePayload } from "@/types/tax-rule";

const KEY = ["tax-rules"];

export const useTaxRules = (params: { activeOnly: boolean; page: number; limit: number }) => {
  return useQuery({
    queryKey: [...KEY, params],
    queryFn: () => getTaxRules(params),
    placeholderData: (previous) => previous,
  });
};

const useTaxRuleMutation = <V,>(
  mutationFn: (variables: V) => Promise<void>,
  success: string,
  failure: string,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => toast.success(success),
    onError: (error) => toast.error(getApiErrorMessage(error, failure)),
    onSettled: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
};

export const useCreateTaxRule = () =>
  useTaxRuleMutation(
    (payload: CreateTaxRulePayload) => createTaxRule(payload),
    "Tax rule created",
    "Could not create the tax rule",
  );

export const useUpdateTaxRule = () =>
  useTaxRuleMutation(
    ({ id, payload }: { id: string; payload: UpdateTaxRulePayload }) =>
      updateTaxRule(id, payload),
    "Tax rule updated",
    "Could not update the tax rule",
  );

export const useDeactivateTaxRule = () =>
  useTaxRuleMutation(
    ({ id, reason }: { id: string; reason?: string }) => deactivateTaxRule(id, reason),
    "Tax rule deactivated",
    "Could not deactivate the tax rule",
  );
