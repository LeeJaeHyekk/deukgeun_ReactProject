import axios, { AxiosInstance, AxiosResponse, AxiosError } from "axios";
import { config } from "../config";
import { storage, showToast } from "../lib";

// Define error response interface
interface ErrorResponse {
  message: string;
  [key: string]: any;
}

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
        console.log("🔄 API 인터셉터: 토큰 갱신 시도");

        // Try to refresh token - 올바른 경로 사용
        const refreshResponse = await axios.post(
          `${config.API_BASE_URL}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { accessToken } = refreshResponse.data;
        storage.set("accessToken", accessToken);

        console.log("✅ API 인터셉터: 토큰 갱신 성공");

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.log("❌ API 인터셉터: 토큰 갱신 실패", refreshError);

        // Refresh failed, clear storage and redirect to login
        storage.clear();

        // 현재 페이지가 로그인 페이지가 아닌 경우에만 리다이렉트
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    const errorData = error.response?.data as ErrorResponse | undefined;
    const errorMessage = errorData?.message || "서버 오류가 발생했습니다.";
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
