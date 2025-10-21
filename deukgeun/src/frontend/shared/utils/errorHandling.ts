/**
 * 에러 처리 유틸리티 함수들
 * 일관된 에러 처리 및 로깅을 위한 함수들
 */

// ============================================================================
// 에러 타입 정의
// ============================================================================

export interface AppError {
  code: string
  message: string
  details?: unknown
  timestamp: string
  stack?: string
}

export interface ValidationError extends AppError {
  code: 'VALIDATION_ERROR'
  field?: string
  value?: unknown
}

export interface NetworkError extends AppError {
  code: 'NETWORK_ERROR'
  status?: number
  url?: string
}

export interface AuthError extends AppError {
  code: 'AUTH_ERROR'
  reason?: 'UNAUTHORIZED' | 'FORBIDDEN' | 'TOKEN_EXPIRED'
}

// ============================================================================
// 에러 생성 함수들
// ============================================================================

/**
 * 기본 앱 에러 생성
 */
export function createAppError(
  code: string,
  message: string,
  details?: unknown
): AppError {
  return {
    code,
    message,
    details,
    timestamp: new Date().toISOString(),
    stack: new Error().stack
  }
}

/**
 * 유효성 검사 에러 생성
 */
export function createValidationError(
  message: string,
  field?: string,
  value?: unknown
): ValidationError {
  return {
    code: 'VALIDATION_ERROR',
    message,
    field,
    value,
    timestamp: new Date().toISOString(),
    stack: new Error().stack
  }
}

/**
 * 네트워크 에러 생성
 */
export function createNetworkError(
  message: string,
  status?: number,
  url?: string
): NetworkError {
  return {
    code: 'NETWORK_ERROR',
    message,
    status,
    url,
    timestamp: new Date().toISOString(),
    stack: new Error().stack
  }
}

/**
 * 인증 에러 생성
 */
export function createAuthError(
  message: string,
  reason?: 'UNAUTHORIZED' | 'FORBIDDEN' | 'TOKEN_EXPIRED'
): AuthError {
  return {
    code: 'AUTH_ERROR',
    message,
    reason,
    timestamp: new Date().toISOString(),
    stack: new Error().stack
  }
}

// ============================================================================
// 에러 처리 함수들
// ============================================================================

/**
 * 에러를 안전하게 처리하고 로깅
 */
export function handleError(error: unknown, context?: string): AppError {
  let appError: AppError

  if (isAppError(error)) {
    appError = error
  } else if (error instanceof Error) {
    appError = createAppError('UNKNOWN_ERROR', error.message, {
      originalError: error.name,
      context
    })
  } else if (typeof error === 'string') {
    appError = createAppError('STRING_ERROR', error, { context })
  } else {
    appError = createAppError('UNKNOWN_ERROR', '알 수 없는 오류가 발생했습니다.', {
      originalError: error,
      context
    })
  }

  // 에러 로깅
  logError(appError, context)
  
  return appError
}

/**
 * 네트워크 에러 처리
 */
export function handleNetworkError(
  error: unknown,
  url?: string,
  status?: number
): NetworkError {
  let message = '네트워크 오류가 발생했습니다.'
  
  if (error instanceof Error) {
    message = error.message
  } else if (typeof error === 'string') {
    message = error
  }

  const networkError = createNetworkError(message, status, url)
  logError(networkError, 'Network')
  
  return networkError
}

/**
 * 유효성 검사 에러 처리
 */
export function handleValidationError(
  message: string,
  field?: string,
  value?: unknown
): ValidationError {
  const validationError = createValidationError(message, field, value)
  logError(validationError, 'Validation')
  
  return validationError
}

/**
 * 인증 에러 처리
 */
export function handleAuthError(
  message: string,
  reason?: 'UNAUTHORIZED' | 'FORBIDDEN' | 'TOKEN_EXPIRED'
): AuthError {
  const authError = createAuthError(message, reason)
  logError(authError, 'Authentication')
  
  return authError
}

// ============================================================================
// 에러 로깅
// ============================================================================

/**
 * 에러 로깅
 */
