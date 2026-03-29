import axios from "axios";

const baseURL =
  (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000") + "/api/v1";

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
});

// A way to inject the token getter from the Clerk hook layer
let getToken: (() => Promise<string | null>) | null = null;

// Promise that resolves when auth is initialized (either user or anonymous)
let resolveAuthReady: (value: boolean) => void;
const authReadyPromise = new Promise<boolean>((resolve) => {
  resolveAuthReady = resolve;
});

export const setTokenGetter = (fn: typeof getToken) => {
  getToken = fn;
  if (fn) resolveAuthReady(true);
};

// Request Interceptor: Automatically inject Bearer token
apiClient.interceptors.request.use(async (config) => {
  // Wait for auth to be ready (up to a timeout to avoid hangs)
  // We only wait if we don't have a token getter yet
  if (!getToken) {
    const timeout = new Promise((resolve) => setTimeout(() => resolve(false), 5000));
    await Promise.race([authReadyPromise, timeout]);
  }

  if (getToken) {
    try {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.error("Error fetching auth token:", err);
    }
  }
  return config;
});

// Response Interceptor: Global Error Handling & Retry Logic
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (axios.isAxiosError(error) && error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // If we have a token getter, try to get a fresh token and retry the request
      if (getToken) {
        try {
          const token = await getToken();
          if (token) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          }
        } catch (retryError) {
          console.error("Retry failed after token refresh:", retryError);
        }
      }
      
      console.error("Unauthorized access - session might have expired");
    }
    return Promise.reject(error);
  },
);
