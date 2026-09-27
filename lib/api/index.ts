import axios from "axios";
import {
  clearSession,
  getToken,
  setSignOutReason,
  touchSession,
} from "@/lib/auth/session";
import type { AdminAuthErrorCode } from "@/types/auth";

/**
 * Configured Axios instance for all API requests.
 * Automatically attaches the Bearer token from the accessToken cookie
 * and handles global 401 errors by clearing the session and redirecting.
 */
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

/**
 * The sign-in routes, which take credentials rather than a session.
 *
 * A 401 from one of these means "wrong code" and belongs to the form that
 * asked for it — bouncing to /login would wipe the half-finished flow and
 * replace a precise message with a generic one. Every other 401 means the
 * session is gone and does warrant a sign-out.
 */
const CREDENTIAL_ROUTES = [
  "/admin/auth/login",
  "/admin/auth/otp/request",
  "/admin/auth/otp/verify",
  "/admin/auth/totp/verify",
  "/admin/auth/backup-code/verify",
];

function isCredentialRoute(url?: string): boolean {
  if (!url) return false;
  return CREDENTIAL_ROUTES.some((route) => url.startsWith(route));
}

/**
 * Request interceptor: Attach Authorization header from stored cookie.
 * The backend expects `Authorization: Bearer <token>` on all protected routes.
 */
apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Response interceptor.
 *
 * On success it slides the token cookie forward, because the request that just
 * succeeded also pushed the server's idle deadline back an hour.
 *
 * On 401 it clears the session and redirects, stashing the server's reason so
 * the login page can explain itself. `SESSION_SUPERSEDED` in particular is the
 * difference between "something went wrong" and "you signed in on another
 * machine", and it is how an admin notices a sign-in they did not make.
 */
apiClient.interceptors.response.use(
  (response) => {
    touchSession();
    return response;
  },
  (error) => {
    // Globally rewrite the error.message to use the server's descriptive message
    if (error.response?.data) {
      const data = error.response.data;
      const serverMessage = data.details || data.message || data.error;
      if (serverMessage && typeof serverMessage === "string") {
        error.message = serverMessage;
      }
    }

    if (
      error.response?.status === 401 &&
      !isCredentialRoute(error.config?.url) &&
      typeof window !== "undefined" &&
      !window.location.pathname.startsWith("/login")
    ) {
      const data = error.response.data ?? {};
      // `code` and `reason` carry the same value for one release; `reason` is
      // the field the contract converges on, so prefer it and fall back.
      const code = (data.reason ?? data.code) as AdminAuthErrorCode | undefined;

      setSignOutReason({
        code: typeof code === "string" ? code : undefined,
        message: typeof data.message === "string" ? data.message : undefined,
      });
      clearSession();
      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);

export default apiClient;
