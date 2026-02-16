import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { login, logout, getMe } from "@/api/auth";
import { LoginPayload, AuthResponse } from "@/types/auth";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";

export const useLogin = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: login,
    onSuccess: (data: AuthResponse) => {
      // Set the cookie if token is returned in the body
      if (data.token) {
        Cookies.set("accessToken", data.token, { expires: 7 }); // 7 days
      }
      queryClient.setQueryData(["me"], data.admin);
      toast.success("Login successful! Welcome back.");
      router.push("/dashboard");
    },
    onError: (error: any) => {
      // The backend returns { error: string, details: string, code: number }
      const message =
        error?.response?.data?.details ||
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error.message ||
        "Failed to login";
      toast.error(message);
    },
  });
};

export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      Cookies.remove("accessToken");
      queryClient.setQueryData(["me"], null);
      router.push("/login");
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
