// ============================================================================
// 백엔드 전용 타입 시스템
// 프론트엔드와 중복되지 않는 백엔드 고유 타입들만 정의
// ============================================================================

import type { Request } from "express"

// 환경 설정 타입
export type Environment = "development" | "production" | "test"

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
  kakaoJavascript: string
  kakaoLocation: string
  kakaoRest: string
  kakaoLocationAdmin: string
  googlePlaces: string
  googleSecureSecret: string
  seoulOpenApi: string
  gymApi: string
}

// 보안 설정 타입
export interface SecurityConfig {
  recaptchaSecret: string
  recaptchaSiteKey: string
  accessTokenSecret: string
  refreshTokenSecret: string
  rateLimitWindow: number
  rateLimitMax: number
}

// SMS 설정 타입
export interface SMSConfig {
  apiKey: string
  apiSecret: string
  from: string
}

// 업로드 설정 타입
export interface UploadConfig {
  path: string
  maxFileSize: number
}

// 이메일 설정 타입
export interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}

// 스케줄러 설정 타입
export interface SchedulerConfig {
  enabled: boolean
  interval: number
  jobs: {
    name: string
    cron: string
    handler: string
  }[]
}

// 보안 정보 타입
export interface SecurityInfo {
  ipAddress: string
  userAgent?: string
  timestamp: Date
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
  scheduler: SchedulerConfig
}

// Express 관련 타입
export interface AuthenticatedRequest extends Request {
  user?: {
    id: number
    userId: number
    email: string
    role: UserRole
  }
  params: any
  query: any
}

// 데이터베이스 관련 타입
export interface DatabaseConfig {
  host: string
  port: number
  username: string
  password: string
  database: string
  dialect: "mysql" | "postgres" | "sqlite" | "mariadb" | "mssql"
  logging: boolean
  synchronize: boolean
  entities: string[]
  migrations: string[]
  subscribers: string[]
}

// 로깅 설정 타입
export interface LogConfig {
  level: string
  filename: string
  maxSize: string
  maxFiles: string
}

// API 응답 타입
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  statusCode?: number
}

// 에러 응답 타입
export interface ErrorResponse {
  success: false
  message: string
  error: string
  statusCode?: number
  details?: any
}

// 페이지네이션 타입
export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: "ASC" | "DESC"
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

// 검색 필터 타입
export interface SearchFilter {
  keyword?: string
  category?: string
  dateRange?: {
    start: Date
    end: Date
  }
  status?: string
}

// 파일 업로드 타입
export interface FileUpload {
  fieldname: string
  originalname: string
  encoding: string
  mimetype: string
  size: number
  destination: string
  filename: string
  path: string
}

// 캐시 설정 타입
export interface CacheConfig {
  enabled: boolean
  ttl: number
  maxSize: number
}

// 모니터링 타입
export interface PerformanceMetrics {
  responseTime: number
  memoryUsage: number
  cpuUsage: number
  requestCount: number
  errorCount: number
  timestamp: Date
}

// 인증 관련 타입
export interface LoginRequest {
  email: string
  password: string
  recaptchaToken?: string
}

export interface RegisterRequest {
  email: string
  password: string
  username: string
  confirmPassword: string
  nickname?: string
  phone?: string
  gender?: Gender
  birthday?: Date
  recaptchaToken?: string
}

export interface LoginResponse {
  success: boolean
  message: string
  accessToken: string
  user: UserDTO
}

export interface RegisterResponse {
  message: string
  user: {
    id: number
    email: string
    username: string
  }
}

// 사용자 관련 타입
export type UserRole = "user" | "admin" | "moderator"
export type Gender = "male" | "female" | "other"

// UserDTO 타입 추가
export interface UserDTO {
  id: number
  email: string
  username: string
  nickname?: string
  phone?: string
  gender?: Gender
  birthday?: Date
  role: UserRole
  profileImage?: string
  createdAt: Date
  updatedAt: Date
  lastLoginAt?: Date
  isActive: boolean
  isVerified: boolean
  level?: number
  experience?: number
  streak?: number
}

// UserProfile 타입 추가
export interface UserProfile {
  id: number
  userId: number
  height?: number
  weight?: number
  bodyFat?: number
  muscleMass?: number
  fitnessGoal?: string
  experienceLevel?: string
  preferredWorkoutTypes?: string[]
  medicalConditions?: string[]
  allergies?: string[]
  emergencyContact?: {
    name: string
    phone: string
    relationship: string
  }
  createdAt: Date
  updatedAt: Date
}

// UserStats 타입 추가
export interface UserStats {
  id: number
  userId: number
  totalWorkouts: number
  totalWorkoutTime: number
  totalCaloriesBurned: number
  currentStreak: number
  longestStreak: number
  totalDistance: number
  totalWeight: number
  totalReps: number
  totalSets: number
  favoriteExercise?: string
  lastWorkoutDate?: Date
  createdAt: Date
  updatedAt: Date
}

// 경험치 관련 타입
export type ExpActionType =
  | "workout_complete"
  | "workout_streak"
  | "goal_achieved"
  | "post_created"
  | "comment_created"
  | "like_received"
  | "daily_login"
  | "weekly_challenge"
  | "monthly_milestone"

// 보상 관련 타입
export type RewardType = "exp_bonus" | "badge" | "title" | "item"

// 연속 활동 관련 타입
export type StreakType = "login" | "workout" | "goal"

// 마일스톤 관련 타입
export type MilestoneType =
  | "level_up"
  | "workout_count"
  | "goal_achievement"
  | "streak"
  | "streak_days"
  | "community_engagement"

// 계정 복구 관련 타입
export interface VerificationTokenData {
  token: string
  email: string
  expiresAt: Date
  type: "find_id" | "reset_password"
}

export interface PasswordResetTokenData {
  token: string
  userId: number
  expiresAt: Date
}

export interface RecoveryLog {
  id?: number
  userId?: number
  email?: string
  type?: string
  status?: string
  error?: string
  action: string
  ipAddress: string
  userAgent?: string | null
  timestamp: Date
  success: boolean
  details?: Record<string, unknown>
}

// 검증 관련 타입
export interface ValidationError {
  field: string
  message: string
  value?: unknown
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

// 미들웨어 관련 타입
export interface MiddlewareConfig {
  cors: {
    origin: string | string[]
    credentials: boolean
  }
  rateLimit: {
    windowMs: number
    max: number
  }
}

// 서버 설정 타입
export interface ServerConfig {
  port: number
  host: string
  environment: "development" | "production" | "test"
  cors: boolean
  rateLimit: boolean
}

// 파일 업로드 관련 타입
export interface FileUploadConfig {
  maxSize: number
  allowedTypes: string[]
  uploadPath: string
}

// 이메일 관련 타입
export interface EmailTemplate {
  subject: string
  html: string
  text: string
}

// 이메일 서비스 설정 타입
export interface EmailServiceConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}

// 이메일 내용 타입
export interface EmailContent {
  to: string
  subject: string
  html?: string
  text?: string
}

// 웹소켓 관련 타입
export interface WebSocketConfig {
  port: number
  path: string
  cors: {
    origin: string | string[]
    methods: string[]
  }
}

// 모니터링 관련 타입
export interface MonitoringConfig {
  enabled: boolean
  metrics: {
    cpu: boolean
    memory: boolean
    disk: boolean
    network: boolean
  }
  alerts: {
    email: string[]
    slack?: string
  }
}
