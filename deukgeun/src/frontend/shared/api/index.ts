import axios, { AxiosInstance, AxiosResponse, AxiosError } from "axios";
import { config } from "../config";
import { storage, showToast } from "../lib";

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: config.API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = storage.get("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const refreshResponse = await axios.post(
          `${config.API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { accessToken } = refreshResponse.data;
        storage.set("accessToken", accessToken);

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        storage.clear();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    const errorMessage =
      error.response?.data?.message || "서버 오류가 발생했습니다.";
    showToast(errorMessage, "error");

    return Promise.reject(error);
  }
);

// API helper functions
export const api = {
  get: <T = any>(url: string, config?: any) =>
    apiClient.get<T>(url, config).then((response) => response.data),

  post: <T = any>(url: string, data?: any, config?: any) =>
    apiClient.post<T>(url, data, config).then((response) => response.data),

  put: <T = any>(url: string, data?: any, config?: any) =>
    apiClient.put<T>(url, data, config).then((response) => response.data),

  delete: <T = any>(url: string, config?: any) =>
    apiClient.delete<T>(url, config).then((response) => response.data),

  patch: <T = any>(url: string, data?: any, config?: any) =>
    apiClient.patch<T>(url, data, config).then((response) => response.data),
};

export default apiClient;
