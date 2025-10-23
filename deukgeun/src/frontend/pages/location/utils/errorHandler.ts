/**
 * 에러 핸들링 유틸리티
 */

export interface AppError {
  code: string
  message: string
  details?: any
}

/**
 * 에러 타입 정의
 */
export enum ErrorType {
  NETWORK = 'NETWORK_ERROR',
  VALIDATION = 'VALIDATION_ERROR',
  GEOLOCATION = 'GEOLOCATION_ERROR',
  DATA_PARSE = 'DATA_PARSE_ERROR',
  UNKNOWN = 'UNKNOWN_ERROR'
}

/**
 * 에러 생성 함수
 */
export const createError = (
  type: ErrorType,
  message: string,
  details?: any
): AppError => ({
  code: type,
  message,
  details
})

/**
 * 네트워크 에러 처리
 */
export const handleNetworkError = (error: any): AppError => {
  if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
    return createError(
      ErrorType.NETWORK,
      '네트워크 연결을 확인해주세요.',
      error
    )
  }
  
  return createError(
    ErrorType.NETWORK,
    '서버와의 통신 중 오류가 발생했습니다.',
    error
  )
}

/**
 * 지오로케이션 에러 처리
 */
export const handleGeolocationError = (error: GeolocationPositionError): AppError => {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return createError(
        ErrorType.GEOLOCATION,
        '위치 정보 접근 권한이 거부되었습니다.',
        error
      )
    case error.POSITION_UNAVAILABLE:
      return createError(
        ErrorType.GEOLOCATION,
        '위치 정보를 사용할 수 없습니다.',
        error
      )
    case error.TIMEOUT:
      return createError(
        ErrorType.GEOLOCATION,
        '위치 정보 요청 시간이 초과되었습니다.',
        error
      )
    default:
      return createError(
        ErrorType.GEOLOCATION,
        '위치 정보를 가져올 수 없습니다.',
        error
      )
  }
}

/**
 * 데이터 파싱 에러 처리
 */
export const handleDataParseError = (error: any): AppError => {
  return createError(
    ErrorType.DATA_PARSE,
    '데이터를 처리하는 중 오류가 발생했습니다.',
    error
  )
}

/**
 * 유효성 검사 에러 처리
 */
export const handleValidationError = (message: string, details?: any): AppError => {
  return createError(
    ErrorType.VALIDATION,
    message,
    details
  )
}

/**
 * 에러 로깅 (개발 환경에서만)
 */
export const logError = (error: AppError, context?: string): void => {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${context || 'ERROR'}]`, {
      code: error.code,
      message: error.message,
      details: error.details
    })
  }
}

/**
 * 사용자 친화적 에러 메시지 생성
 */
export const getUserFriendlyMessage = (error: AppError): string => {
  switch (error.code) {
    case ErrorType.NETWORK:
      return '인터넷 연결을 확인하고 다시 시도해주세요.'
    case ErrorType.GEOLOCATION:
      return '위치 정보를 허용하거나 수동으로 지역을 선택해주세요.'
    case ErrorType.VALIDATION:
      return '입력한 정보를 확인해주세요.'
    case ErrorType.DATA_PARSE:
      return '데이터를 불러오는 중 문제가 발생했습니다.'
    default:
      return '알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
  }
}
