import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// Dynamically import auth store to avoid circular deps
let getAuthState: () => {
  accessToken: string | null;
  refreshToken: string | null;
  setTokens: (access: string, refresh: string) => void;
  logout: () => void;
};

export function initApiClient(store: typeof getAuthState) {
  getAuthState = store;
}

// Attach access token
api.interceptors.request.use((config) => {
  if (getAuthState) {
    const { accessToken } = getAuthState();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
  }
  return config;
});

// Handle 401: try refresh, retry original request
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry && getAuthState) {
      originalRequest._retry = true;
      const { refreshToken } = getAuthState();
      if (refreshToken) {
        try {
          const res = await axios.post("/api/auth/refresh", { refreshToken });
          const { accessToken: newAccess, refreshToken: newRefresh } =
            res.data.data;
          getAuthState().setTokens(newAccess, newRefresh);
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return api(originalRequest);
        } catch {
          getAuthState().logout();
        }
      } else {
        getAuthState().logout();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
