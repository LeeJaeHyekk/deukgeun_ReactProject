// ============================================================================
// 공유 API 클라이언트
// ============================================================================

import type { ApiResponse } from '../types'
import { getBackendUrl } from '../utils/serverDiscovery'

// API 설정
const API_CONFIG = {
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
}

// API 에러 타입
export interface ApiError {
  message: string
  statusCode: number
  error?: string
}

// API 클라이언트 클래스
class ApiClient {
  private baseURL: string
  private timeout: number
  private defaultHeaders: Record<string, string>
  private dynamicDiscovery: boolean

  constructor(config = API_CONFIG) {
    this.baseURL = config.baseURL
    this.timeout = config.timeout
    this.defaultHeaders = config.headers
    this.dynamicDiscovery = !import.meta.env.VITE_BACKEND_URL // 환경 변수가 없으면 동적 발견 사용
  }

  // 동적 서버 URL 가져오기
  private async getServerUrl(): Promise<string> {
    console.log(
      '🔍 [ApiClient] getServerUrl called, dynamicDiscovery:',
      this.dynamicDiscovery
    )

    if (this.dynamicDiscovery) {
      try {
        console.log('🔍 [ApiClient] Starting dynamic server discovery...')
        const discoveredUrl = await getBackendUrl()
        console.log('✅ [ApiClient] Server discovered:', discoveredUrl)
        return discoveredUrl
      } catch (error) {
        console.warn(
          '⚠️ [ApiClient] Failed to discover backend server, using default URL:',
          error
        )
        return this.baseURL
      }
    }

    console.log('🔧 [ApiClient] Using static URL:', this.baseURL)
    return this.baseURL
  }

  // 인증 토큰 설정
  setAuthToken(token: string) {
    this.defaultHeaders.Authorization = `Bearer ${token}`
  }

  // 인증 토큰 제거
  clearAuthToken() {
    delete this.defaultHeaders.Authorization
  }

  // 요청 헤더 설정
  setHeaders(headers: Record<string, string>) {
    this.defaultHeaders = { ...this.defaultHeaders, ...headers }
  }

  // GET 요청
  async get<T = unknown>(
    endpoint: string,
    params?: Record<string, string | number | boolean>
  ): Promise<ApiResponse<T>> {
    const url = await this.buildUrl(endpoint, params)
    const response = await this.request<T>(url, {
      method: 'GET',
    })
    return response
  }

  // POST 요청
  async post<T = unknown>(
    endpoint: string,
    data?: unknown
  ): Promise<ApiResponse<T>> {
    const url = await this.buildUrl(endpoint)
    const response = await this.request<T>(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
    return response
  }

  // PUT 요청
  async put<T = unknown>(
    endpoint: string,
    data?: unknown
  ): Promise<ApiResponse<T>> {
    const url = await this.buildUrl(endpoint)
    const response = await this.request<T>(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
    return response
  }

  // DELETE 요청
  async delete<T = unknown>(endpoint: string): Promise<ApiResponse<T>> {
    const url = await this.buildUrl(endpoint)
    const response = await this.request<T>(url, {
      method: 'DELETE',
    })
    return response
  }

  // PATCH 요청
  async patch<T = unknown>(
    endpoint: string,
    data?: unknown
  ): Promise<ApiResponse<T>> {
    const url = await this.buildUrl(endpoint)
    const response = await this.request<T>(url, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
    return response
  }

  // 파일 업로드
  async upload<T = unknown>(
    endpoint: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<T>> {
    const url = await this.buildUrl(endpoint)
    const formData = new FormData()
    formData.append('file', file)

    const response = await this.request<T>(url, {
      method: 'POST',
      body: formData,
      headers: {
        // Content-Type은 브라우저가 자동으로 설정
      },
    })
    return response
  }

  // URL 빌드
  private async buildUrl(
    endpoint: string,
    params?: Record<string, string | number | boolean>
  ): Promise<string> {
    const serverUrl = await this.getServerUrl()
    const url = new URL(endpoint, serverUrl)

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value))
        }
      })
    }

    return url.toString()
  }

  // 실제 요청 처리
  private async request<T>(
    url: string,
    options: RequestInit
  ): Promise<ApiResponse<T>> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      // 자동으로 인증 토큰 설정
      const headers = await this.getRequestHeaders(options.headers)

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
        credentials: 'include', // 쿠키 포함하여 전송
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        // 에러 응답의 본문을 읽어서 실제 에러 메시지 추출
        let errorMessage = `HTTP error! status: ${response.status}`
        let errorData: any = null

        try {
          const errorText = await response.text()
          if (errorText) {
            try {
              errorData = JSON.parse(errorText)
              errorMessage =
                errorData.message || errorData.error || errorMessage
            } catch {
              errorMessage = errorText
            }
          }
        } catch (parseError) {
          console.warn('에러 응답 파싱 실패:', parseError)
        }

        // 에러 객체에 추가 정보 포함
        const error = new Error(errorMessage) as any
        error.status = response.status
        error.statusText = response.statusText
        error.data = errorData
        error.url = url
        error.method = options.method || 'GET'

        throw error
      }

      const data = await response.json()
      return data as ApiResponse<T>
    } catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout')
        }
        throw error
      }

      throw new Error('Unknown error occurred')
    }
  }

  // 요청 헤더 생성 (인증 토큰 자동 포함)
  private async getRequestHeaders(
    customHeaders?: HeadersInit
  ): Promise<HeadersInit> {
    // localStorage에서 토큰 가져오기
    const token = localStorage.getItem('accessToken')

    console.log('🔐 [ApiClient] 토큰 확인:', {
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 20)}...` : '없음',
      timestamp: new Date().toISOString(),
    })

    const headers: HeadersInit = {
      ...this.defaultHeaders,
      ...(token && { Authorization: `Bearer ${token}` }),
      ...customHeaders,
    }

    console.log('🔐 [ApiClient] 생성된 헤더:', {
      hasAuthorization: !!(headers as any).Authorization,
      authorizationPreview: (headers as any).Authorization
        ? `${String((headers as any).Authorization).substring(0, 30)}...`
        : '없음',
      allHeaders: Object.keys(headers),
    })

    return headers
  }
}

// 싱글톤 인스턴스
export const apiClient = new ApiClient()

// 기본 export
export default apiClient
