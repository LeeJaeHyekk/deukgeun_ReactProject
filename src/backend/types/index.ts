// ============================================================================
// Global Types Index
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface ErrorResponse {
  success: false
  error: string
  message?: string
  code?: string
}

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
    hasNext: boolean
    hasPrev: boolean
  }
}

export type Environment = "development" | "production" | "test"

export interface DatabaseConfig {
  host: string
  port: number
  username: string
  password: string
  database: string
  synchronize: boolean
  logging: boolean
  entities?: string[]
  migrations?: string[]
  subscribers?: string[]
}

export interface JWTConfig {
  secret: string
  expiresIn: string
  accessSecret: string
  refreshSecret: string
}

export interface ApiKeyConfig {
  kakao?: string
  kakaoJavascript?: string
  kakaoLocation?: string
  kakaoRest?: string
  kakaoLocationAdmin?: string
  googlePlaces?: string
  googleSecureSecret?: string
  seoulOpenApi?: string
  gymApi?: string
}

export interface SecurityConfig {
  recaptchaSecret: string
  recaptchaSiteKey: string
  accessTokenSecret: string
  refreshTokenSecret: string
  rateLimitWindow: number
  rateLimitMax: number
}

export interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}

export interface SMSConfig {
  apiKey: string
  apiSecret: string
  from: string
}

export interface UploadConfig {
  path: string
  maxFileSize: number
}

export interface SchedulerConfig {
  enabled: boolean
  interval: number
  jobs: any[]
}

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

export type MilestoneType = 
  | "level"
  | "exp"
  | "streak"
  | "workouts"

export type StreakType = 
  | "daily"
  | "weekly"
  | "monthly"
