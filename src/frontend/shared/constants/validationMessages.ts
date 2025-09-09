// 프론트엔드 전용 Validation 메시지 상수

export const SIGNUP_VALIDATION_MESSAGES = {
  // 기본 필드 검증 메시지
  EMAIL_REQUIRED: "이메일을 입력해주세요.",
  EMAIL_INVALID: "올바른 이메일 형식을 입력해주세요.",
  PASSWORD_REQUIRED: "비밀번호를 입력해주세요.",
  PASSWORD_INVALID:
    "비밀번호는 영문, 숫자, 특수문자를 포함하여 8자 이상이어야 합니다.",
  PASSWORD_CONFIRM_REQUIRED: "비밀번호 확인을 입력해주세요.",
  PASSWORD_CONFIRM_MISMATCH: "비밀번호가 일치하지 않습니다.",
  NICKNAME_REQUIRED: "닉네임을 입력해주세요.",
  NICKNAME_INVALID: "닉네임은 2-20자의 한글, 영문, 숫자만 사용 가능합니다.",
  PHONE_REQUIRED: "전화번호를 입력해주세요.",
  PHONE_INVALID: "올바른 전화번호 형식을 입력해주세요.",
  GENDER_REQUIRED: "성별을 선택해주세요.",
  BIRTHDAY_REQUIRED: "생년월일을 입력해주세요.",
  BIRTHDAY_INVALID: "올바른 생년월일을 입력해주세요.",
  RECAPTCHA_REQUIRED: "보안 인증을 완료해주세요.",

  // 서버 응답 메시지
  EMAIL_ALREADY_EXISTS: "이미 사용 중인 이메일입니다.",
  NICKNAME_ALREADY_EXISTS: "이미 사용 중인 닉네임입니다.",
  VALIDATION_ERROR: "입력한 정보를 다시 확인해주세요.",
  SECURITY_ERROR: "보안 인증에 실패했습니다. 다시 시도해주세요.",
  SERVER_ERROR: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
  GENERAL_ERROR: "회원가입에 실패했습니다. 다시 시도해주세요.",
} as const

// HTTP 에러 메시지
export const HTTP_ERROR_MESSAGES = {
  BAD_REQUEST: "잘못된 요청입니다.",
  UNAUTHORIZED: "인증이 필요합니다.",
  FORBIDDEN: "접근 권한이 없습니다.",
  NOT_FOUND: "요청한 리소스를 찾을 수 없습니다.",
  INTERNAL_SERVER_ERROR: "서버 내부 오류가 발생했습니다.",
  SERVICE_UNAVAILABLE: "서비스를 사용할 수 없습니다.",
  NETWORK_ERROR: "네트워크 오류가 발생했습니다.",
  TIMEOUT_ERROR: "요청 시간이 초과되었습니다.",
} as const

// 에러 토스트 타입
export const ERROR_TOAST_TYPES = {
  ERROR: "error",
  WARNING: "warning",
  INFO: "info",
  SUCCESS: "success",
  DUPLICATE: "warning",
  VALIDATION: "error",
  NETWORK: "error",
  SECURITY: "error",
} as const

export const LOGIN_VALIDATION_MESSAGES = {
  EMAIL_REQUIRED: "이메일을 입력해주세요.",
  EMAIL_INVALID: "올바른 이메일 형식을 입력해주세요.",
  PASSWORD_REQUIRED: "비밀번호를 입력해주세요.",
  RECAPTCHA_REQUIRED: "보안 인증을 완료해주세요.",

  // 서버 응답 메시지
  INVALID_CREDENTIALS: "이메일 또는 비밀번호가 올바르지 않습니다.",
  ACCOUNT_NOT_VERIFIED: "이메일 인증이 필요합니다.",
  ACCOUNT_LOCKED: "계정이 잠겨있습니다. 관리자에게 문의해주세요.",
  TOO_MANY_ATTEMPTS:
    "로그인 시도 횟수를 초과했습니다. 잠시 후 다시 시도해주세요.",
  SERVER_ERROR: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
  GENERAL_ERROR: "로그인에 실패했습니다. 다시 시도해주세요.",
} as const

export const PROFILE_VALIDATION_MESSAGES = {
  NICKNAME_REQUIRED: "닉네임을 입력해주세요.",
  NICKNAME_INVALID: "닉네임은 2-20자의 한글, 영문, 숫자만 사용 가능합니다.",
  PHONE_INVALID: "올바른 전화번호 형식을 입력해주세요.",
  BIRTHDAY_INVALID: "올바른 생년월일을 입력해주세요.",

  // 서버 응답 메시지
  NICKNAME_ALREADY_EXISTS: "이미 사용 중인 닉네임입니다.",
  UPDATE_SUCCESS: "프로필이 성공적으로 업데이트되었습니다.",
  UPDATE_ERROR: "프로필 업데이트에 실패했습니다. 다시 시도해주세요.",
} as const

