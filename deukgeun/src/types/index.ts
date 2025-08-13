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

// 에러 응답 타입
export interface ErrorResponse {
  success: false
  message: string
  error: string
  statusCode?: number
}

// 사용자 관련 타입
export type UserRole = "user" | "admin"
export type Gender = "male" | "female" | "other"

export interface User {
  id: number
  email: string
  nickname: string
  phone?: string
  gender?: Gender
  birthday?: Date
  profileImage?: string
  role: UserRole
  accessToken?: string
  createdAt: Date
  updatedAt: Date
}

export interface UserProfile extends Omit<User, "accessToken"> {}

// 환경 설정 타입
export type Environment = "development" | "production" | "test"

// 환경 변수 타입 정의
export interface EnvironmentVariables {
  // 기본 환경 변수
  NODE_ENV: Environment
  PORT: string

  // 데이터베이스 설정
  DB_HOST: string
  DB_PORT: string
  DB_USERNAME: string
  DB_PASSWORD: string
  DB_NAME: string

  // JWT 설정
  JWT_SECRET: string
  JWT_EXPIRES_IN: string
  JWT_ACCESS_SECRET: string
  JWT_REFRESH_SECRET: string

  // CORS 설정
  CORS_ORIGIN: string

  // API 키들
  KAKAO_API_KEY: string
  GOOGLE_PLACES_API_KEY: string
  SEOUL_OPENAPI_KEY: string

  // reCAPTCHA 설정
  RECAPTCHA_SECRET: string
  RECAPTCHA_SITE_KEY: string

  // 이메일 설정
  EMAIL_HOST: string
  EMAIL_PORT: string
  EMAIL_USER: string
  EMAIL_PASS: string

  // SMS 설정
  SMS_API_KEY: string
  SMS_API_SECRET: string
  SMS_FROM: string

  // 파일 업로드 설정
  UPLOAD_PATH: string
  MAX_FILE_SIZE: string

  // 레이트 리미팅 설정
  RATE_LIMIT_WINDOW: string
  RATE_LIMIT_MAX: string
}

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

// JWT 설정 타입
export interface JWTConfig {
  secret: string
  expiresIn: string
  accessSecret: string
  refreshSecret: string
}

// API 키 설정 타입
export interface ApiKeyConfig {
  kakao: string
  googlePlaces: string
  seoulOpenApi: string
}

// 보안 설정 타입
export interface SecurityConfig {
  recaptchaSecret: string
  recaptchaSiteKey: string
  rateLimitWindow: number
  rateLimitMax: number
}

// 이메일 설정 타입
export interface EmailConfig {
  host: string
  port: number
  user: string
  pass: string
}

// SMS 설정 타입
export interface SMSConfig {
  apiKey: string
  apiSecret: string
  from: string
}

// 파일 업로드 설정 타입
export interface UploadConfig {
  path: string
  maxFileSize: number
}

// 애플리케이션 설정 타입
export interface AppConfig {
  environment: Environment
  port: number
  jwt: JWTConfig
  corsOrigin: string[]
  database: DatabaseConfig
  apiKeys: ApiKeyConfig
  security: SecurityConfig
  email: EmailConfig
  sms: SMSConfig
  upload: UploadConfig
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

// 기계 관련 타입 (중복 제거)
export type {
  Machine,
  MachineCategory,
  DifficultyLevel,
  MachineListResponse,
  MachineCategoriesResponse,
  MachineUsageStats,
  MachineReview,
  CreateMachineReviewRequest,
  UpdateMachineReviewRequest,
  MachineSearchFilter,
  MachineSortOption,
  GetMachineRequest,
  MachineWorkoutProgram,
  MachineWorkoutProgramResponse,
  CreateMachineRequest,
  UpdateMachineRequest,
  MachineFilterQuery,
  MachineResponse,
  MachineFilterResponse,
} from "./machine"

export {
  MACHINE_CATEGORIES,
  MACHINE_DIFFICULTIES,
  TARGET_MUSCLES,
} from "./machine"

// 통계 관련 타입 (중복 제거)
export type {
  UserStats,
  WorkoutStats as StatsWorkoutStats,
  ProgressStats,
  MachineUsageStats as StatsMachineUsageStats,
  GymVisitStats,
  CommunityStats,
  GetUserStatsRequest,
  GetWorkoutStatsRequest,
  GetProgressStatsRequest,
  GetMachineStatsRequest as StatsGetMachineStatsRequest,
  GetGymStatsRequest,
  GetCommunityStatsRequest,
  UserStatsResponse,
  WorkoutStatsResponse,
  ProgressStatsResponse,
  MachineStatsResponse as StatsMachineStatsResponse,
  GymStatsResponse,
  CommunityStatsResponse,
} from "./stats"

// 계정 복구 관련 타입
export * from "./accountRecovery"

// Workout types
export type {
  WorkoutSession,
  ExerciseSet,
  WorkoutGoal,
  WorkoutPlan,
  WorkoutPlanExercise,
  WorkoutStats,
  WorkoutProgress,
  WorkoutReminder,
  WorkoutSummary,
  DashboardData,
} from "./workout"
