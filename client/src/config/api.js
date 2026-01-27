import axios from "axios";
import { mockStore } from "./mockStore";

const originApi =
  typeof window !== "undefined"
    ? `${window.location.origin}/api`
    : "http://localhost:3001/api";
export const API_URL = import.meta.env?.VITE_API_URL || originApi;

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user?.access_token) {
    config.headers.Authorization = `Bearer ${user.access_token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    // Check if the response is actually HTML (typical when Netlify redirects 404 to index.html)
    if (
      response.headers["content-type"] &&
      response.headers["content-type"].includes("text/html")
    ) {
      return Promise.reject(new Error("HTML response detected"));
    }
    return response;
  },
  async (error) => {
    // Check if we should fallback to mock data (Network Error, 404, or HTML response detected above)
    const isNetworkError = error.message === "Network Error";
    const isHtmlError = error.message === "HTML response detected";
    const is404 = error.response?.status === 404;

    if (isNetworkError || isHtmlError || is404) {
      console.warn(
        "Backend unreachable or missing. Serving mock data for:",
        error.config?.url,
      );

      const url = error.config?.url || "";

      // Artificial delay to simulate network
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (url.includes("/auth/login")) {
        const { username } = JSON.parse(error.config.data || "{}");
        return {
          data: {
            user: { ...mockStore.users[0], username: username || "demo" },
            access_token: "mock_token_123",
          },
        };
      }

      // Handle various endpoints
      if (url.includes("/users")) return { data: mockStore.users };
      if (url.includes("/products")) return { data: mockStore.products };
      if (url.includes("/customers")) return { data: mockStore.customers };
      if (url.includes("/movements")) return { data: mockStore.movements };
      if (url.includes("/backups")) return { data: mockStore.backups };

      // Default success for writes
      if (["post", "put", "delete"].includes(error.config?.method)) {
        return {
          data: { success: true, message: "Operación simulada (Mock)" },
        };
      }
    }

    return Promise.reject(error);
  },
);

export default api;
