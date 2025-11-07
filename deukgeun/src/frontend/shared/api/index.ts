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
import { config } from '@frontend/shared/config'
import { storage } from '@frontend/shared/lib'
import { globalErrorHandler } from '@pages/Error'
import { tokenManager, isTokenExpired, isTokenExpiringSoon } from '@frontend/shared/utils/tokenManager'
import { analyzeAuthError, isRetryableError, shouldLogout } from '@frontend/shared/utils/errorHandler'
import { getCurrentToken, logTokenStatus } from '@frontend/shared/utils/tokenUtils'

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

// 토큰 갱신 함수 (재시도 로직 포함)
async function performTokenRefresh(retryCount = 0): Promise<string> {
  const maxRetries = 3
  const retryDelay = 1000 * Math.pow(2, retryCount) // 지수 백오프
  
  console.log(`🔄 [TokenRefresh] 토큰 갱신 시작 (시도 ${retryCount + 1}/${maxRetries + 1})`)
  
  try {
    const refreshResponse = await axios.post('/api/auth/refresh', {}, {
      baseURL: config.api.baseURL,
      withCredentials: true, // 쿠키 자동 포함
      timeout: 10000, // 10초 타임아웃
    })
    
    console.log('🔄 [TokenRefresh] 갱신 응답:', refreshResponse.data)
    
    if (!refreshResponse.data.success || !refreshResponse.data.data?.accessToken) {
      throw new Error('유효하지 않은 갱신 응답')
    }
    
    const { accessToken } = refreshResponse.data.data
    console.log('🔄 [TokenRefresh] 새 토큰:', accessToken ? `${accessToken.substring(0, 20)}...` : '없음')

    // 메모리에 새 토큰 저장
    tokenManager.setAccessToken(accessToken)
    
    console.log('✅ [TokenRefresh] 토큰 갱신 성공')
    return accessToken
  } catch (error: any) {
    console.error(`❌ [TokenRefresh] 토큰 갱신 실패 (시도 ${retryCount + 1}):`, error)
    
    // 에러 분석
    const authError = analyzeAuthError(error)
    console.log('🔍 [TokenRefresh] 에러 분석:', authError)
    
    // 토큰 만료나 탈취 의심 에러는 즉시 중단
    if (authError.type === 'token_expired' || authError.type === 'token_invalid') {
      console.log(`🚨 [TokenRefresh] ${authError.type} - 즉시 중단`)
      throw error
    }
    
    // 재시도 가능한 에러인지 확인
    if (isRetryableError(error) && retryCount < maxRetries) {
      console.log(`🔄 [TokenRefresh] ${retryDelay}ms 후 재시도... (${authError.type})`)
      await new Promise(resolve => setTimeout(resolve, retryDelay))
      return performTokenRefresh(retryCount + 1)
    }
    
    // 재시도 불가능한 에러 또는 최대 재시도 횟수 초과
    console.log(`❌ [TokenRefresh] 재시도 불가능: ${authError.message}`)
    throw error
  }
}

// API baseURL을 런타임에 동적으로 결정하는 함수
function getRuntimeBaseURL(): string {
  if (typeof window === 'undefined') {
    return config.api.baseURL
  }
  
  const currentOrigin = window.location.origin
  const isProduction = import.meta.env.MODE === 'production'
  
  // 환경 변수가 있으면 사용
  if (import.meta.env.VITE_BACKEND_URL) {
    const envURL = import.meta.env.VITE_BACKEND_URL
    // 프로덕션에서 HTTP를 HTTPS로 변경
    if (isProduction && envURL.startsWith('http://') && !envURL.includes('localhost')) {
      return currentOrigin
    }
    return envURL
  }
  
  // 프로덕션 환경: 현재 도메인 사용
  if (isProduction) {
    return currentOrigin
  }
  
  // 개발 환경: localhost:5000 또는 현재 도메인
  if (currentOrigin.includes('localhost')) {
    return 'http://localhost:5000'
  }
  
  return currentOrigin
}

