// src/api/axios.js
import axios from "axios";

// Base URL pointing to your backend API
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  "https://smart-property-locator-backend-2.onrender.com/api/";

// Create Axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// -----------------------------
// Request interceptor: add Authorization token automatically
// -----------------------------
axiosInstance.interceptors.request.use(
  (config) => {
    // Skip adding token for login/register/refresh endpoints
    if (
      !config.url.includes("login") &&
      !config.url.includes("register") &&
      !config.url.includes("token")
    ) {
      const access = localStorage.getItem("access");
      if (access) {
        config.headers.Authorization = `Bearer ${access}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// -----------------------------
// Response interceptor: handle 401 & refresh token automatically
// -----------------------------
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

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
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        // Correct refresh URL
        const response = await axios.post(
          "https://smart-property-locator-backend-2.onrender.com/api/accounts/token/refresh/",
          { refresh: refreshToken }
        );
        const newAccess = response.data.access;

        localStorage.setItem("access", newAccess);

        // Update headers and retry original request
        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${newAccess}`;
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
