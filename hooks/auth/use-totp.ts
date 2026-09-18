import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  confirmTotpSetup,
  disableTotp,
  getTotpStatus,
  regenerateBackupCodes,
  startTotpSetup,
} from "@/lib/api/auth";
import { toast } from "react-hot-toast";
import { getApiErrorMessage } from "@/lib/api-error";

const TOTP_STATUS_KEY = ["totp-status"];

/** Enrollment state and remaining backup codes for the signed-in admin. */
export const useTotpStatus = () => {
  return useQuery({
    queryKey: TOTP_STATUS_KEY,
    queryFn: getTotpStatus,
    retry: false,
  });
};

/**
 * Begins enrollment.
 *
 * Deliberately not a query: it mints a new secret each time it is called, so
 * running it on mount or on a refetch would silently discard a secret the
 * admin may already have scanned.
 */
export const useStartTotpSetup = () => {
  return useMutation({
    mutationFn: startTotpSetup,
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Failed to start enrollment"));
    },
  });
};

/** Confirms enrollment with a code from the authenticator, returning backup codes. */
export const useConfirmTotpSetup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: confirmTotpSetup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TOTP_STATUS_KEY });
      toast.success("Authenticator enabled.");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "That code was not accepted"));
    },
  });
};

/** Removes the authenticator. Requires a current code from it. */
export const useDisableTotp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: disableTotp,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TOTP_STATUS_KEY });
      toast.success("Authenticator removed.");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "That code was not accepted"));
    },
  });
};

/** Issues a fresh set of backup codes, invalidating every previous one. */
export const useRegenerateBackupCodes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: regenerateBackupCodes,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TOTP_STATUS_KEY });
      toast.success("New backup codes issued. The old set no longer works.");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "That code was not accepted"));
    },
  });
};