export const PASSWORD_VALIDATION_MESSAGES = {
  CURRENT_PASSWORD_REQUIRED: "현재 비밀번호를 입력해주세요.",
  NEW_PASSWORD_REQUIRED: "새 비밀번호를 입력해주세요.",
  NEW_PASSWORD_INVALID:
    "새 비밀번호는 영문, 숫자, 특수문자를 포함하여 8자 이상이어야 합니다.",
  CONFIRM_PASSWORD_REQUIRED: "새 비밀번호 확인을 입력해주세요.",
  CONFIRM_PASSWORD_MISMATCH: "새 비밀번호가 일치하지 않습니다.",

  // 서버 응답 메시지
  CURRENT_PASSWORD_INCORRECT: "현재 비밀번호가 올바르지 않습니다.",
  SAME_PASSWORD_ERROR: "새 비밀번호는 현재 비밀번호와 달라야 합니다.",
  CHANGE_SUCCESS: "비밀번호가 성공적으로 변경되었습니다.",
  CHANGE_ERROR: "비밀번호 변경에 실패했습니다. 다시 시도해주세요.",
} as const

export const WORKOUT_VALIDATION_MESSAGES = {
  PLAN_NAME_REQUIRED: "운동 계획 이름을 입력해주세요.",
  PLAN_NAME_INVALID: "운동 계획 이름은 2-50자 이내로 입력해주세요.",
  EXERCISE_REQUIRED: "운동을 하나 이상 추가해주세요.",
  SETS_REQUIRED: "세트 수를 입력해주세요.",
  SETS_INVALID: "세트 수는 1-20 사이의 숫자여야 합니다.",
  REPS_REQUIRED: "횟수를 입력해주세요.",
  REPS_INVALID: "횟수는 1-100 사이의 숫자여야 합니다.",
  WEIGHT_INVALID: "무게는 0 이상의 숫자여야 합니다.",
  REST_TIME_INVALID: "휴식 시간은 0 이상의 숫자여야 합니다.",

  // 서버 응답 메시지
  SAVE_SUCCESS: "운동 계획이 성공적으로 저장되었습니다.",
  SAVE_ERROR: "운동 계획 저장에 실패했습니다. 다시 시도해주세요.",
  DELETE_SUCCESS: "운동 계획이 성공적으로 삭제되었습니다.",
  DELETE_ERROR: "운동 계획 삭제에 실패했습니다. 다시 시도해주세요.",
} as const

export const COMMUNITY_VALIDATION_MESSAGES = {
  TITLE_REQUIRED: "제목을 입력해주세요.",
  TITLE_INVALID: "제목은 2-100자 이내로 입력해주세요.",
  CONTENT_REQUIRED: "내용을 입력해주세요.",
  CONTENT_INVALID: "내용은 10-5000자 이내로 입력해주세요.",
  CATEGORY_REQUIRED: "카테고리를 선택해주세요.",

  // 서버 응답 메시지
  POST_SUCCESS: "게시글이 성공적으로 작성되었습니다.",
  POST_ERROR: "게시글 작성에 실패했습니다. 다시 시도해주세요.",
  UPDATE_SUCCESS: "게시글이 성공적으로 수정되었습니다.",
  UPDATE_ERROR: "게시글 수정에 실패했습니다. 다시 시도해주세요.",
  DELETE_SUCCESS: "게시글이 성공적으로 삭제되었습니다.",
  DELETE_ERROR: "게시글 삭제에 실패했습니다. 다시 시도해주세요.",
} as const

// 타입 정의
export type ValidationMessageKey =
  | keyof typeof SIGNUP_VALIDATION_MESSAGES
  | keyof typeof LOGIN_VALIDATION_MESSAGES
  | keyof typeof PROFILE_VALIDATION_MESSAGES
  | keyof typeof PASSWORD_VALIDATION_MESSAGES
  | keyof typeof WORKOUT_VALIDATION_MESSAGES
  | keyof typeof COMMUNITY_VALIDATION_MESSAGES

// 헬퍼 함수
export function getValidationMessage(category: string, key: string): string {
  switch (category) {
    case "signup":
      return (
        SIGNUP_VALIDATION_MESSAGES[
          key as keyof typeof SIGNUP_VALIDATION_MESSAGES
        ] || "알 수 없는 오류가 발생했습니다."
      )
    case "login":
      return (
        LOGIN_VALIDATION_MESSAGES[
          key as keyof typeof LOGIN_VALIDATION_MESSAGES
        ] || "알 수 없는 오류가 발생했습니다."
      )
    case "profile":
      return (
        PROFILE_VALIDATION_MESSAGES[
          key as keyof typeof PROFILE_VALIDATION_MESSAGES
        ] || "알 수 없는 오류가 발생했습니다."
      )
    case "password":
      return (
        PASSWORD_VALIDATION_MESSAGES[
          key as keyof typeof PASSWORD_VALIDATION_MESSAGES
        ] || "알 수 없는 오류가 발생했습니다."
      )
    case "workout":
      return (
        WORKOUT_VALIDATION_MESSAGES[
          key as keyof typeof WORKOUT_VALIDATION_MESSAGES
        ] || "알 수 없는 오류가 발생했습니다."
      )
    case "community":
      return (
        COMMUNITY_VALIDATION_MESSAGES[
          key as keyof typeof COMMUNITY_VALIDATION_MESSAGES
        ] || "알 수 없는 오류가 발생했습니다."
      )
    default:
      return "알 수 없는 오류가 발생했습니다."
  }
}
