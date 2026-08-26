import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { login, logout, getMe } from "@/api/auth";
import { LoginPayload, AuthResponse } from "@/types/auth";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";
import { getApiErrorMessage } from "@/lib/api-error";

/**
 * Cookie lifetime, in days, matching the admin token's one-hour server expiry.
 */
const TOKEN_LIFETIME_DAYS = 1 / 24;

export const useLogin = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: login,
    onSuccess: (data: AuthResponse) => {
      if (data.token) {
        // Admin tokens are signed with a one-hour expiry. The cookie must not
        // outlive them: the middleware only checks that a cookie exists, so a
        // longer-lived cookie waves the admin into the dashboard with a token
        // the API has already rejected, and every request bounces to login.
        Cookies.set("accessToken", data.token, {
          expires: TOKEN_LIFETIME_DAYS,
          sameSite: "strict",
          secure: window.location.protocol === "https:",
        });
      }
      queryClient.setQueryData(["me"], data.admin);
      toast.success("Login successful! Welcome back.");
      router.push("/dashboard");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Failed to login"));
    },
  });
};

export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      Cookies.remove("accessToken");
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
