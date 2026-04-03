import axios, { InternalAxiosRequestConfig } from "axios";

/**
 * Modular API client with automated Clerk authentication.
 */
const baseURL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000") + "/api/v1";

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
});

// Singleton storage for the token getter function (provided by AuthInitializer)
let getToken: (() => Promise<string | null>) | null = null;

/**
 * Injects the Clerk token getter into the API client.
 * Called by AuthInitializer component.
 */
export const setTokenGetter = (fn: typeof getToken) => {
  getToken = fn;
};

// --- Request Interceptor ---
apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  if (getToken) {
    try {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.error("[API Client] Error fetching auth token:", err);
    }
  }
  return config;
});

// --- Response Interceptor ---
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Retry once on 401 Unauthorized if a token getter exists
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      getToken
    ) {
      if (originalRequest) {
        originalRequest._retry = true;
        try {
          const token = await getToken();
          if (token) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          }
        } catch (retryError) {
          console.error("[API Client] Token refresh retry failed:", retryError);
        }
      }
    }

    return Promise.reject(error);
  }
);
