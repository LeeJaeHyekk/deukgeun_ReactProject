import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios"
import { config } from "@shared/config"
import { storage } from "@shared/lib"

// API 응답 타입 정의
export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
  error?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// API 클라이언트 설정
const createApiClient = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: config.API_BASE_URL,
    timeout: 10000,
    withCredentials: true, // 쿠키 전송을 위해 필요
    headers: {
      "Content-Type": "application/json",
    },
  })

  // 요청 인터셉터 - 토큰 추가
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = storage.get("accessToken")
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error: Error) => {
      return Promise.reject(error)
    }
  )

  // 응답 인터셉터 - 토큰 갱신
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response
    },
    async (error: Error & { response?: { status: number } }) => {
      const originalRequest = error as Error & {
        config?: AxiosRequestConfig & { _retry?: boolean }
        response?: { status: number }
      }

      if (
        originalRequest.response?.status === 401 &&
        !originalRequest.config?._retry &&
        originalRequest.config?.url !== "/api/auth/refresh" // refresh 엔드포인트 자체는 제외
      ) {
        originalRequest.config = originalRequest.config || {}
        originalRequest.config._retry = true

        try {
          const refreshResponse = await instance.post("/api/auth/refresh")
          const { accessToken } = refreshResponse.data.data

          storage.set("accessToken", accessToken)

          if (originalRequest.config.headers) {
            originalRequest.config.headers.Authorization = `Bearer ${accessToken}`
          }

          return instance(originalRequest.config)
        } catch (refreshError: unknown) {
          // 토큰 갱신 실패 시 로그아웃
          console.log("토큰 갱신 실패, 로그아웃 처리")
          storage.remove("accessToken")
          storage.remove("user")
          window.location.href = "/login"
          return Promise.reject(refreshError)
        }
      }

      return Promise.reject(error)
    }
  )

  return instance
}

// API 클라이언트 인스턴스
const apiClient = createApiClient()

// 타입 안전한 API 메서드들
export const api = {
  get: <T = unknown>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<ApiResponse<T>>> => {
    return apiClient.get<ApiResponse<T>>(url, config)
  },

  post: <T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<ApiResponse<T>>> => {
    return apiClient.post<ApiResponse<T>>(url, data, config)
  },

  put: <T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<ApiResponse<T>>> => {
    return apiClient.put<ApiResponse<T>>(url, data, config)
  },

  delete: <T = unknown>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<ApiResponse<T>>> => {
    return apiClient.delete<ApiResponse<T>>(url, config)
  },

  patch: <T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<ApiResponse<T>>> => {
    return apiClient.patch<ApiResponse<T>>(url, data, config)
  },
}

// Community specific helpers
export const postsApi = {
  list: (params?: {
    category?: string
    q?: string
    sort?: "latest" | "popular"
    page?: number
    limit?: number
  }) => api.get(`/api/posts`, { params }),
  categories: () => api.get(`/api/posts/categories`),
  categoriesLive: () => api.get(`/api/posts/categories/live`),
  detail: (id: number) => api.get(`/api/posts/${id}`),
  create: (data: unknown) => api.post(`/api/posts`, data),
  update: (id: number, data: unknown) => api.put(`/api/posts/${id}`, data),
  remove: (id: number) => api.delete(`/api/posts/${id}`),
}

export const likesApi = {
  like: (postId: number) => api.post(`/api/likes/${postId}`),
  unlike: (postId: number) => api.delete(`/api/likes/${postId}`),
}

export const commentsApi = {
  list: (postId: number, params?: { page?: number; limit?: number }) =>
    api.get(`/api/comments/${postId}`, { params }),
  create: (postId: number, data: { content: string }) =>
    api.post(`/api/comments/${postId}`, data),
  remove: (commentId: number) => api.delete(`/api/comments/${commentId}`),
}

export default apiClient
