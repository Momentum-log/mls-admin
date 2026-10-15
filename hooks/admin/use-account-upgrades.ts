import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  approveAccountUpgrade,
  getAccountUpgradeRequests,
  rejectAccountUpgrade,
} from "@/lib/api/admin/account-upgrades";
import { getApiErrorMessage } from "@/lib/api-error";
import type { AccountUpgradeStatus } from "@/types/account-upgrade";

const KEY = ["account-upgrade-requests"];

export const useAccountUpgradeRequests = (params: {
  status?: AccountUpgradeStatus;
  page: number;
  limit: number;
}) => {
  return useQuery({
    queryKey: [...KEY, params],
    queryFn: () => getAccountUpgradeRequests(params),
    placeholderData: (previous) => previous,
  });
};

export const useApproveAccountUpgrade = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => approveAccountUpgrade(id),
    onSuccess: () => toast.success("Now a business account. The customer has been emailed."),
    onError: (error) => toast.error(getApiErrorMessage(error, "Could not approve the request")),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: KEY });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useRejectAccountUpgrade = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, feedback }: { id: string; feedback: string }) =>
      rejectAccountUpgrade(id, feedback),
    onSuccess: () => toast.success("Request rejected. The customer has been emailed."),
    onError: (error) => toast.error(getApiErrorMessage(error, "Could not reject the request")),
    onSettled: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
};
