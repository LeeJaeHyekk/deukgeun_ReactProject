// ============================================================================
// 공유 API 클라이언트
// ============================================================================

import type { ApiResponse } from "../types"

// API 설정
const API_CONFIG = {
  baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:5000",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
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

  constructor(config = API_CONFIG) {
    this.baseURL = config.baseURL
    this.timeout = config.timeout
    this.defaultHeaders = config.headers
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
    const url = this.buildUrl(endpoint, params)
    const response = await this.request<T>(url, {
      method: "GET",
    })
    return response
  }

  // POST 요청
  async post<T = unknown>(
    endpoint: string,
    data?: unknown
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint)
    const response = await this.request<T>(url, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    })
    return response
  }

  // PUT 요청
  async put<T = unknown>(
    endpoint: string,
    data?: unknown
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint)
    const response = await this.request<T>(url, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    })
    return response
  }

  // DELETE 요청
  async delete<T = unknown>(endpoint: string): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint)
    const response = await this.request<T>(url, {
      method: "DELETE",
    })
    return response
  }

  // PATCH 요청
  async patch<T = unknown>(
    endpoint: string,
    data?: unknown
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint)
    const response = await this.request<T>(url, {
      method: "PATCH",
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
    const url = this.buildUrl(endpoint)
    const formData = new FormData()
    formData.append("file", file)

    const response = await this.request<T>(url, {
      method: "POST",
      body: formData,
      headers: {
        // Content-Type은 브라우저가 자동으로 설정
      },
    })
    return response
  }

  // URL 빌드
  private buildUrl(
    endpoint: string,
    params?: Record<string, string | number | boolean>
  ): string {
    const url = new URL(endpoint, this.baseURL)

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
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.defaultHeaders,
          ...options.headers,
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data as ApiResponse<T>
    } catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new Error("Request timeout")
        }
        throw error
      }

      throw new Error("Unknown error occurred")
    }
  }
}

// 싱글톤 인스턴스
export const apiClient = new ApiClient()

// 기본 export
export default apiClient
