import { store } from './index'
import { checkAutoLogin } from './authSlice'
import { logger } from '../utils/logger'

// 전역 초기화 상태 관리
let isInitialized = false
let isInitializing = false

// HMR 환경에서 모듈이 다시 로드될 때 상태 유지
if (typeof window !== 'undefined') {
  // 브라우저 환경에서만 실행
  (window as any).__AUTH_INITIALIZED__ = isInitialized
}

/**
 * 앱 전체에서 한 번만 실행되는 인증 초기화
 * HMR 환경에서도 안전하게 동작
 */
export async function initializeAuth(): Promise<void> {
  // HMR 환경에서 상태 복원
  if (typeof window !== 'undefined' && (window as any).__AUTH_INITIALIZED__) {
    isInitialized = true
    logger.debug('AUTH_INIT', 'HMR 환경에서 상태 복원')
    return
  }

  // 이미 초기화되었거나 초기화 중인 경우 스킵
  if (isInitialized || isInitializing) {
    logger.debug('AUTH_INIT', '이미 초기화됨 또는 초기화 중', { 
      isInitialized, 
      isInitializing 
    })
    return
  }

  try {
    isInitializing = true
    logger.info('AUTH_INIT', '인증 초기화 시작')
    
    await store.dispatch(checkAutoLogin()).unwrap()
    
    isInitialized = true
    
    // HMR 환경에서 상태 저장
    if (typeof window !== 'undefined') {
      (window as any).__AUTH_INITIALIZED__ = true
    }
    
    logger.info('AUTH_INIT', '인증 초기화 완료')
  } catch (error) {
    logger.error('AUTH_INIT', '인증 초기화 실패', error)
    throw error
  } finally {
    isInitializing = false
  }
}

/**
 * 초기화 상태 확인
 */
export function isAuthInitialized(): boolean {
  return isInitialized
}

/**
 * 초기화 상태 리셋 (테스트용)
 */
export function resetAuthInitialization(): void {
  isInitialized = false
  isInitializing = false
  logger.debug('AUTH_INIT', '초기화 상태 리셋')
}
