import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { login, logout, getMe } from "@/api/auth";
import { LoginPayload, AuthResponse } from "@/types/auth";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

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
      router.push("/dashboard");
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
