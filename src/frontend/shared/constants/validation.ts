// ============================================================================
// 유효성 검사 상수
// ============================================================================

export const SIGNUP_VALIDATION_MESSAGES = {
  EMAIL_REQUIRED: "이메일을 입력해주세요",
  EMAIL_INVALID: "유효한 이메일 주소를 입력해주세요",
  PASSWORD_REQUIRED: "비밀번호를 입력해주세요",
  PASSWORD_MIN_LENGTH: "비밀번호는 최소 8자 이상이어야 합니다",
  PASSWORD_PATTERN: "비밀번호는 대문자, 소문자, 숫자를 포함해야 합니다",
  PASSWORD_CONFIRM_REQUIRED: "비밀번호 확인을 입력해주세요",
  PASSWORD_MISMATCH: "비밀번호가 일치하지 않습니다",
  NAME_REQUIRED: "이름을 입력해주세요",
  NAME_MIN_LENGTH: "이름은 최소 2자 이상이어야 합니다",
} as const

export const LOGIN_VALIDATION_MESSAGES = {
  EMAIL_REQUIRED: "이메일을 입력해주세요",
  EMAIL_INVALID: "유효한 이메일 주소를 입력해주세요",
  PASSWORD_REQUIRED: "비밀번호를 입력해주세요",
} as const

export const HTTP_ERROR_MESSAGES = {
  NETWORK_ERROR: "네트워크 연결을 확인해주세요",
  SERVER_ERROR: "서버 오류가 발생했습니다",
  UNAUTHORIZED: "인증이 필요합니다",
  FORBIDDEN: "접근 권한이 없습니다",
  NOT_FOUND: "요청한 리소스를 찾을 수 없습니다",
  VALIDATION_ERROR: "입력 정보를 확인해주세요",
  DUPLICATE_ERROR: "이미 존재하는 정보입니다",
  INVALID_CREDENTIALS: "이메일 또는 비밀번호가 올바르지 않습니다",
  EMAIL_ALREADY_EXISTS: "이미 존재하는 이메일입니다",
  NICKNAME_ALREADY_EXISTS: "이미 존재하는 닉네임입니다",
  SECURITY_ERROR: "보안 오류가 발생했습니다",
  GENERAL_ERROR: "일반적인 오류가 발생했습니다",
} as const

export const FORM_VALIDATION_MESSAGES = {
  REQUIRED: "필수 입력 항목입니다",
  INVALID_FORMAT: "올바른 형식으로 입력해주세요",
  MIN_LENGTH: "최소 길이를 만족하지 않습니다",
  MAX_LENGTH: "최대 길이를 초과했습니다",
  MIN_VALUE: "최소값을 만족하지 않습니다",
  MAX_VALUE: "최대값을 초과했습니다",
  PATTERN_MISMATCH: "형식이 올바르지 않습니다",
} as const

export const WORKOUT_VALIDATION_MESSAGES = {
  NAME_REQUIRED: "운동 이름을 입력해주세요",
  SETS_REQUIRED: "세트 수를 입력해주세요",
  SETS_MIN: "세트 수는 1 이상이어야 합니다",
  REPS_REQUIRED: "반복 수를 입력해주세요",
  REPS_MIN: "반복 수는 1 이상이어야 합니다",
  WEIGHT_MIN: "무게는 0 이상이어야 합니다",
  DURATION_MIN: "시간은 0 이상이어야 합니다",
  NOTES_MAX: "메모는 1000자 이하여야 합니다",
} as const

export const COMMUNITY_VALIDATION_MESSAGES = {
  TITLE_REQUIRED: "제목을 입력해주세요",
  TITLE_MAX: "제목은 100자 이하여야 합니다",
  CONTENT_REQUIRED: "내용을 입력해주세요",
  CONTENT_MAX: "내용은 1000자 이하여야 합니다",
  TAGS_MAX: "태그는 최대 10개까지 가능합니다",
  IMAGES_MAX: "이미지는 최대 5개까지 가능합니다",
  COMMENT_REQUIRED: "댓글 내용을 입력해주세요",
  COMMENT_MAX: "댓글은 500자 이하여야 합니다",
} as const

export const GYM_VALIDATION_MESSAGES = {
  RATING_REQUIRED: "평점을 선택해주세요",
  RATING_MIN: "평점은 1 이상이어야 합니다",
  RATING_MAX: "평점은 5 이하여야 합니다",
  CONTENT_REQUIRED: "리뷰 내용을 입력해주세요",
  CONTENT_MAX: "리뷰는 1000자 이하여야 합니다",
} as const

export default {
  SIGNUP: SIGNUP_VALIDATION_MESSAGES,
  LOGIN: LOGIN_VALIDATION_MESSAGES,
  HTTP: HTTP_ERROR_MESSAGES,
  FORM: FORM_VALIDATION_MESSAGES,
  WORKOUT: WORKOUT_VALIDATION_MESSAGES,
  COMMUNITY: COMMUNITY_VALIDATION_MESSAGES,
  GYM: GYM_VALIDATION_MESSAGES,
}