// API 클라이언트 설정
const createApiClient = (): AxiosInstance => {
  // 런타임에 baseURL 결정
  const baseURL = getRuntimeBaseURL()
  
  const instance = axios.create({
    baseURL: baseURL,
    timeout: 10000,
    withCredentials: true, // 쿠키 전송을 위해 필요
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  })

  // 요청 인터셉터 - 토큰 추가
instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 통합 토큰 유틸리티 사용 (Redux > memory > localStorage 순서)
    const raw = getCurrentToken()
    
    // 토큰 정제: 따옴표 제거 및 trim (안전하게 처리)
    let token: string | null = null
    if (raw && typeof raw === 'string') {
      token = String(raw).trim().replace(/^"(.*)"$/, '$1')
      // 빈 문자열이거나 공백만 있는 경우 null로 처리
      if (!token || token.length === 0) {
        token = null
      }
    }
    
    // 토큰 상태 로깅
    logTokenStatus()
    
    console.log('🔐 [Axios Interceptor] 요청 정보:', {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      hasHeaders: !!config.headers
    })

    // 전체 URL 구성 (검증 도구 로깅용)
    let fullUrlForLogging = ''
    try {
      if (typeof window !== 'undefined' && (window as any).verification?.addRequest) {
        const method = config.method?.toUpperCase() || 'GET'
        const baseURL = config.baseURL || instance.defaults.baseURL || ''
        const urlPath = config.url || ''
        fullUrlForLogging = urlPath.startsWith('http') ? urlPath : `${baseURL}${urlPath}`
      }
    } catch {
      // URL 구성 실패 - 무시
    }
    
    // Authorization 헤더 설정 (token이 유효한 경우만)
    if (token && typeof token === 'string' && config.headers) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
      console.log('✅ [Axios Interceptor] Authorization 헤더 설정됨:', {
        hasAuthHeader: !!config.headers.Authorization,
        authPreview: config.headers.Authorization ? `${config.headers.Authorization.substring(0, 30)}...` : '없음',
        tokenLength: token.length,
        tokenFormat: token.startsWith('eyJ') ? 'JWT 형식' : '기타'
      })
    }
    
    // 검증 도구에 요청 로깅 (모든 요청 추적, 토큰 유무와 관계없이)
    // fullUrlForLogging이 비어있어도 URL 직접 구성 시도
    let urlToLog = fullUrlForLogging
    if (!urlToLog) {
      const baseURL = config.baseURL || instance.defaults.baseURL || ''
      const urlPath = config.url || ''
      urlToLog = urlPath.startsWith('http') ? urlPath : `${baseURL}${urlPath}`
    }
    
    if (urlToLog) {
      try {
        if (typeof window !== 'undefined' && (window as any).verification?.addRequest) {
          const method = config.method?.toUpperCase() || 'GET'
          console.log(`📡 [Axios Interceptor] 요청 로깅: ${method} ${urlToLog}`)
          ;(window as any).verification.addRequest(urlToLog, method, {
            Authorization: config.headers?.Authorization ? 'Bearer ***' : undefined
          })
        }
      } catch (error) {
        // verification 접근 실패 - 무시 (선택적 기능)
        console.warn('⚠️ [Axios Interceptor] verification 로깅 실패:', error)
      }
    }
    
    if (!token || typeof token !== 'string' || !config.headers) {
      console.log('❌ [Axios Interceptor] 토큰이 없거나 헤더를 설정할 수 없음:', {
        hasToken: !!token,
        tokenType: typeof token,
        hasHeaders: !!config.headers,
        tokenValue: token ? '***' : null
      })
      
      // 토큰 없이도 요청 로깅
      try {
        if (typeof window !== 'undefined' && (window as any).verification?.addRequest) {
          const method = config.method?.toUpperCase() || 'GET'
          const requestUrl: string = config.url || ''
          if (requestUrl && (window as any).verification.addRequest) {
            (window as any).verification.addRequest(requestUrl, method)
          }
        }
      } catch {
        // 무시
      }
    }
    
    return config
  },
  (error: Error) => {
    console.error('❌ [Axios Interceptor] 요청 인터셉터 오류:', error)
    return Promise.reject(error)
  }
)

  // 응답 인터셉터 - 토큰 갱신 및 에러 처리
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      // 304 Not Modified 응답 처리
      if (response.status === 304) {
        console.log('📦 캐시된 데이터 사용:', response.config.url)
        
        // 304 응답의 경우 캐시된 데이터를 반환하되, 
        // 사용자 통계의 경우 강제 새로고침을 위해 특별 처리
        if (response.config.url?.includes('/api/stats/user')) {
          console.log('🔄 사용자 통계 304 응답 - 캐시 무효화 필요')
          // 304 응답이지만 사용자 정보가 변경되었을 수 있으므로
          // 클라이언트에서 강제 새로고침을 트리거할 수 있도록 플래그 설정
          response.data = { ...response.data, _forceRefresh: true }
        }
        
        return response
      }
      
      return response
    },
    async (error: Error & { response?: { status: number } }) => {
      const originalRequest = error as Error & {
        config?: AxiosRequestConfig & { _retry?: boolean }
        response?: { status: number; data?: any }
      }


      // 네트워크 연결 실패 감지
      const errorWithCode = error as Error & { code?: string }
      const isNetworkError = 
        error.message === 'Network Error' || 
        error.message === 'ERR_CONNECTION_REFUSED' ||
        error.message === 'ERR_CONNECTION_RESET' ||
        errorWithCode.code === 'ERR_NETWORK' ||
        !originalRequest.response?.status

      if (isNetworkError) {
        console.warn('🌐 백엔드 서버 연결 실패 - 개발 모드에서 기본값 사용')
        console.warn('에러 상세:', {
          message: error.message,
          code: errorWithCode.code,
          url: originalRequest.config?.url
        })
        // 네트워크 에러는 전역 에러 핸들러에 보고하지 않음
        return Promise.reject(error)
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

      // 401 오류 시 토큰 갱신 처리 (403은 권한 부족으로 별도 처리)
      if (
        originalRequest.response?.status === 401 &&
        !originalRequest.config?._retry &&
        originalRequest.config?.url !== '/api/auth/refresh' // refresh 엔드포인트 자체는 제외
      ) {
        console.log('🔐 [401 처리] 토큰 갱신 시도')
        
        // 이미 갱신 중인 경우 기존 Promise 사용 (Race Condition 방지)
        if (tokenManager.isRefreshing()) {
          console.log('🔄 [401 처리] 이미 갱신 중, 기존 Promise 사용')
          const existingPromise = tokenManager.getRefreshPromise()
          
          if (existingPromise) {
            // 기존 갱신 Promise가 있으면 대기
            try {
              const newToken = await existingPromise
              if (!originalRequest.config) {
                throw new Error('Request config is missing')
              }
              originalRequest.config.headers = originalRequest.config.headers || {}
              originalRequest.config.headers.Authorization = `Bearer ${newToken}`
              console.log('✅ [401 처리] 기존 갱신 Promise 사용, 원래 요청 재시도')
              return instance(originalRequest.config)
            } catch (refreshError) {
              // 기존 갱신 실패 시 대기열에 추가
              return new Promise((resolve, reject) => {
                tokenManager.addToRefreshQueue(
                  (newToken) => {
                    if (!originalRequest.config) {
                      reject(new Error('Request config is missing'))
                      return
                    }
                    originalRequest.config.headers = originalRequest.config.headers || {}
                    originalRequest.config.headers.Authorization = `Bearer ${newToken}`
                    resolve(instance(originalRequest.config))
                  },
                  (refreshError) => {
                    reject(refreshError)
                  }
                )
              })
            }
          } else {
            // 기존 Promise가 없으면 대기열에 추가
            return new Promise((resolve, reject) => {
              tokenManager.addToRefreshQueue(
                (newToken) => {
                  if (!originalRequest.config) {
                    reject(new Error('Request config is missing'))
                    return
                  }
                  originalRequest.config.headers = originalRequest.config.headers || {}
                  originalRequest.config.headers.Authorization = `Bearer ${newToken}`
                  resolve(instance(originalRequest.config))
                },
                (refreshError) => {
                  reject(refreshError)
                }
              )
            })
          }
        }

        // 토큰 갱신 시작 (Race Condition 방지)
        tokenManager.setRefreshing(true)
        const refreshPromise = performTokenRefresh()
        tokenManager.setRefreshPromise(refreshPromise) // Promise 저장

        try {
          const newToken = await refreshPromise
          
          // 대기열에 있는 모든 요청 처리 (에러 처리 개선)
          tokenManager.processRefreshQueue(newToken, undefined)
          
          // 원래 요청의 헤더에 새 토큰 설정
          if (!originalRequest.config) {
            throw new Error('Request config is missing')
          }
          originalRequest.config.headers = originalRequest.config.headers || {}
          originalRequest.config.headers.Authorization = `Bearer ${newToken}`
          
          // 갱신 완료 후 상태 초기화
          tokenManager.setRefreshing(false)
          tokenManager.setRefreshPromise(null)
          
          console.log('✅ [401 처리] 토큰 갱신 성공, 원래 요청 재시도')
          return instance(originalRequest.config)
        } catch (refreshError: unknown) {
          console.log('❌ [401 처리] 토큰 갱신 실패')
          console.error('❌ [401 처리] 갱신 에러:', refreshError)
          
          // 에러 분석
          const authError = analyzeAuthError(refreshError)
          console.log('🔍 [401 처리] 에러 분석:', authError)
          
          // 대기열에 있는 모든 요청에 에러 전파 (에러 처리 개선)
          tokenManager.processRefreshQueue(null, refreshError)
          
          // 갱신 실패 후 상태 초기화
          tokenManager.setRefreshing(false)
          tokenManager.setRefreshPromise(null)
          
            // 토큰 갱신 실패 시에만 로그아웃 (일반 401은 재시도만)
            if (shouldLogout(refreshError)) {
              console.log('🚪 [401 처리] 토큰 갱신 실패로 인한 로그아웃 처리')
              
              // 모든 토큰 데이터 초기화
              tokenManager.clearAll()
              localStorage.clear()
              storage.remove('accessToken')
              storage.remove('user')
              
              // Redux 상태도 초기화
              import('@frontend/shared/store').then(({ store }) => {
                store.dispatch({ type: 'auth/logout/fulfilled' })
              })
              
              window.location.href = '/login'
            } else {
              console.log('⚠️ [401 처리] 토큰 갱신 실패했지만 로그아웃 불필요, 에러만 전파')
            }
          
          return Promise.reject(refreshError)
        } finally {
          // 갱신 완료 후 상태 초기화
          tokenManager.setRefreshing(false)
          tokenManager.setRefreshPromise(null)
        }
      }

      // 403 에러 (권한 부족) - 로그아웃 없이 에러만 전파
      if (originalRequest.response?.status === 403) {
        console.log('🚫 [403 처리] 권한 부족 - 로그아웃 없이 에러 전파')
        const errorMessage = originalRequest.response?.data?.message || '권한이 부족합니다.'
        const permissionError = new Error(errorMessage)
        return Promise.reject(permissionError)
      }

      // 404 에러에 대한 특별 처리
      if (originalRequest.response?.status === 404) {
        const errorMessage = originalRequest.response?.data?.message || '요청한 리소스를 찾을 수 없습니다.'
        console.warn('⚠️ 404 에러:', errorMessage)
        console.warn('⚠️ 404 에러 URL:', originalRequest.config?.url)
        console.warn('⚠️ 404 에러 응답 데이터:', originalRequest.response?.data)
        
        // 404 에러는 전역 에러 핸들러에 보고하지 않음 (토큰 갱신도 시도하지 않음)
        const userFriendlyError = new Error(errorMessage)
        return Promise.reject(userFriendlyError)
      }

      // 429 에러 (Too Many Requests) 처리
      if (originalRequest.response?.status === 429) {
        const retryAfter = originalRequest.response?.data?.retryAfter || 60
        const errorMessage = `요청이 너무 많습니다. ${retryAfter}초 후 다시 시도해주세요.`
        console.warn('⚠️ API 요청 제한:', errorMessage)
        
        // 429 에러는 전역 에러 핸들러에 보고하지 않음
        const rateLimitError = new Error(errorMessage)
        return Promise.reject(rateLimitError)
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
export const apiClient = createApiClient()

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
