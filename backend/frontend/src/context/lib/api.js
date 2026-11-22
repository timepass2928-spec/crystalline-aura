import axios from "axios";

const API_BASE =
  (process.env.REACT_APP_BACKEND_URL || "").trim().replace(/\/+$/, "") + "/api";

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

let refreshingPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const url = original?.url || "";
    const isAuthEndpoint =
      url.includes("/auth/login") ||
      url.includes("/auth/refresh") ||
      url.includes("/auth/logout");

    if (error.response?.status === 401 && !original?._retry && !isAuthEndpoint) {
      original._retry = true;
      try {
        if (!refreshingPromise) {
          refreshingPromise = api.post("/auth/refresh").finally(() => {
            refreshingPromise = null;
          });
        }
        await refreshingPromise;
        return api(original);
      } catch {
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
