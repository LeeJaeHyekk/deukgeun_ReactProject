// ============================================================================
// 공통 타입 정의
// ============================================================================

// 기본 유틸리티 타입
export type Nullable<T> = T | null
export type Optional<T> = T | undefined
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

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

// 사용자 역할
export type UserRole = "user" | "admin" | "moderator"

// 성별
export type Gender = "male" | "female" | "other"

// 사용자 기본 정보
export interface User {
  id: number
  email: string
  username: string
  role: UserRole
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// 사용자 프로필
export interface UserProfile {
  id: number
  userId: number
  username: string
  email: string
  firstName?: string
  lastName?: string
  nickname?: string
  avatar?: string
  bio?: string
  gender?: Gender
  birthDate?: Date
  phone?: string
  address?: string
  preferences?: Record<string, unknown>
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
}
