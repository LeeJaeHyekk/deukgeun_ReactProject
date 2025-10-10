// 회원가입 검증 메시지 상수
export const SIGNUP_VALIDATION_MESSAGES = {
  // 이메일 관련
  EMAIL_REQUIRED: "이메일을 입력해주세요.",
  EMAIL_INVALID_FORMAT:
    "올바른 이메일 형식으로 입력해주세요. (예: user@example.com)",
  EMAIL_ALREADY_EXISTS: "이미 가입된 이메일입니다. 다른 이메일을 사용해주세요.",

  // 비밀번호 관련
  PASSWORD_REQUIRED: "비밀번호를 입력해주세요.",
  PASSWORD_TOO_SHORT: "비밀번호는 최소 8자 이상이어야 합니다.",
  PASSWORD_COMPLEXITY: "비밀번호는 영문과 숫자를 포함해야 합니다.",
  PASSWORD_MISMATCH: "비밀번호가 일치하지 않습니다.",
  CONFIRM_PASSWORD_REQUIRED: "비밀번호 확인을 입력해주세요.",

  // 닉네임 관련
  NICKNAME_REQUIRED: "닉네임을 입력해주세요.",
  NICKNAME_LENGTH: "닉네임은 2-20자 사이로 입력해주세요.",
  NICKNAME_FORMAT:
    "닉네임에는 영문, 숫자, 한글, 언더스코어(_), 하이픈(-)만 사용 가능합니다.",
  NICKNAME_ALREADY_EXISTS:
    "이미 사용 중인 닉네임입니다. 다른 닉네임을 사용해주세요.",

  // 휴대폰 번호 관련
  PHONE_INVALID_FORMAT:
    "올바른 형식으로 입력해주세요. (010-xxxx-xxxx 또는 011-xxx-xxxx)",

  // 성별 관련
  GENDER_REQUIRED: "성별을 선택해주세요.",
  GENDER_INVALID: "유효한 성별을 선택해주세요.",

  // 생년월일 관련
  BIRTHDAY_REQUIRED: "생년월일을 선택해주세요.",

  // 일반적인 에러 메시지
  GENERAL_ERROR: "회원가입에 실패했습니다. 다시 시도해주세요.",
  NETWORK_ERROR: "네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.",
  SERVER_ERROR: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
  VALIDATION_ERROR: "입력 정보를 확인해주세요.",
  SECURITY_ERROR: "보안 인증에 실패했습니다. 다시 시도해주세요.",

  // 성공 메시지
  SUCCESS: "회원가입 성공! 환영합니다!",
  EMAIL_AVAILABLE: "사용 가능한 이메일입니다.",
  NICKNAME_AVAILABLE: "사용 가능한 닉네임입니다.",
  PASSWORD_SAFE: "안전한 비밀번호입니다.",
  PASSWORD_MATCH: "비밀번호가 일치합니다.",
  PHONE_VALID: "올바른 휴대폰 번호입니다.",
} as const

// HTTP 상태 코드별 에러 메시지
export const HTTP_ERROR_MESSAGES = {
  400: "잘못된 요청입니다. 입력 정보를 확인해주세요.",
  401: "인증이 필요합니다. 다시 로그인해주세요.",
  403: "접근이 거부되었습니다. 권한을 확인해주세요.",
  404: "요청한 리소스를 찾을 수 없습니다.",
  409: "이미 존재하는 계정입니다.",
  422: "입력 데이터가 올바르지 않습니다.",
  429: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
  500: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
  502: "서버가 일시적으로 사용할 수 없습니다.",
  503: "서비스가 일시적으로 사용할 수 없습니다.",
  504: "요청 시간이 초과되었습니다.",
} as const

// 에러 타입별 토스트 스타일
export const ERROR_TOAST_TYPES = {
  VALIDATION: "warning" as const,
  DUPLICATE: "warning" as const,
  NETWORK: "error" as const,
  SERVER: "error" as const,
  SECURITY: "error" as const,
  GENERAL: "error" as const,
} as const
