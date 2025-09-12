import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios'
import { config } from '@shared/config'
import { storage } from '@shared/lib'
import { globalErrorHandler } from '@pages/Error'

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

// 좋아요 응답 타입
export interface LikeResponse {
  success: boolean
  message: string
  data: {
    isLiked: boolean
    likeCount: number
  }
}

// API 클라이언트 설정
const createApiClient = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: config.api.baseURL,
    timeout: 10000,
    withCredentials: true, // 쿠키 전송을 위해 필요
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // 요청 인터셉터 - 토큰 추가
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const rawToken = storage.get('accessToken')
      const token =
        rawToken && typeof rawToken === 'string'
          ? rawToken.startsWith('"') && rawToken.endsWith('"')
            ? rawToken.slice(1, -1)
            : rawToken
          : null
      console.log(
        'API 요청 인터셉터 - 토큰:',
        token ? `${token.substring(0, 20)}...` : '없음'
      )
      console.log('요청 URL:', config.url)
      console.log('요청 메서드:', config.method)

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
        console.log('Authorization 헤더 설정됨')
      } else {
        console.log('토큰이 없거나 헤더를 설정할 수 없음')
      }
      return config
    },
    (error: Error) => {
      console.error('요청 인터셉터 오류:', error)
      return Promise.reject(error)
    }
  )

  // 응답 인터셉터 - 토큰 갱신 및 에러 처리
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response
    },
    async (error: Error & { response?: { status: number } }) => {
      const originalRequest = error as Error & {
        config?: AxiosRequestConfig & { _retry?: boolean }
        response?: { status: number }
      }

      // 레벨 API 관련 요청은 특별 처리
      const isLevelApiRequest =
        originalRequest.config?.url?.includes('/api/level/')

      // 전역 에러 핸들러에 에러 보고 (레벨 API 제외)
      if (originalRequest.response?.status && !isLevelApiRequest) {
        globalErrorHandler.manualErrorReport(error, {
          errorType: 'network',
          message: `HTTP ${originalRequest.response.status}: ${error.message}`,
        })
      }

      // 401 또는 403 오류 시 토큰 갱신 시도
      if (
        (originalRequest.response?.status === 401 ||
          originalRequest.response?.status === 403) &&
        !originalRequest.config?._retry &&
        originalRequest.config?.url !== '/api/auth/refresh' // refresh 엔드포인트 자체는 제외
      ) {
        originalRequest.config = originalRequest.config || {}
        originalRequest.config._retry = true

        try {
          console.log('🔄 토큰 갱신 시도...')
          const refreshResponse = await instance.post('/api/auth/refresh')
          const { accessToken } = refreshResponse.data.data

          console.log('✅ 토큰 갱신 성공, 새 토큰 설정')
          storage.set('accessToken', accessToken)

          // 원래 요청의 헤더에 새 토큰 설정
          if (originalRequest.config.headers) {
            originalRequest.config.headers.Authorization = `Bearer ${accessToken}`
          }

          console.log('🔄 원래 요청 재시도')
          return instance(originalRequest.config)
        } catch (refreshError: unknown) {
          // 토큰 갱신 실패 시 로그아웃
          console.log('❌ 토큰 갱신 실패, 로그아웃 처리')
          storage.remove('accessToken')
          storage.remove('user')
          window.location.href = '/login'
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
    sort?: 'latest' | 'popular'
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
  like: (postId: number) => api.post<LikeResponse>(`/api/likes/${postId}`),
  unlike: (postId: number) => api.delete<LikeResponse>(`/api/likes/${postId}`),
  toggle: (postId: number) => api.post<LikeResponse>(`/api/likes/${postId}`), // 토글 방식
}

export const commentsApi = {
  list: (postId: number, params?: { page?: number; limit?: number }) =>
    api.get(`/api/comments/${postId}`, { params }),
  create: (postId: number, data: { content: string }) =>
    api.post(`/api/comments/${postId}`, data),
  remove: (commentId: number) => api.delete(`/api/comments/${commentId}`),
}

export default apiClient
