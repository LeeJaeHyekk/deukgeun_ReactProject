// 프론트엔드 전용 API 클라이언트
class ApiClient {
  private baseURL: string
  private defaultHeaders: Record<string, string>

  constructor() {
    this.baseURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"
    this.defaultHeaders = {
      "Content-Type": "application/json",
    }
  }

  // 인증 토큰 설정
  setAuthToken(token: string) {
    this.defaultHeaders.Authorization = `Bearer ${token}`
  }

  // 인증 토큰 제거
  removeAuthToken() {
    delete this.defaultHeaders.Authorization
  }

  // 쿼리 파라미터를 URL에 추가하는 헬퍼 함수
  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    const url = `${this.baseURL}${endpoint}`
    if (!params) return url

    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value))
      }
    })

    const queryString = searchParams.toString()
    return queryString ? `${url}?${queryString}` : url
  }

  // GET 요청
  async get<T>(
    endpoint: string,
    options?: { params?: Record<string, any> } & RequestInit
  ): Promise<T> {
    const { params, ...fetchOptions } = options || {}
    const url = this.buildUrl(endpoint, params)

    const response = await fetch(url, {
      method: "GET",
      headers: this.defaultHeaders,
      ...fetchOptions,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  // POST 요청
  async post<T>(
    endpoint: string,
    data?: any,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const response = await fetch(url, {
      method: "POST",
      headers: this.defaultHeaders,
      body: data ? JSON.stringify(data) : null,
      ...options,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  // PUT 요청
  async put<T>(
    endpoint: string,
    data?: any,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const response = await fetch(url, {
      method: "PUT",
      headers: this.defaultHeaders,
      body: data ? JSON.stringify(data) : null,
      ...options,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  // DELETE 요청
  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const response = await fetch(url, {
      method: "DELETE",
      headers: this.defaultHeaders,
      ...options,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  // PATCH 요청
  async patch<T>(
    endpoint: string,
    data?: any,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const response = await fetch(url, {
      method: "PATCH",
      headers: this.defaultHeaders,
      body: data ? JSON.stringify(data) : null,
      ...options,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  // 파일 업로드
  async uploadFile<T>(
    endpoint: string,
    file: File,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: this.defaultHeaders.Authorization || "",
      },
      body: formData,
      ...options,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }
}

// 싱글톤 인스턴스 생성
export const apiClient = new ApiClient()

// 기본 export
export default apiClient
