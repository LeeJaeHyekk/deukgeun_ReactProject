import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ROUTES } from '@frontend/shared/constants/routes'
import EnhancedErrorPage from './EnhancedErrorPage'

// 에러 타입 정의
export interface AppError {
  statusCode: number
  title: string
  message: string
  description?: string
  suggestions?: string[]
  isRetryable?: boolean
  isAuthRequired?: boolean
  timestamp?: string
  errorId?: string
  stack?: string
}

// 에러 핸들러 유틸리티
export class ErrorHandler {
  static createError(
    statusCode: number,
    title: string,
    message: string,
    options: Partial<AppError> = {}
  ): AppError {
    return {
      statusCode,
      title,
      message,
      description: options.description,
      suggestions: options.suggestions,
      isRetryable: options.isRetryable ?? false,
      isAuthRequired: options.isAuthRequired ?? false,
      timestamp: new Date().toISOString(),
      errorId: options.errorId || this.generateErrorId(),
      stack: options.stack,
    }
  }

  static generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  static getErrorFromException(error: Error): AppError {
    // 네트워크 에러
    if (error.message.includes('Network') || error.message.includes('fetch')) {
      return this.createError(
        503,
        '네트워크 연결 오류',
        '인터넷 연결을 확인해주세요.',
        {
          description: '서버와의 연결에 문제가 있습니다.',
          suggestions: [
            '인터넷 연결 상태를 확인해주세요',
            'Wi-Fi 연결을 다시 시도해주세요',
            '모바일 데이터를 사용해보세요',
          ],
          isRetryable: true,
        }
      )
    }

    // 타임아웃 에러
    if (error.message.includes('timeout')) {
      return this.createError(
        408,
        '요청 시간 초과',
        '서버 응답이 지연되고 있습니다.',
        {
          description: '요청 처리 시간이 초과되었습니다.',
          suggestions: [
            '잠시 후 다시 시도해주세요',
            '인터넷 연결 속도를 확인해주세요',
            '서버 상태를 확인해주세요',
          ],
          isRetryable: true,
        }
      )
    }

    // 인증 에러
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      return this.createError(
        401,
        '인증이 필요합니다',
        '로그인이 필요한 서비스입니다.',
        {
          description: '세션이 만료되었거나 로그인이 필요합니다.',
          suggestions: [
            '로그인 페이지로 이동해주세요',
            '계정 정보를 확인해주세요',
            '비밀번호를 재설정해보세요',
          ],
          isAuthRequired: true,
        }
      )
    }

    // 권한 에러
    if (error.message.includes('403') || error.message.includes('Forbidden')) {
      return this.createError(
        403,
        '접근 권한이 없습니다',
        '이 페이지에 접근할 권한이 없습니다.',
        {
          description: '관리자에게 문의하거나 다른 계정으로 로그인해보세요.',
          suggestions: [
            '계정 권한을 확인해주세요',
            '관리자에게 문의해주세요',
            '다른 계정으로 로그인해보세요',
          ],
          isAuthRequired: true,
        }
      )
    }

