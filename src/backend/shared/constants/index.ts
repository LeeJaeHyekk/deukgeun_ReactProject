// 공통 상수 정의
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const

// API 응답 메시지
export const API_MESSAGES = {
  SUCCESS: "성공",
  ERROR: "오류가 발생했습니다",
  UNAUTHORIZED: "인증이 필요합니다",
  FORBIDDEN: "권한이 없습니다",
  NOT_FOUND: "리소스를 찾을 수 없습니다",
  VALIDATION_ERROR: "입력값이 올바르지 않습니다",
  INTERNAL_ERROR: "서버 내부 오류가 발생했습니다",
} as const

// 데이터베이스 관련 상수
export const DB_CONSTANTS = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  CONNECTION_TIMEOUT: 30000,
} as const

// 파일 업로드 관련 상수
export const UPLOAD_CONSTANTS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/gif"],
  ALLOWED_DOCUMENT_TYPES: ["application/pdf", "text/plain"],
} as const

// 인증 관련 상수
export const AUTH_CONSTANTS = {
  JWT_EXPIRES_IN: "7d",
  REFRESH_TOKEN_EXPIRES_IN: "30d",
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
} as const

// 레이트 리미팅 관련 상수
export const RATE_LIMIT_CONSTANTS = {
  WINDOW_MS: 15 * 60 * 1000, // 15분
  MAX_REQUESTS: 100,
  AUTH_MAX_REQUESTS: 10,
  MACHINE_MAX_REQUESTS: 50,
  POST_MAX_REQUESTS: 20,
  WORKOUT_MAX_REQUESTS: 30,
} as const

// 운동 관련 상수
export const WORKOUT_CONSTANTS = {
  MAX_SETS_PER_EXERCISE: 20,
  MAX_REPS_PER_SET: 1000,
  MAX_WEIGHT: 1000,
  MAX_DURATION: 1440, // 24시간 (분)
} as const

// 커뮤니티 관련 상수
export const COMMUNITY_CONSTANTS = {
  MAX_POST_LENGTH: 5000,
  MAX_COMMENT_LENGTH: 1000,
  MAX_TITLE_LENGTH: 100,
  POSTS_PER_PAGE: 20,
  COMMENTS_PER_PAGE: 50,
} as const

// 머신 관련 상수
export const MACHINE_CONSTANTS = {
  MAX_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 1000,
  MAX_INSTRUCTIONS_LENGTH: 2000,
  MAX_IMAGE_URL_LENGTH: 500,
} as const

// 헬스장 관련 상수
export const GYM_CONSTANTS = {
  MAX_NAME_LENGTH: 100,
  MAX_ADDRESS_LENGTH: 200,
  MAX_DESCRIPTION_LENGTH: 1000,
  MAX_PHONE_LENGTH: 20,
  MAX_WEBSITE_LENGTH: 200,
} as const
