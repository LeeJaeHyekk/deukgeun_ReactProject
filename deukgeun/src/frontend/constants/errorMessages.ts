// 프론트엔드 전용 HTTP 에러 메시지 상수

export const HTTP_ERROR_MESSAGES = {
  400: "잘못된 요청입니다.",
  401: "인증이 필요합니다.",
  403: "접근 권한이 없습니다.",
  404: "요청한 리소스를 찾을 수 없습니다.",
  409: "이미 존재하는 데이터입니다.",
  422: "입력 데이터가 올바르지 않습니다.",
  429: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
  500: "서버 내부 오류가 발생했습니다.",
  502: "서버가 일시적으로 사용할 수 없습니다.",
  503: "서비스를 일시적으로 사용할 수 없습니다.",
  504: "서버 응답 시간이 초과되었습니다."
} as const

export const ERROR_TOAST_TYPES = {
  NETWORK_ERROR: "네트워크 연결을 확인해주세요.",
  TIMEOUT_ERROR: "요청 시간이 초과되었습니다. 다시 시도해주세요.",
  UNKNOWN_ERROR: "알 수 없는 오류가 발생했습니다.",
  VALIDATION_ERROR: "입력 정보를 확인해주세요.",
  PERMISSION_ERROR: "권한이 없습니다.",
  SERVER_ERROR: "서버 오류가 발생했습니다."
} as const

export const API_ERROR_MESSAGES = {
  // 일반적인 API 오류
  NETWORK_ERROR: "네트워크 연결을 확인해주세요.",
  TIMEOUT_ERROR: "요청 시간이 초과되었습니다.",
  PARSE_ERROR: "서버 응답을 처리할 수 없습니다.",
  UNKNOWN_ERROR: "알 수 없는 오류가 발생했습니다.",
  
  // 인증 관련 오류
  AUTHENTICATION_FAILED: "인증에 실패했습니다.",
  TOKEN_EXPIRED: "인증 토큰이 만료되었습니다.",
  REFRESH_FAILED: "토큰 갱신에 실패했습니다.",
  
  // 권한 관련 오류
  PERMISSION_DENIED: "접근 권한이 없습니다.",
  ADMIN_ONLY: "관리자만 접근할 수 있습니다.",
  
  // 데이터 관련 오류
  NOT_FOUND: "요청한 데이터를 찾을 수 없습니다.",
  ALREADY_EXISTS: "이미 존재하는 데이터입니다.",
  VALIDATION_FAILED: "입력 데이터 검증에 실패했습니다.",
  
  // 서버 관련 오류
  INTERNAL_ERROR: "서버 내부 오류가 발생했습니다.",
  SERVICE_UNAVAILABLE: "서비스를 일시적으로 사용할 수 없습니다.",
  MAINTENANCE: "서버 점검 중입니다."
} as const

// 에러 코드별 메시지 매핑
export function getHttpErrorMessage(statusCode: number): string {
  return HTTP_ERROR_MESSAGES[statusCode as keyof typeof HTTP_ERROR_MESSAGES] || HTTP_ERROR_MESSAGES[500]
}

// 에러 타입별 메시지 가져오기
export function getErrorToastMessage(errorType: keyof typeof ERROR_TOAST_TYPES): string {
  return ERROR_TOAST_TYPES[errorType]
}

// API 에러 메시지 가져오기
export function getApiErrorMessage(errorType: keyof typeof API_ERROR_MESSAGES): string {
  return API_ERROR_MESSAGES[errorType]
}

// 에러 객체에서 사용자 친화적 메시지 추출
export function extractErrorMessage(error: any): string {
  if (typeof error === 'string') {
    return error
  }
  
  if (error?.response?.data?.message) {
    return error.response.data.message
  }
  
  if (error?.message) {
    return error.message
  }
  
  if (error?.response?.status) {
    return getHttpErrorMessage(error.response.status)
  }
  
  return API_ERROR_MESSAGES.UNKNOWN_ERROR
}
