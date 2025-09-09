// 백엔드 전용 타입 정의

// 이메일 서비스 설정
export interface EmailServiceConfig {
  host: string
  port: number
  user: string
  password: string
  secure: boolean
}

// 이메일 내용
export interface EmailContent {
  to: string
  subject: string
  text?: string
  html?: string
  template?: string
  templateData?: Record<string, any>
}

// 이메일 템플릿 타입
export type EmailTemplate =
  | "welcome"
  | "password_reset"
  | "email_verification"
  | "account_recovery"
  | "notification"

// 스케줄러 설정
export interface SchedulerConfig {
  enabled: boolean
  interval: number
  maxRetries: number
  retryDelay: number
}

// 크롤러 설정
export interface CrawlerConfig {
  enabled: boolean
  sources: string[]
  interval: number
  batchSize: number
  timeout: number
}

// API 응답 타입
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  timestamp?: string
  requestId?: string
}

// 에러 응답 타입
export interface ErrorResponse {
  success: false
  error: string
  message: string
  code?: string
  details?: any
  timestamp?: string
  requestId?: string
}

// 페이지네이션 응답 타입
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

// 페이지네이션 파라미터
export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
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
  buffer?: Buffer
}

// 로그 레벨
export type LogLevel = "error" | "warn" | "info" | "debug"

// 로그 엔트리
export interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  service: string
  requestId?: string
  userId?: number
  metadata?: Record<string, any>
}

// 데이터베이스 연결 상태
export interface DatabaseStatus {
  connected: boolean
  host: string
  port: number
  database: string
  uptime: number
  lastError?: string
}

// 서비스 상태
export interface ServiceStatus {
  name: string
  status: "healthy" | "degraded" | "unhealthy"
  uptime: number
  lastCheck: string
  version: string
  dependencies: ServiceDependency[]
}

// 서비스 의존성
export interface ServiceDependency {
  name: string
  status: "healthy" | "unhealthy"
  responseTime?: number
  lastCheck: string
}

// 캐시 설정
export interface CacheConfig {
  enabled: boolean
  ttl: number
  maxSize: number
  strategy: "lru" | "lfu" | "fifo"
}

// 레이트 리미팅 설정
export interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  skipSuccessfulRequests: boolean
  skipFailedRequests: boolean
  keyGenerator?: (req: any) => string
}

// 보안 설정
export interface SecurityConfig {
  cors: {
    origin: string[]
    credentials: boolean
    methods: string[]
    allowedHeaders: string[]
  }
  helmet: {
    contentSecurityPolicy: boolean
    crossOriginEmbedderPolicy: boolean
  }
  rateLimit: RateLimitConfig
}

// 환경 설정
export interface EnvironmentConfig {
  nodeEnv: "development" | "production" | "test"
  port: number
  host: string
  database: DatabaseConfig
  redis?: RedisConfig
  email: EmailServiceConfig
  security: SecurityConfig
  logging: LoggingConfig
}

// 데이터베이스 설정
export interface DatabaseConfig {
  host: string
  port: number
  username: string
  password: string
  database: string
  synchronize: boolean
  logging: boolean
  ssl?: boolean
  pool?: {
    min: number
    max: number
    acquire: number
    idle: number
  }
}

// Redis 설정
export interface RedisConfig {
  host: string
  port: number
  password?: string
  db: number
  retryDelayOnFailover: number
  maxRetriesPerRequest: number
}

// 로깅 설정
export interface LoggingConfig {
  level: LogLevel
  format: "json" | "simple"
  transports: LogTransport[]
}

// 로그 전송 설정
export interface LogTransport {
  type: "console" | "file" | "database"
  level: LogLevel
  filename?: string
  maxSize?: string
  maxFiles?: number
}
