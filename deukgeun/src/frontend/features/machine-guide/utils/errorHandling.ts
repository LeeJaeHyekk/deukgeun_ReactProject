// ============================================================================
// Machine Guide Error Handling Utilities
// ============================================================================

import { ERROR_MESSAGES } from "./constants"

/**
 * 에러 타입 정의
 */
export type MachineGuideError = 
  | 'NETWORK_ERROR'
  | 'SERVER_ERROR' 
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'UNKNOWN_ERROR'

/**
 * 에러 분류 함수
 */
export function classifyError(error: any): MachineGuideError {
  if (!error) return 'UNKNOWN_ERROR'
  
  const errorMessage = typeof error === 'string' ? error : error.message || ''
  
  if (errorMessage.includes('404') || errorMessage.includes('찾을 수 없습니다')) {
    return 'NOT_FOUND'
  }
  
  if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    return 'NETWORK_ERROR'
  }
  
  if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
    return 'VALIDATION_ERROR'
  }
  
  if (errorMessage.includes('500') || errorMessage.includes('server')) {
    return 'SERVER_ERROR'
  }
  
  return 'UNKNOWN_ERROR'
}

/**
 * 사용자 친화적 에러 메시지 생성
 */
export function getErrorMessage(error: any): string {
  const errorType = classifyError(error)
  
  switch (errorType) {
    case 'NOT_FOUND':
      return ERROR_MESSAGES.MACHINE_NOT_FOUND
    case 'NETWORK_ERROR':
      return ERROR_MESSAGES.NETWORK_ERROR
    case 'VALIDATION_ERROR':
      return '입력 데이터가 올바르지 않습니다.'
    case 'SERVER_ERROR':
      return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    default:
      return ERROR_MESSAGES.UNKNOWN_ERROR
  }
}

/**
 * 에러 아이콘 반환
 */
export function getErrorIcon(error: any): string {
  const errorType = classifyError(error)
  
  switch (errorType) {
    case 'NOT_FOUND':
      return '⚠️'
    case 'NETWORK_ERROR':
      return '🌐'
    case 'VALIDATION_ERROR':
      return '📝'
    case 'SERVER_ERROR':
      return '🔧'
    default:
      return '❌'
  }
}

/**
 * 에러 자동 해제 여부 판단
 */
export function shouldAutoDismiss(error: any): boolean {
  const errorType = classifyError(error)
  return errorType !== 'NOT_FOUND'
}

/**
 * 안전한 에러 로깅
 */
export function safeErrorLog(error: any, context: string = 'MachineGuide') {
  try {
    console.error(`${context} 에러:`, error)
  } catch (logError) {
    console.error('에러 로깅 실패:', logError)
  }
}
