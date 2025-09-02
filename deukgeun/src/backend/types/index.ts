// ============================================================================
// 백엔드 타입 시스템 - 중앙화된 타입 관리
// ============================================================================

// 중앙 타입 시스템 재사용
export * from "../../shared/types/index.js"

// ============================================================================
// 백엔드 전용 타입 (중앙 타입과 중복되지 않는 것들만)
// ============================================================================

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
    role: string
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
  synchronize?: boolean
  logging?: boolean
}

// JWT 관련 타입
export interface JWTPayload {
  userId: number
  email: string
  role: string
  iat?: number
  exp?: number
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

// 로깅 관련 타입
export interface LogConfig {
  level: "error" | "warn" | "info" | "debug"
  format: "json" | "simple"
  transports: string[]
}

// 서버 설정 타입
export interface ServerConfig {
  port: number
  host: string
  environment: "development" | "production" | "test"
  cors: boolean
  rateLimit: boolean
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

// 파일 업로드 관련 타입
export interface FileUploadConfig {
  maxSize: number
  allowedTypes: string[]
  uploadPath: string
}

// 이메일 관련 타입
export interface EmailConfig {
  host: string
  port: number
  user: string
  pass: string
}

export interface EmailTemplate {
  subject: string
  html: string
  text: string
}

// 캐시 관련 타입
export interface CacheConfig {
  host: string
  port: number
  password?: string
  db: number
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

// 스케줄러 관련 타입
export interface SchedulerConfig {
  enabled: boolean
  jobs: {
    name: string
    cron: string
    handler: string
  }[]
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

// 사용자 역할 타입
export type UserRole = "user" | "admin" | "moderator"

// 성별 타입
export type Gender = "male" | "female" | "other"

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

// 이메일 서비스 관련 타입
export interface EmailServiceConfig {
  host: string
  port: number
  secure?: boolean
  auth: {
    user: string
    pass: string
  }
}

export interface EmailContent {
  to: string
  subject: string
  html?: string
  text?: string
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
