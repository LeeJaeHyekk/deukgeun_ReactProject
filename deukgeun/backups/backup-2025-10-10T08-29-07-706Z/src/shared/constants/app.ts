// ============================================================================
// 애플리케이션 관련 상수들
// ============================================================================

// 애플리케이션 정보
export const APP_INFO = {
  NAME: "Deukgeun",
  VERSION: "1.0.0",
  DESCRIPTION: "헬스장 찾기 및 운동 관리 플랫폼",
  AUTHOR: "Deukgeun Team",
  WEBSITE: "https://deukgeun.com",
} as const

// 환경 설정
export const ENV = {
  DEVELOPMENT: "development",
  PRODUCTION: "production",
  TEST: "test",
} as const

// 기본 설정
export const DEFAULT_CONFIG = {
  PORT: 5000,
  API_BASE_URL: "http://localhost:5000",
  FRONTEND_URL: "http://localhost:5173",
  DATABASE_HOST: "localhost",
  DATABASE_PORT: 3306,
  DATABASE_NAME: "deukgeun_db",
  JWT_EXPIRES_IN: "7d",
  CORS_ORIGIN: "http://localhost:5173",
  UPLOAD_PATH: "./uploads",
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15분
  RATE_LIMIT_MAX: 100,
} as const

// 파일 업로드 설정
export const UPLOAD_CONFIG = {
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  ALLOWED_VIDEO_TYPES: ["video/mp4", "video/webm", "video/ogg"],
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_VIDEO_SIZE: 50 * 1024 * 1024, // 50MB
  IMAGE_QUALITY: 0.8,
  THUMBNAIL_SIZE: 300,
} as const

// 보안 설정
export const SECURITY_CONFIG = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30분
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15분
  TOKEN_REFRESH_THRESHOLD: 5 * 60 * 1000, // 5분
} as const

// 페이지네이션 설정
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1,
} as const

// 캐시 설정
export const CACHE_CONFIG = {
  DEFAULT_TTL: 5 * 60 * 1000, // 5분
  USER_PROFILE_TTL: 10 * 60 * 1000, // 10분
  GYM_LIST_TTL: 30 * 60 * 1000, // 30분
  MACHINE_LIST_TTL: 60 * 60 * 1000, // 1시간
  MAX_CACHE_SIZE: 100 * 1024 * 1024, // 100MB
} as const

// 알림 설정
export const NOTIFICATION_CONFIG = {
  MAX_NOTIFICATIONS: 100,
  NOTIFICATION_TTL: 30 * 24 * 60 * 60 * 1000, // 30일
  PUSH_ENABLED: true,
  EMAIL_ENABLED: true,
  SMS_ENABLED: false,
} as const

// 검색 설정
export const SEARCH_CONFIG = {
  MIN_QUERY_LENGTH: 2,
  MAX_QUERY_LENGTH: 100,
  MAX_SEARCH_RESULTS: 50,
  SEARCH_DELAY: 300, // 300ms
  FUZZY_SEARCH_THRESHOLD: 0.8,
} as const

// 지도 설정
export const MAP_CONFIG = {
  DEFAULT_ZOOM: 13,
  MIN_ZOOM: 10,
  MAX_ZOOM: 18,
  DEFAULT_CENTER: {
    lat: 37.5665,
    lng: 126.978,
  }, // 서울 시청
  SEARCH_RADIUS: 5000, // 5km
  MAX_SEARCH_RADIUS: 50000, // 50km
} as const

// 운동 설정
export const WORKOUT_CONFIG = {
  MAX_SESSION_DURATION: 4 * 60 * 60 * 1000, // 4시간
  MIN_SESSION_DURATION: 5 * 60 * 1000, // 5분
  MAX_SETS_PER_EXERCISE: 20,
  MAX_REPS_PER_SET: 1000,
  MAX_WEIGHT: 1000, // kg
  MAX_REST_TIME: 30 * 60, // 30분
  DEFAULT_REST_TIME: 60, // 1분
} as const

// 레벨 시스템 설정
export const LEVEL_CONFIG = {
  MAX_LEVEL: 100,
  BASE_EXP_REQUIRED: 100,
  EXP_MULTIPLIER: 1.5,
  MAX_DAILY_EXP: 1000,
  STREAK_BONUS: 0.1, // 10% 보너스
  MILESTONE_BONUS: 0.5, // 50% 보너스
} as const

// 커뮤니티 설정
export const COMMUNITY_CONFIG = {
  MAX_POST_LENGTH: 10000,
  MAX_COMMENT_LENGTH: 1000,
  MAX_TAGS_PER_POST: 10,
  MAX_IMAGES_PER_POST: 10,
  SPAM_THRESHOLD: 5,
  MODERATION_ENABLED: true,
} as const

// 헬스장 설정
export const GYM_CONFIG = {
  MAX_REVIEW_LENGTH: 2000,
  MAX_RATING: 5,
  MIN_RATING: 1,
  MAX_IMAGES_PER_GYM: 20,
  VERIFICATION_THRESHOLD: 3,
  AUTO_APPROVAL_ENABLED: false,
} as const

// 기계 설정
export const MACHINE_CONFIG = {
  MAX_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 1000,
  MAX_INSTRUCTIONS_LENGTH: 2000,
  MAX_TARGET_MUSCLES: 10,
  MAX_IMAGES_PER_MACHINE: 10,
  MAX_VIDEOS_PER_MACHINE: 5,
} as const

// 통계 설정
export const STATS_CONFIG = {
  DATA_RETENTION_DAYS: 365,
  AGGREGATION_INTERVAL: 24 * 60 * 60 * 1000, // 24시간
  MAX_DATA_POINTS: 1000,
  AUTO_CLEANUP_ENABLED: true,
} as const

// 성능 설정
export const PERFORMANCE_CONFIG = {
  REQUEST_TIMEOUT: 30000, // 30초
  CONNECTION_TIMEOUT: 10000, // 10초
  MAX_CONCURRENT_REQUESTS: 100,
  RATE_LIMIT_ENABLED: true,
  COMPRESSION_ENABLED: true,
} as const

// 로깅 설정
export const LOGGING_CONFIG = {
  LEVEL: "info",
  MAX_LOG_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_LOG_FILES: 5,
  LOG_TO_FILE: true,
  LOG_TO_CONSOLE: true,
  LOG_REQUESTS: true,
  LOG_ERRORS: true,
} as const

// 개발 도구 설정
export const DEV_CONFIG = {
  HOT_RELOAD_ENABLED: true,
  DEBUG_MODE: true,
  MOCK_DATA_ENABLED: false,
  API_DOCS_ENABLED: true,
  HEALTH_CHECK_ENABLED: true,
} as const
