import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api"
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || "";
    const isAuthRequest = requestUrl.includes("/auth/");
    const isAuthPage = window.location.pathname === "/auth";

    if (status === 401 && !isAuthRequest && !isAuthPage) {
      const returnTo = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      window.location.assign(`/auth?redirect=${encodeURIComponent(returnTo)}`);
    }

    return Promise.reject(error);
  },
);

export default api;
