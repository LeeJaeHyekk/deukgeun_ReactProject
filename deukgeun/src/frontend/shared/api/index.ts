// Browser API polyfills for Node.js environment
if (typeof window === 'undefined') {
  global.window = global.window || {}
  global.document = global.document || {}
  global.localStorage = global.localStorage || {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {}
  }
  global.sessionStorage = global.sessionStorage || {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {}
  }
  global.File = global.File || class File {}
  global.StorageEvent = global.StorageEvent || class StorageEvent {}
  global.requestAnimationFrame = global.requestAnimationFrame || (cb => setTimeout(cb, 16))
}

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
      const token = storage.get('accessToken')
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
        response?: { status: number; data?: any }
      }

      // 에러 로깅 개선
      console.error('🚨 API 에러 발생:', {
        url: originalRequest.config?.url,
        method: originalRequest.config?.method,
        status: originalRequest.response?.status,
        message: error.message,
        data: originalRequest.response?.data
      })

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

      // 404 에러에 대한 특별 처리
      if (originalRequest.response?.status === 404) {
        const errorMessage = originalRequest.response?.data?.message || '요청한 리소스를 찾을 수 없습니다.'
        console.warn('⚠️ 404 에러:', errorMessage)
        
        // 사용자에게 친화적인 에러 메시지 제공
        const userFriendlyError = new Error(errorMessage)
        return Promise.reject(userFriendlyError)
      }

      // 500 에러에 대한 특별 처리
      if (originalRequest.response?.status && originalRequest.response.status >= 500) {
        const errorMessage = originalRequest.response?.data?.message || '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
        console.error('🚨 서버 에러:', errorMessage)
        
        const userFriendlyError = new Error(errorMessage)
        return Promise.reject(userFriendlyError)
      }

      return Promise.reject(error)
    }
  )

  return instance
}

// API 클라이언트 인스턴스
const apiClient = createApiClient()

// 타입 안전한 API 메서드들
const api = {
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

// Community specific helpers (백엔드 라우팅 기준으로 통일)
const postsApi = {
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
  my: () => api.get(`/api/posts/my`),
  create: (data: unknown) => api.post(`/api/posts`, data),
  update: (id: number, data: unknown) => api.put(`/api/posts/${id}`, data),
  remove: (id: number) => api.delete(`/api/posts/${id}`),
}

const likesApi = {
  toggle: (postId: number) => api.post<LikeResponse>(`/api/likes/${postId}`), // 토글 방식
}

const commentsApi = {
  list: (postId: number, params?: { page?: number; limit?: number }) =>
    api.get(`/api/comments/${postId}`, { params }),
  create: (postId: number, data: { content: string }) =>
    api.post(`/api/comments/${postId}`, data),
  update: (commentId: number, data: { content: string }) =>
    api.put(`/api/comments/${commentId}`, data),
  remove: (commentId: number) => api.delete(`/api/comments/${commentId}`),
}

// Export all APIs and client
export default apiClient
export { api, postsApi, likesApi, commentsApi }
