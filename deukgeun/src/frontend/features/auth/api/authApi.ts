// features/auth/api/authApi.ts
import { api } from "@shared/api";
import { API_ENDPOINTS } from "@shared/config";
import axios, { type AxiosResponse } from "axios";

// Types
export interface LoginRequest {
  email: string;
  password: string;
  recaptchaToken: string;
}

export interface LoginResponse {
  message: string;
  accessToken: string;
  user: {
    id: number;
    email: string;
    nickname: string;
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
  nickname: string;
  recaptchaToken: string;
}

export interface RegisterResponse {
  message: string;
  accessToken: string;
  user: {
    id: number;
    email: string;
    nickname: string;
  };
}

export interface RefreshResponse {
  message: string;
  accessToken: string;
}

export interface LogoutResponse {
  message: string;
}

// Auth API functions
export const authApi = {
  // Login
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    console.log("✅ 로그인 요청:", data);
    const response: AxiosResponse<LoginResponse> = await api.post(
      API_ENDPOINTS.AUTH.LOGIN,
      data
    );
    console.log("✅ 로그인 응답:", response);
    return response.data;
  },

  // Register
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    return api.post<RegisterResponse>(API_ENDPOINTS.AUTH.REGISTER, data);
  },

  // Refresh token
  refreshToken: async (): Promise<RefreshResponse> => {
    return api.post<RefreshResponse>(API_ENDPOINTS.AUTH.REFRESH);
  },

  // Logout
  logout: async (): Promise<LogoutResponse> => {
    return api.post<LogoutResponse>(API_ENDPOINTS.AUTH.LOGOUT);
  },

  // Check if user is authenticated
  checkAuth: async (): Promise<boolean> => {
    try {
      await api.get("/api/auth/check");
      return true;
    } catch {
      return false;
    }
  },
};
