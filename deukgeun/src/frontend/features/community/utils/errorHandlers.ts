// ============================================================================
// 커뮤니티 기능 에러 처리 유틸리티
// ============================================================================

import { CommunityError } from '../types'
import { isValidError } from './typeGuards'

/**
 * 에러 타입을 구분하여 적절한 메시지 반환
 */
export function getErrorMessage(error: unknown): string {
  if (isValidError(error)) {
    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message)
  }

  return '알 수 없는 오류가 발생했습니다.'
}

/**
 * 네트워크 에러인지 확인
 */
export function isNetworkError(error: unknown): boolean {
  if (isValidError(error)) {
    return (
      error.message.includes('Network Error') ||
      error.message.includes('fetch') ||
      error.message.includes('timeout') ||
      error.message.includes('ERR_NETWORK')
    )
  }
  return false
}

/**
 * API 에러인지 확인
 */
export function isApiError(error: unknown): boolean {
  if (isValidError(error)) {
    return (
      error.message.includes('API') ||
      error.message.includes('서버') ||
      error.message.includes('응답')
    )
  }
  return false
}

/**
 * 인증 에러인지 확인
 */
export function isAuthError(error: unknown): boolean {
  if (isValidError(error)) {
    return (
      error.message.includes('인증') ||
      error.message.includes('로그인') ||
      error.message.includes('권한') ||
      error.message.includes('401') ||
      error.message.includes('403')
    )
  }
  return false
}

/**
 * 에러에 따른 사용자 친화적 메시지 생성
 */
export function getUserFriendlyMessage(error: unknown): string {
  if (isNetworkError(error)) {
    return '네트워크 연결을 확인해주세요.'
  }

  if (isAuthError(error)) {
    return '로그인이 필요합니다.'
  }

  if (isApiError(error)) {
    return '서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.'
  }

  return getErrorMessage(error)
}

/**
 * 에러 로깅
 */
export function logError(context: string, error: unknown, additionalInfo?: any): void {
  const errorMessage = getErrorMessage(error)
  const userMessage = getUserFriendlyMessage(error)
  
  console.error(`[${context}] 오류 발생:`, {
    error: errorMessage,
    userMessage,
    additionalInfo,
    timestamp: new Date().toISOString()
  })
}

/**
 * CommunityError 객체 생성
 */
export function createCommunityError(
  code: string,
  message: string,
  details?: any
): CommunityError {
  return {
    code,
    message,
    details
  }
}

/**
 * API 응답 에러 처리
 */
export function handleApiError(response: any, context: string): CommunityError {
  const message = response?.message || response?.error || 'API 요청에 실패했습니다.'
  const code = response?.code || 'API_ERROR'
  
  logError(context, message, { response })
  
  return createCommunityError(code, message, response)
}