export function logError(error: AppError, context?: string): void {
  const logData = {
    error: {
      code: error.code,
      message: error.message,
      details: error.details,
      timestamp: error.timestamp,
      context
    },
    userAgent: navigator.userAgent,
    url: window.location.href,
    timestamp: new Date().toISOString()
  }

  // 개발 환경에서는 콘솔에 로깅
  if (import.meta.env.DEV) {
    console.error(`[${context || 'App'}] Error:`, logData)
  }

  // 프로덕션 환경에서는 외부 로깅 서비스로 전송
  if (import.meta.env.PROD) {
    // TODO: 실제 로깅 서비스 연동 (예: Sentry, LogRocket 등)
    console.error('Production Error:', logData)
  }
}

/**
 * 에러 통계 수집
 */
export function collectErrorStats(error: AppError): void {
  // TODO: 에러 통계 수집 로직 구현
  // 예: 특정 에러 코드의 빈도, 사용자별 에러 패턴 등
}

// ============================================================================
// 에러 복구 함수들
// ============================================================================

/**
 * 재시도 가능한 에러인지 확인
 */
export function isRetryableError(error: AppError): boolean {
  const retryableCodes = [
    'NETWORK_ERROR',
    'TIMEOUT_ERROR',
    'SERVER_ERROR'
  ]
  
  return retryableCodes.includes(error.code)
}

/**
 * 지수 백오프를 사용한 재시도
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: unknown
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      if (attempt === maxRetries) {
        break
      }
      
      const delay = baseDelay * Math.pow(2, attempt)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw handleError(lastError, 'RetryWithBackoff')
}

/**
 * 에러 발생 시 대체값 반환
 */
export function withFallback<T>(
  fn: () => T,
  fallback: T,
  context?: string
): T {
  try {
    return fn()
  } catch (error) {
    handleError(error, context)
    return fallback
  }
}

/**
 * Promise 에러 처리
 */
export function handlePromiseError<T>(
  promise: Promise<T>,
  fallback: T,
  context?: string
): Promise<T> {
  return promise.catch(error => {
    handleError(error, context)
    return fallback
  })
}

// ============================================================================
// 에러 타입 가드
// ============================================================================

/**
 * AppError 타입 가드
 */
export function isAppError(error: unknown): error is AppError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    'timestamp' in error
  )
}

/**
 * ValidationError 타입 가드
 */
export function isValidationError(error: unknown): error is ValidationError {
  return isAppError(error) && error.code === 'VALIDATION_ERROR'
}

/**
 * NetworkError 타입 가드
 */
export function isNetworkError(error: unknown): error is NetworkError {
  return isAppError(error) && error.code === 'NETWORK_ERROR'
}

/**
 * AuthError 타입 가드
 */
export function isAuthError(error: unknown): error is AuthError {
  return isAppError(error) && error.code === 'AUTH_ERROR'
}

// ============================================================================
// 에러 메시지 포맷팅
// ============================================================================

/**
 * 사용자 친화적인 에러 메시지 생성
 */
export function formatErrorMessage(error: AppError): string {
  const errorMessages: Record<string, string> = {
    VALIDATION_ERROR: '입력한 정보를 다시 확인해주세요.',
    NETWORK_ERROR: '네트워크 연결을 확인해주세요.',
    AUTH_ERROR: '로그인이 필요합니다.',
    SERVER_ERROR: '서버에 일시적인 문제가 발생했습니다.',
    TIMEOUT_ERROR: '요청 시간이 초과되었습니다.',
    UNKNOWN_ERROR: '알 수 없는 오류가 발생했습니다.'
  }

  return errorMessages[error.code] || error.message
}

/**
 * 에러 상세 정보 포맷팅
 */
export function formatErrorDetails(error: AppError): string {
  let details = `오류 코드: ${error.code}\n`
  details += `메시지: ${error.message}\n`
  details += `시간: ${new Date(error.timestamp).toLocaleString()}\n`
  
  if (error.details) {
    details += `상세 정보: ${JSON.stringify(error.details, null, 2)}\n`
  }
  
  return details
}
