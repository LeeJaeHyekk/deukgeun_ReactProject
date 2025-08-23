// ============================================================================
// 중앙 타입 시스템 - 메인 인덱스
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

// 환경 설정 타입
export type Environment = "development" | "production" | "test"

// 데이터베이스 설정 타입
export interface DatabaseConfig {
  host: string
  port: number
  username: string
  password: string
  database: string
  synchronize: boolean
  logging: boolean
}

// 애플리케이션 설정 타입
export interface AppConfig {
  environment: Environment
  port: number
  jwtSecret: string
  jwtExpiresIn: string
  corsOrigin: string[]
  database: DatabaseConfig
}

// 공통 상태 타입
export interface LoadingState {
  isLoading: boolean
  error?: string
}

// 날짜 관련 타입
export type DateString = string // ISO 8601 형식
export type TimeString = string // HH:mm:ss 형식

// ID 타입
export type ID = number | string

// ============================================================================
// 도메인별 타입 내보내기
// ============================================================================

// 인증 관련 타입
export * from "./auth"

// 레벨 시스템 관련 타입
export * from "./level"

// 워크아웃 관련 타입
export * from "./workout"

// 커뮤니티 관련 타입
export * from "./post"

// 헬스장 관련 타입
export * from "./gym"

// 기계 관련 타입
export * from "./machine"

// 통계 관련 타입
export * from "./stats"

// 계정 복구 관련 타입
export * from "./accountRecovery"
