// ============================================================================
// 인증 유효성 검사 규칙
// ============================================================================

export const AUTH_VALIDATION_RULES = {
  EMAIL: {
    REQUIRED: "이메일을 입력해주세요",
    INVALID: "유효한 이메일 주소를 입력해주세요",
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  PASSWORD: {
    REQUIRED: "비밀번호를 입력해주세요",
    MIN_LENGTH: 8,
    MIN_LENGTH_MESSAGE: "비밀번호는 최소 8자 이상이어야 합니다",
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    PATTERN_MESSAGE: "비밀번호는 대문자, 소문자, 숫자를 포함해야 합니다",
  },
  NAME: {
    REQUIRED: "이름을 입력해주세요",
    MIN_LENGTH: 2,
    MIN_LENGTH_MESSAGE: "이름은 최소 2자 이상이어야 합니다",
    MAX_LENGTH: 50,
    MAX_LENGTH_MESSAGE: "이름은 50자 이하여야 합니다",
  },
  CONFIRM_PASSWORD: {
    REQUIRED: "비밀번호 확인을 입력해주세요",
    MISMATCH: "비밀번호가 일치하지 않습니다",
  },
} as const

export const AUTH_ERROR_MESSAGES = {
  LOGIN_FAILED: "이메일 또는 비밀번호가 올바르지 않습니다",
  REGISTER_FAILED: "회원가입에 실패했습니다",
  NETWORK_ERROR: "네트워크 연결을 확인해주세요",
  SERVER_ERROR: "서버 오류가 발생했습니다",
  INVALID_TOKEN: "인증 토큰이 유효하지 않습니다",
  TOKEN_EXPIRED: "인증 토큰이 만료되었습니다",
} as const

export const AUTH_SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: "로그인되었습니다",
  REGISTER_SUCCESS: "회원가입이 완료되었습니다",
  LOGOUT_SUCCESS: "로그아웃되었습니다",
  PASSWORD_RESET_SUCCESS: "비밀번호가 재설정되었습니다",
} as const
