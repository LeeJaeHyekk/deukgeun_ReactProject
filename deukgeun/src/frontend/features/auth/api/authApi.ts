// features/auth/api/authApi.ts
import { api } from "@shared/api"
import { API_ENDPOINTS } from "@shared/config"
import axios from "axios"
import { config } from "@shared/config"
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshResponse,
  LogoutResponse,
} from "@shared/types/auth"

// 백엔드 API 응답과 프론트엔드 타입 간의 호환성을 위한 타입 정의
export interface ApiLoginResponse {
  message: string
  accessToken: string
  user: {
    id: number
    email: string
    nickname: string
  }
}

// 백엔드 실제 응답 타입
export interface BackendLoginResponse {
  success: boolean
  message: string
  accessToken: string
  user: {
    id: number
    email: string
    nickname: string
  }
}

// API 응답 래퍼 타입
export interface ApiResponseWrapper<T> {
  success: boolean
  message: string
  data?: T
  error?: string
}

export interface ApiRegisterResponse {
  message: string
  accessToken: string
  user: {
    id: number
    email: string
    nickname: string
  }
}

// 아이디/비밀번호 찾기 요청 타입
export interface FindIdRequest {
  email: string
  recaptchaToken: string
}

export interface FindPasswordRequest {
  email: string
  recaptchaToken: string
}

// Auth API functions
export const authApi = {
  // Login
  login: async (data: LoginRequest): Promise<ApiLoginResponse> => {
    console.log("✅ 로그인 요청:", data)
    const response = await axios.post<BackendLoginResponse>(
      `${config.API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`,
      data
    )
    console.log("✅ 로그인 응답:", response)
    // 백엔드 응답 구조에 맞게 수정 - data 필드 없이 직접 반환
    return {
      message: response.data.message,
      accessToken: response.data.accessToken,
      user: response.data.user,
    }
  },

  // Register
  register: async (data: RegisterRequest): Promise<ApiRegisterResponse> => {
    const response = await api.post<ApiRegisterResponse>(
      API_ENDPOINTS.AUTH.REGISTER,
      data
    )
    return response.data.data as ApiRegisterResponse
  },

  // Find ID
  findId: async (data: FindIdRequest): Promise<ApiResponseWrapper<{ email: string; nickname: string }>> => {
    console.log("✅ 아이디 찾기 요청:", data)
    const response = await axios.post<ApiResponseWrapper<{ email: string; nickname: string }>>(
      `${config.API_BASE_URL}${API_ENDPOINTS.AUTH.FIND_ID}`,
      data
    )
    console.log("✅ 아이디 찾기 응답:", response)
    return response.data
  },

  // Find Password
  findPassword: async (data: FindPasswordRequest): Promise<ApiResponseWrapper<{ email: string; nickname: string }>> => {
    console.log("✅ 비밀번호 찾기 요청:", data)
    const response = await axios.post<ApiResponseWrapper<{ email: string; nickname: string }>>(
      `${config.API_BASE_URL}${API_ENDPOINTS.AUTH.FIND_PASSWORD}`,
      data
    )
    console.log("✅ 비밀번호 찾기 응답:", response)
    return response.data
  },

  // Refresh token
  refreshToken: async (): Promise<RefreshResponse> => {
    console.log("🔄 refreshToken API 호출 시작")
    console.log("🔄 호출 URL:", API_ENDPOINTS.AUTH.REFRESH)
    console.log(
      "🔄 API_BASE_URL:",
      import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"
    )

    try {
      const response = await api.post<RefreshResponse>(
        API_ENDPOINTS.AUTH.REFRESH
      )
      console.log("✅ refreshToken API 성공:", response)
      return response.data.data as RefreshResponse
    } catch (error: unknown) {
      console.error("❌ refreshToken API 실패:", error)
      console.error("❌ 에러 상세:", {
        status: (error as { response?: { status: number } })?.response?.status,
        statusText: (error as { response?: { statusText: string } })?.response
          ?.statusText,
        data: (error as { response?: { data: unknown } })?.response?.data,
        url: (error as { config?: { url: string } })?.config?.url,
        method: (error as { config?: { method: string } })?.config?.method,
      })
      throw error
    }
  },

  // Logout
  logout: async (): Promise<LogoutResponse> => {
    const response = await api.post<LogoutResponse>(API_ENDPOINTS.AUTH.LOGOUT)
    return response.data.data as LogoutResponse
  },

  // Check if user is authenticated
  checkAuth: async (): Promise<{ message: string; authenticated: boolean }> => {
    const response = await api.get<{ message: string; authenticated: boolean }>(
      API_ENDPOINTS.AUTH.CHECK
    )
    return response.data.data as { message: string; authenticated: boolean }
  },
}
