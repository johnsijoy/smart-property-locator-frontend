// src/api/axios.js
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000/api/";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Request interceptor: add Authorization token automatically
axiosInstance.interceptors.request.use(
  (config) => {
    // Skip adding token for login/register/refresh endpoints
    if (!config.url.includes("login") && !config.url.includes("register") && !config.url.includes("token")) {
      const access = localStorage.getItem("access");
      if (access) {
        config.headers.Authorization = `Bearer ${access}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response interceptor: handle 401 & refresh token automatically
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 Unauthorized and not retry yet
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("login") &&
      !originalRequest.url.includes("register") &&
      !originalRequest.url.includes("token")
    ) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refresh");
      if (!refreshToken) {
        // No refresh token → logout
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        // Request new access token
        const response = await axios.post(`${API_BASE_URL}token/refresh/`, { refresh: refreshToken });
        const newAccess = response.data.access;

        // Save new token
        localStorage.setItem("access", newAccess);

        // Update Authorization header for axiosInstance and retry original request
        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${newAccess}`;
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh failed → logout
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
