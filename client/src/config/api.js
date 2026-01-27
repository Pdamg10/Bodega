import axios from "axios";

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
      return Promise.reject(
        new Error(
          "API responded with HTML instead of JSON. Backend might be down or unreachable.",
        ),
      );
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
