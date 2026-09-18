import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getMe,
  identifyAdmin,
  loginStaff,
  logout,
  requestOtp,
  verifyBackupCode,
  verifyOtp,
  verifyTotp,
} from "@/lib/api/auth";
import type { AuthResponse, IdentifyErrorReason } from "@/types/auth";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { getApiErrorBody, getApiErrorMessage } from "@/lib/api-error";
import { clearSession, setSession } from "@/lib/auth/session";

/**
 * Shared tail of every sign-in route.
 *
 * All four — password, emailed code, authenticator, backup code — return the
 * same envelope and land in the same place, so the only thing that differs is
 * how the credential was proved.
 */
function useSignInSuccess() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return (data: AuthResponse) => {
    if (data.token) {
      setSession(data.token, data.session);
    }
    queryClient.setQueryData(["me"], data.admin);
    toast.success("Login successful! Welcome back.");
    router.push("/dashboard");
  };
}

/**
 * Why a lookup was refused, in words.
 *
 * The failure bodies carry a `reason` and no prose, so the copy lives here.
 * The two cases need different answers: one is "check what you typed", the
 * other is "the address is right but the account is switched off", and
 * collapsing them would send a deactivated admin hunting for a typo.
 */
const IDENTIFY_ERRORS: Record<IdentifyErrorReason, string> = {
  ACCOUNT_NOT_FOUND: "We couldn't find an account for that email address.",
  ACCOUNT_INACTIVE:
    "That account is not active. Contact an administrator to restore access.",
};

/**
 * Turns a failed lookup into something worth reading.
 *
 * @param error - The value caught from the lookup.
 * @returns The mapped message, or the server's own wording if it sent any.
 */
export function getIdentifyErrorMessage(error: unknown): string {
  const reason = getApiErrorBody(error)?.reason;
  if (typeof reason === "string" && reason in IDENTIFY_ERRORS) {
    return IDENTIFY_ERRORS[reason as IdentifyErrorReason];
  }
  return getApiErrorMessage(error, "That email address cannot sign in here.");
}

/**
 * Step one of sign-in: asks how this address authenticates.
 *
 * Deliberately quiet on success — the page moves to the next step, which is
 * feedback enough. A toast here would just be noise in front of the thing the
 * admin now has to do.
 */
export const useIdentifyAdmin = () => {
  return useMutation({
    mutationFn: identifyAdmin,
    onError: (error) => {
      toast.error(getIdentifyErrorMessage(error));
    },
  });
};

/** Password sign-in. Staff only — the Super Administrator has no password. */
export const useStaffLogin = () => {
  const onSignedIn = useSignInSuccess();

  return useMutation({
    mutationFn: loginStaff,
    onSuccess: onSignedIn,
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Failed to login"));
    },
  });
};

/**
 * Re-sends the emailed code.
 *
 * Only reachable after the lookup has already confirmed the address belongs to
 * the Super Administrator, so this can say plainly that a code was sent — the
 * hedging the no-oracle `/otp/request` used to require does not apply here.
 */
export const useRequestOtp = () => {
  return useMutation({
    mutationFn: requestOtp,
    onSuccess: () => {
      toast.success("A new code is on its way.", { duration: 5000 });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Failed to request a sign-in code"));
    },
  });
};

/** Exchanges an emailed code for a session. */
export const useVerifyOtp = () => {
  const onSignedIn = useSignInSuccess();

  return useMutation({
    mutationFn: verifyOtp,
    onSuccess: onSignedIn,
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Invalid or expired code"));
    },
  });
};

/** Signs in with an authenticator app code — the path that survives an email outage. */
export const useVerifyTotp = () => {
  const onSignedIn = useSignInSuccess();

  return useMutation({
    mutationFn: verifyTotp,
    onSuccess: onSignedIn,
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Invalid or expired code"));
    },
  });
};

/** Signs in with a single-use backup code. */
export const useVerifyBackupCode = () => {
  const onSignedIn = useSignInSuccess();

  return useMutation({
    mutationFn: verifyBackupCode,
    onSuccess: (data) => {
      onSignedIn(data);
      if (typeof data.backupCodesRemaining === "number") {
        toast(
          `${data.backupCodesRemaining} backup code${
            data.backupCodesRemaining === 1 ? "" : "s"
          } remaining.`,
          { duration: 6000, icon: "🔑" },
        );
      }
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Invalid or already-used code"));
    },
  });
};

/**
 * Ends the session.
 *
 * The server revokes it immediately now, so this is a real request rather than
 * the client-side teardown it used to be. The local teardown still runs in
 * `onSettled` — if the call fails the admin must still end up signed out
 * locally, and the token they are holding is the one thing they can drop
 * without the server's help.
 */
export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  // `boolean | void` so the common case stays `logout()` while
  // `logout(true)` ends every session for the account.
  return useMutation<void, unknown, boolean | void>({
    mutationFn: (all) => logout(all === true),
    onSettled: () => {
      clearSession();
      queryClient.setQueryData(["me"], null);
      queryClient.clear(); // Clear all cache on logout
      router.push("/login");
      toast.success("Logged out successfully");
    },
  });
};

export const useMe = () => {
  return useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
