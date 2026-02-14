import axios from "axios";
import Cookies from "js-cookie";

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
 * Request interceptor: Attach Authorization header from stored cookie.
 * The backend expects `Authorization: Bearer <token>` on all protected routes.
 */
apiClient.interceptors.request.use((config) => {
  const token = Cookies.get("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Response interceptor: Handle 401 Unauthorized globally.
 * Clears the accessToken cookie before redirecting to prevent
 * an infinite loop with the Next.js middleware.
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.includes("/login")
      ) {
        Cookies.remove("accessToken");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
