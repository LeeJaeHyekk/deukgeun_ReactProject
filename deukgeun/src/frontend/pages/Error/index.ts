// Error 관련 컴포넌트 및 유틸리티 export

// 주요 컴포넌트
export { default as ErrorPage } from './ErrorPage'
export {
  ErrorBoundary,
  withErrorBoundary,
  useErrorBoundary,
  ErrorBoundaryProvider,
  useErrorBoundaryContext,
} from './ErrorBoundary'
export { ErrorDashboard } from './ErrorDashboard'

// 에러 핸들링 시스템
export {
  default as globalErrorHandler,
  reportError,
  getErrorHistory,
  clearErrorHistory,
  showErrorNotification,
} from './GlobalErrorHandler'
export { errorLogger, getErrorAnalytics, clearErrorLogs } from './ErrorLogger'

// 에러 훅
export {
  useErrorHandler,
  useAuthErrorHandler,
  useApiErrorHandler,
  useFormErrorHandler,
} from './useErrorHandler'

// 타입 정의
export interface ErrorContext {
  message: string
  stack?: string
  timestamp: Date
  url: string
  userAgent: string
  userId?: string
  sessionId?: string
  componentStack?: string
  errorType: 'javascript' | 'network' | 'promise' | 'resource'
}

export interface ErrorHandlerConfig {
  enableConsoleLogging: boolean
  enableServerReporting: boolean
  enableUserNotification: boolean
  maxErrorHistory: number
}

// 편의 함수들
export const createErrorPage = (
  statusCode: number,
  title?: string,
  message?: string
) => {
  return {
    statusCode,
    title,
    message,
  }
}

// 에러 페이지 URL 생성
export const createErrorUrl = (
  statusCode: number,
  title?: string,
  message?: string
): string => {
  const params = new URLSearchParams()
  params.set('code', statusCode.toString())
  if (title) params.set('title', encodeURIComponent(title))
  if (message) params.set('message', encodeURIComponent(message))

  return `/error?${params.toString()}`
}

// 에러 페이지로 네비게이션
export const navigateToError = (
  navigate: (path: string) => void,
  statusCode: number,
  title?: string,
  message?: string
) => {
  const errorUrl = createErrorUrl(statusCode, title, message)
  navigate(errorUrl)
}

// HTTP 상태 코드별 기본 에러 정보
export const ERROR_CONFIGS = {
  400: {
    title: '잘못된 요청',
    message: '요청하신 정보가 올바르지 않습니다. 다시 확인해주세요.',
    showRetryButton: true,
  },
  401: {
    title: '인증이 필요합니다',
    message: '로그인이 필요한 서비스입니다. 로그인 후 다시 시도해주세요.',
    showRetryButton: false,
  },
  403: {
    title: '접근이 거부되었습니다',
    message: '이 페이지에 접근할 권한이 없습니다.',
    showRetryButton: false,
  },
  404: {
    title: '페이지를 찾을 수 없어요',
    message: '요청하신 페이지가 존재하지 않거나, 이동되었을 수 있어요.',
    showRetryButton: false,
  },
  500: {
    title: '서버 오류가 발생했습니다',
    message: '일시적인 서버 오류입니다. 잠시 후 다시 시도해주세요.',
    showRetryButton: true,
  },
  503: {
    title: '서비스가 일시적으로 사용할 수 없습니다',
    message: '서버 점검 중입니다. 잠시 후 다시 시도해주세요.',
    showRetryButton: true,
  },
} as const

export const showError = (
  message: string,
  type: 'error' | 'warning' | 'info' = 'error'
) => {
  if (typeof window !== 'undefined') {
    // 정적 import로 변경하여 Vite 경고 해결
    const { showErrorNotification } = require('./GlobalErrorHandler')
    showErrorNotification(message, type)
  }
}

// 에러 타입별 색상 매핑
export const getErrorTypeColor = (type: string): string => {
  const colors: { [key: string]: string } = {
    TypeError: '#ef4444',
    ReferenceError: '#f59e0b',
    SyntaxError: '#3b82f6',
    NetworkError: '#10b981',
    default: '#6b7280',
  }
  return colors[type] || colors.default
}

