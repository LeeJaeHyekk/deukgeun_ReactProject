// features/auth/api/authApi.ts
import { api } from "@shared/api"
import { API_ENDPOINTS } from "@shared/config"

// Types
export interface LoginRequest {
  email: string
  password: string
  recaptchaToken: string
}

export interface LoginResponse {
  message: string
  accessToken: string
  user: {
    id: number
    email: string
    nickname: string
  }
}

export interface RegisterRequest {
  email: string
  password: string
  nickname: string
  phone?: string
  gender?: string
  birthday?: Date
  recaptchaToken: string
}

export interface RegisterResponse {
  message: string
  accessToken: string
  user: {
    id: number
    email: string
    nickname: string
  }
}

export interface RefreshResponse {
  message: string
  accessToken: string
}

export interface LogoutResponse {
  message: string
}

// Auth API functions
export const authApi = {
  // Login
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    console.log("✅ 로그인 요청:", data)
    const response = await api.post<LoginResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      data
    )
    console.log("✅ 로그인 응답:", response)
    return response.data.data as LoginResponse
  },

  // Register
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await api.post<RegisterResponse>(
      API_ENDPOINTS.AUTH.REGISTER,
      data
    )
    return response.data.data as RegisterResponse
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
