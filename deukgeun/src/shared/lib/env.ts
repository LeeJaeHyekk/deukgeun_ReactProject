// ============================================================================
// 환경 설정 및 상수
// ============================================================================

// 헬스장 관련 설정
export const GYM_CONFIG = {
  DEFAULT_RADIUS: 5000, // 5km
  MAX_RADIUS: 50000, // 50km
  SEARCH_LIMIT: 20,
  RATING_WEIGHT: 0.4,
  DISTANCE_WEIGHT: 0.3,
  PRICE_WEIGHT: 0.3,
}

// 카카오 맵 관련 설정
export const KAKAO_CONFIG = {
  API_KEY: process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY || "",
  CENTER_LAT: 37.5665,
  CENTER_LNG: 126.978,
  ZOOM_LEVEL: 7,
  MIN_ZOOM: 7,
  MAX_ZOOM: 19,
}

// reCAPTCHA 설정
export const RECAPTCHA_CONFIG = {
  SITE_KEY: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "",
  SECRET_KEY: process.env.RECAPTCHA_SECRET_KEY || "",
  THRESHOLD: 0.5,
  TIMEOUT: 10000,
}

// API 설정
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001",
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
}

// 이미지 설정
export const IMAGE_CONFIG = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ["image/jpeg", "image/png", "image/webp"],
  COMPRESSION_QUALITY: 0.8,
  THUMBNAIL_SIZE: 150,
}

// 파일 업로드 설정
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_EXTENSIONS: [".jpg", ".jpeg", ".png", ".gif", ".webp"],
  UPLOAD_PATH: "/uploads",
  BACKUP_PATH: "/backups",
}

// 보안 설정
export const SECURITY_CONFIG = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REQUIRE_UPPERCASE: true,
  PASSWORD_REQUIRE_LOWERCASE: true,
  PASSWORD_REQUIRE_NUMBERS: true,
  PASSWORD_REQUIRE_SPECIAL_CHARS: true,
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24시간
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15분
}

// 알림 설정
export const NOTIFICATION_CONFIG = {
  PUSH_ENABLED: true,
  EMAIL_ENABLED: true,
  SMS_ENABLED: false,
  DEFAULT_CHANNELS: ["push", "email"],
}

// 워크아웃 설정
export const WORKOUT_CONFIG = {
  MAX_SESSIONS_PER_DAY: 3,
  MIN_SESSION_DURATION: 10, // 분
  MAX_SESSION_DURATION: 180, // 분
  REST_TIME_BETWEEN_SETS: 60, // 초
  REST_TIME_BETWEEN_EXERCISES: 120, // 초
  MAX_EXERCISES_PER_PLAN: 20,
}

// 레벨 시스템 설정
export const LEVEL_CONFIG = {
  BASE_EXP: 100,
  EXP_MULTIPLIER: 1.5,
  MAX_LEVEL: 100,
  SEASON_RESET_MONTHS: [3, 6, 9, 12], // 분기별 리셋
  DAILY_EXP_LIMIT: 1000,
  COOLDOWN_PERIOD: 5 * 60 * 1000, // 5분
}

// 환경 변수 유효성 검사
export function validateEnvironment(): boolean {
  const requiredVars = [
    "NEXT_PUBLIC_KAKAO_MAP_API_KEY",
    "NEXT_PUBLIC_RECAPTCHA_SITE_KEY",
    "NEXT_PUBLIC_API_BASE_URL",
  ]

  const missingVars = requiredVars.filter(varName => !process.env[varName])

  if (missingVars.length > 0) {
    console.warn("Missing environment variables:", missingVars)
    return false
  }

  return true
}

// 환경별 설정 반환
export function getEnvironmentConfig() {
  const env = process.env.NODE_ENV || "development"

  switch (env) {
    case "production":
      return {
        ...API_CONFIG,
        ...SECURITY_CONFIG,
        DEBUG: false,
        LOG_LEVEL: "error",
      }
    case "test":
      return {
        ...API_CONFIG,
        ...SECURITY_CONFIG,
        DEBUG: true,
        LOG_LEVEL: "debug",
      }
    default: // development
      return {
        ...API_CONFIG,
        ...SECURITY_CONFIG,
        DEBUG: true,
        LOG_LEVEL: "debug",
      }
  }
}
