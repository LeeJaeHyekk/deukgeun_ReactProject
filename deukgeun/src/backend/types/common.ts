// ============================================================================
// 백엔드 공통 타입 정의
// ============================================================================

// API 응답 기본 타입
export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
  error?: string
  statusCode?: number
}

// 페이지네이션 타입
export interface PaginationParams {
  page?: number
  limit?: number
  offset?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// 에러 응답 타입
export interface ErrorResponse {
  success: false
  message: string
  error: string
  statusCode?: number
}

// 공통 상태 타입
export interface LoadingState {
  isLoading: boolean
  error?: string
}

// ID 타입
export type ID = number | string

// 날짜 관련 타입
export type DateString = string // ISO 8601 형식
export type TimeString = string // HH:mm:ss 형식