    // 서버 에러
    if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
      return this.createError(
        500,
        '서버 오류가 발생했습니다',
        '일시적인 서버 오류입니다.',
        {
          description: '서버에서 예상치 못한 오류가 발생했습니다.',
          suggestions: [
            '잠시 후 다시 시도해주세요',
            '브라우저를 새로고침해보세요',
            '문제가 지속되면 고객센터에 문의해주세요',
          ],
          isRetryable: true,
        }
      )
    }

    // 기본 에러
    return this.createError(
      500,
      '예상치 못한 오류가 발생했습니다',
      '시스템 오류가 발생했습니다.',
      {
        description: '알 수 없는 오류가 발생했습니다.',
        suggestions: [
          '페이지를 새로고침해보세요',
          '브라우저를 재시작해보세요',
          '문제가 지속되면 고객센터에 문의해주세요',
        ],
        isRetryable: true,
        stack: error.stack,
      }
    )
  }

  static getErrorFromStatusCode(statusCode: number): AppError {
    switch (statusCode) {
      case 400:
        return this.createError(
          400,
          '잘못된 요청',
          '요청하신 정보가 올바르지 않습니다.',
          {
            description: '입력한 정보를 다시 확인해주세요.',
            suggestions: [
              '입력한 URL이나 파라미터를 확인해주세요',
              '브라우저 캐시를 삭제해보세요',
              '잠시 후 다시 시도해주세요',
            ],
            isRetryable: true,
          }
        )

      case 401:
        return this.createError(
          401,
          '인증이 필요합니다',
          '로그인이 필요한 서비스입니다.',
          {
            description: '로그인 후 다시 시도해주세요.',
            suggestions: [
              '로그인 페이지로 이동해주세요',
              '계정 정보를 확인해주세요',
              '비밀번호를 재설정해보세요',
            ],
            isAuthRequired: true,
          }
        )

      case 403:
        return this.createError(
          403,
          '접근이 거부되었습니다',
          '이 페이지에 접근할 권한이 없습니다.',
          {
            description: '관리자에게 문의하거나 다른 계정으로 로그인해보세요.',
            suggestions: [
              '계정 권한을 확인해주세요',
              '관리자에게 문의해주세요',
              '다른 계정으로 로그인해보세요',
            ],
            isAuthRequired: true,
          }
        )

      case 404:
        return this.createError(
          404,
          '페이지를 찾을 수 없어요',
          '요청하신 페이지가 존재하지 않습니다.',
          {
            description: '페이지가 이동되었거나 삭제되었을 수 있어요.',
            suggestions: [
              'URL을 다시 확인해주세요',
              '홈페이지에서 원하는 페이지를 찾아보세요',
              '검색 기능을 이용해보세요',
            ],
          }
        )

      case 408:
        return this.createError(
          408,
          '요청 시간 초과',
          '서버 응답이 지연되고 있습니다.',
          {
            description: '요청 처리 시간이 초과되었습니다.',
            suggestions: [
              '잠시 후 다시 시도해주세요',
              '인터넷 연결 속도를 확인해주세요',
              '서버 상태를 확인해주세요',
            ],
            isRetryable: true,
          }
        )

      case 429:
        return this.createError(
          429,
          '요청 한도 초과',
          '너무 많은 요청을 보내셨습니다.',
          {
            description: '잠시 후 다시 시도해주세요.',
            suggestions: [
              '잠시 기다린 후 다시 시도해주세요',
              '요청 빈도를 줄여주세요',
              '문제가 지속되면 고객센터에 문의해주세요',
            ],
            isRetryable: true,
          }
        )

      case 500:
        return this.createError(
          500,
          '서버 오류가 발생했습니다',
          '일시적인 서버 오류입니다.',
          {
            description: '서버에서 예상치 못한 오류가 발생했습니다.',
            suggestions: [
              '잠시 후 다시 시도해주세요',
              '브라우저를 새로고침해보세요',
              '문제가 지속되면 고객센터에 문의해주세요',
            ],
            isRetryable: true,
          }
        )

      case 502:
        return this.createError(
          502,
          '게이트웨이 오류',
          '서버 게이트웨이에 문제가 있습니다.',
          {
            description: '업스트림 서버에서 잘못된 응답을 받았습니다.',
            suggestions: [
              '잠시 후 다시 시도해주세요',
              '서버 상태를 확인해주세요',
              '문제가 지속되면 고객센터에 문의해주세요',
            ],
            isRetryable: true,
          }
        )

      case 503:
        return this.createError(
          503,
          '서비스가 일시적으로 사용할 수 없습니다',
          '서버 점검 중입니다.',
          {
            description: '점검이 완료되면 다시 이용하실 수 있습니다.',
            suggestions: [
              '잠시 후 다시 시도해주세요',
              '공지사항을 확인해주세요',
              '점검 시간을 확인해주세요',
            ],
            isRetryable: true,
          }
        )

      case 504:
        return this.createError(
          504,
          '게이트웨이 시간 초과',
          '서버 응답 시간이 초과되었습니다.',
          {
            description: '업스트림 서버에서 응답을 받지 못했습니다.',
            suggestions: [
              '잠시 후 다시 시도해주세요',
              '인터넷 연결을 확인해주세요',
              '문제가 지속되면 고객센터에 문의해주세요',
            ],
            isRetryable: true,
          }
        )

      case 999:
        return this.createError(
          999,
          '현재 준비중에 있습니다',
          '해당 기능은 현재 개발 중입니다.',
          {
            description: '조금만 기다려주세요! 곧 만나보실 수 있어요.',
            suggestions: [
              '다른 기능을 먼저 이용해보세요',
              '공지사항을 확인해주세요',
              '이메일 알림을 신청해보세요',
            ],
          }
        )

      default:
        return this.createError(
          statusCode,
          '오류가 발생했습니다',
          '예상치 못한 오류가 발생했습니다.',
          {
            description: '다시 시도해주세요.',
            suggestions: [
              '페이지를 새로고침해보세요',
              '브라우저를 재시작해보세요',
              '문제가 지속되면 고객센터에 문의해주세요',
            ],
            isRetryable: true,
          }
        )
    }
  }
}

