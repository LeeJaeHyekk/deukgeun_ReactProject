// ============================================================================
// 유효성 검사 관련 상수들
// ============================================================================

// 이메일 유효성 검사
export const EMAIL_VALIDATION = {
  PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  MESSAGE: "올바른 이메일 형식을 입력해주세요.",
  REQUIRED: "이메일을 입력해주세요.",
} as const

// 비밀번호 유효성 검사
export const PASSWORD_VALIDATION = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 128,
  PATTERN: /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/,
  MESSAGE: "비밀번호는 영문, 숫자, 특수문자를 포함하여 8자 이상이어야 합니다.",
  REQUIRED: "비밀번호를 입력해주세요.",
  CONFIRM_MESSAGE: "비밀번호가 일치하지 않습니다.",
} as const

// 이름 유효성 검사
export const NAME_VALIDATION = {
  MIN_LENGTH: 2,
  MAX_LENGTH: 20,
  PATTERN: /^[가-힣a-zA-Z\s]+$/,
  MESSAGE: "이름은 2-20자의 한글 또는 영문만 입력 가능합니다.",
  REQUIRED: "이름을 입력해주세요.",
} as const

// 전화번호 유효성 검사
export const PHONE_VALIDATION = {
  PATTERN: /^[0-9]{10,11}$/,
  MESSAGE: "올바른 전화번호 형식을 입력해주세요.",
  REQUIRED: "전화번호를 입력해주세요.",
} as const

// 생년월일 유효성 검사
export const BIRTHDATE_VALIDATION = {
  MIN_AGE: 14,
  MAX_AGE: 100,
  MESSAGE: "만 14세 이상만 가입 가능합니다.",
  REQUIRED: "생년월일을 입력해주세요.",
} as const

// 운동 목표 유효성 검사
export const WORKOUT_GOAL_VALIDATION = {
  TITLE_MIN_LENGTH: 1,
  TITLE_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 500,
  TARGET_DATE_MIN_DAYS: 1,
  TARGET_DATE_MAX_DAYS: 365,
} as const

// 운동 계획 유효성 검사
export const WORKOUT_PLAN_VALIDATION = {
  NAME_MIN_LENGTH: 1,
  NAME_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 1000,
  EXERCISES_MIN_COUNT: 1,
  EXERCISES_MAX_COUNT: 50,
} as const

// 운동 세션 유효성 검사
export const WORKOUT_SESSION_VALIDATION = {
  DURATION_MIN_MINUTES: 1,
  DURATION_MAX_MINUTES: 480, // 8시간
  NOTES_MAX_LENGTH: 1000,
} as const

// 댓글 유효성 검사
export const COMMENT_VALIDATION = {
  CONTENT_MIN_LENGTH: 1,
  CONTENT_MAX_LENGTH: 1000,
  REQUIRED: "댓글 내용을 입력해주세요.",
} as const

// 게시글 유효성 검사
export const POST_VALIDATION = {
  TITLE_MIN_LENGTH: 1,
  TITLE_MAX_LENGTH: 200,
  CONTENT_MIN_LENGTH: 1,
  CONTENT_MAX_LENGTH: 10000,
  TITLE_REQUIRED: "제목을 입력해주세요.",
  CONTENT_REQUIRED: "내용을 입력해주세요.",
} as const

// 회원가입 유효성 검사 메시지
export const SIGNUP_VALIDATION_MESSAGES = {
  EMAIL_REQUIRED: "이메일을 입력해주세요.",
  EMAIL_INVALID: "올바른 이메일 형식을 입력해주세요.",
  PASSWORD_REQUIRED: "비밀번호를 입력해주세요.",
  PASSWORD_INVALID:
    "비밀번호는 영문, 숫자, 특수문자를 포함하여 8자 이상이어야 합니다.",
  PASSWORD_CONFIRM_REQUIRED: "비밀번호 확인을 입력해주세요.",
  PASSWORD_MISMATCH: "비밀번호가 일치하지 않습니다.",
  NICKNAME_REQUIRED: "닉네임을 입력해주세요.",
  NICKNAME_INVALID: "닉네임은 2-20자의 한글 또는 영문만 입력 가능합니다.",
  BIRTHDATE_REQUIRED: "생년월일을 입력해주세요.",
  BIRTHDATE_INVALID: "만 14세 이상만 가입 가능합니다.",
  PHONE_INVALID: "올바른 전화번호 형식을 입력해주세요.",
  RECAPTCHA_REQUIRED: "보안 인증을 완료해주세요.",
} as const

// 에러 토스트 타입
export const ERROR_TOAST_TYPES = {
  VALIDATION: "error",
  NETWORK: "error",
  AUTH: "error",
  SERVER: "error",
  UNKNOWN: "error",
  DUPLICATE: "error",
} as const

// 회원가입 성공 메시지
export const SIGNUP_SUCCESS_MESSAGE = "회원가입이 완료되었습니다." as const

// HTTP 에러 메시지
export const HTTP_ERROR_MESSAGES = {
  NETWORK_ERROR: "네트워크 연결에 실패했습니다.",
  TIMEOUT_ERROR: "요청 시간이 초과되었습니다.",
  UNAUTHORIZED: "인증이 필요합니다.",
  FORBIDDEN: "접근 권한이 없습니다.",
  NOT_FOUND: "요청한 리소스를 찾을 수 없습니다.",
  VALIDATION_ERROR: "입력 데이터가 올바르지 않습니다.",
  SERVER_ERROR: "서버 오류가 발생했습니다.",
  UNKNOWN_ERROR: "알 수 없는 오류가 발생했습니다.",
  EMAIL_ALREADY_EXISTS: "이미 사용 중인 이메일입니다.",
  NICKNAME_ALREADY_EXISTS: "이미 사용 중인 닉네임입니다.",
  SECURITY_ERROR: "보안 검증에 실패했습니다.",
  GENERAL_ERROR: "일반적인 오류가 발생했습니다."
} as const