// 심각도별 색상 매핑
export const getSeverityColor = (severity: string): string => {
  const colors: { [key: string]: string } = {
    critical: '#ef4444',
    error: '#f59e0b',
    warning: '#3b82f6',
    info: '#10b981',
  }
  return colors[severity] || '#6b7280'
}

// 에러 메시지 포맷팅
export const formatErrorMessage = (error: Error | string): string => {
  if (typeof error === 'string') {
    return error
  }
  return error.message || '알 수 없는 오류가 발생했습니다.'
}

// 에러 스택 트레이스 정리
export const cleanStackTrace = (stack?: string): string => {
  if (!stack) return ''

  // 불필요한 정보 제거 및 정리
  return stack
    .split('\n')
    .filter(line => !line.includes('node_modules') && !line.includes('webpack'))
    .slice(0, 10) // 최대 10줄까지만 표시
    .join('\n')
}

// 에러 컨텍스트 생성
export const createErrorContext = (
  error: Error,
  additionalContext?: Partial<ErrorContext>
): ErrorContext => {
  return {
    message: error.message,
    stack: error.stack,
    timestamp: new Date(),
    url: typeof window !== 'undefined' ? window.location.href : '',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    userId: localStorage.getItem('userId') || undefined,
    sessionId: sessionStorage.getItem('sessionId') || undefined,
    errorType: 'javascript',
    ...additionalContext,
  }
}

// 에러 로깅 유틸리티
export const logError = (error: Error, context?: Partial<ErrorContext>) => {
  if (typeof window !== 'undefined') {
    // 정적 import로 변경하여 Vite 경고 해결
    const { reportError } = require('./GlobalErrorHandler')
    reportError(error, context)
  }
}

// 에러 복구 시도
export const attemptErrorRecovery = async (error: Error): Promise<boolean> => {
  try {
    // 간단한 복구 시도 (예: 캐시 클리어, 재시도 등)
    if (error.message.includes('network') || error.message.includes('fetch')) {
      // 네트워크 에러의 경우 잠시 대기 후 재시도
      await new Promise(resolve => setTimeout(resolve, 1000))
      return true
    }
    return false
  } catch {
    return false
  }
}

// 에러 통계 계산
export const calculateErrorStats = (errors: ErrorContext[]) => {
  const stats = {
    total: errors.length,
    byType: {} as { [key: string]: number },
    bySeverity: {} as { [key: string]: number },
    recent: errors.filter(
      e => new Date().getTime() - e.timestamp.getTime() < 60 * 60 * 1000 // 1시간 내
    ).length,
  }

  errors.forEach(error => {
    stats.byType[error.errorType] = (stats.byType[error.errorType] || 0) + 1
  })

  return stats
}

// 에러 필터링
export const filterErrors = (
  errors: ErrorContext[],
  filters: {
    type?: string
    severity?: string
    timeRange?: { start: Date; end: Date }
    userId?: string
  }
) => {
  return errors.filter(error => {
    if (filters.type && error.errorType !== filters.type) return false
    if (filters.userId && error.userId !== filters.userId) return false
    if (filters.timeRange) {
      const errorTime = error.timestamp.getTime()
      if (
        errorTime < filters.timeRange.start.getTime() ||
        errorTime > filters.timeRange.end.getTime()
      ) {
        return false
      }
    }
    return true
  })
}

// 에러 내보내기
export const exportErrorData = (errors: ErrorContext[]): string => {
  const exportData = {
    exportDate: new Date().toISOString(),
    totalErrors: errors.length,
    errors: errors.map(error => ({
      ...error,
      timestamp: error.timestamp.toISOString(),
    })),
  }

  return JSON.stringify(exportData, null, 2)
}

// 에러 가져오기
export const importErrorData = (data: string): ErrorContext[] => {
  try {
    const parsed = JSON.parse(data)
    return parsed.errors.map((error: any) => ({
      ...error,
      timestamp: new Date(error.timestamp),
    }))
  } catch {
    throw new Error('Invalid error data format')
  }
}