// 에러 페이지 컴포넌트
interface ErrorHandlerProps {
  error?: AppError | Error
  statusCode?: number
  customActions?: Array<{
    label: string
    action: () => void
    variant: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success'
    icon?: string
  }>
}

export default function ErrorHandler({ 
  error, 
  statusCode, 
  customActions 
}: ErrorHandlerProps) {
  const navigate = useNavigate()
  const location = useLocation()

  // 에러 정보 결정
  const getErrorInfo = (): AppError => {
    if (error instanceof Error) {
      return ErrorHandler.getErrorFromException(error)
    }
    
    if (error && 'statusCode' in error) {
      return error as AppError
    }
    
    if (statusCode) {
      return ErrorHandler.getErrorFromStatusCode(statusCode)
    }
    
    // URL 파라미터에서 에러 정보 추출
    const searchParams = new URLSearchParams(location.search)
    const urlStatusCode = searchParams.get('code')
    
    if (urlStatusCode) {
      return ErrorHandler.getErrorFromStatusCode(parseInt(urlStatusCode, 10))
    }
    
    // 기본 404 에러
    return ErrorHandler.getErrorFromStatusCode(404)
  }

  const errorInfo = getErrorInfo()

  // 커스텀 액션들
  const defaultActions = customActions || []

  return (
    <EnhancedErrorPage
      statusCode={errorInfo.statusCode}
      title={errorInfo.title}
      message={errorInfo.message}
      description={errorInfo.description}
      suggestions={errorInfo.suggestions}
      showHomeButton={true}
      showRetryButton={errorInfo.isRetryable}
      customActions={defaultActions}
    />
  )
}

// 에러 리포팅 유틸리티
export class ErrorReporter {
  static reportError(error: AppError, context?: Record<string, any>) {
    // 개발 환경에서는 콘솔에 출력
    if (import.meta.env.DEV) {
      console.group('🚨 Error Report')
      console.error('Error Info:', error)
      console.error('Context:', context)
      console.error('Timestamp:', new Date().toISOString())
      console.groupEnd()
    }

    // 프로덕션에서는 에러 리포팅 서비스로 전송
    if (import.meta.env.PROD) {
      // TODO: 실제 에러 리포팅 서비스 연동 (Sentry, LogRocket 등)
      this.sendToErrorService(error, context)
    }
  }

  private static async sendToErrorService(error: AppError, context?: Record<string, any>) {
    try {
      // 에러 정보를 서버로 전송
      const response = await fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...error,
          context,
          userAgent: navigator.userAgent,
          url: window.location.href,
          timestamp: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        console.error('Failed to report error to server')
      }
    } catch (reportingError) {
      console.error('Error reporting failed:', reportingError)
    }
  }
}
