// ============================================================================
// 인증 에러 처리 유틸리티
// ============================================================================

export interface AuthError {
  type: 'network' | 'server' | 'auth' | 'token_expired' | 'token_invalid' | 'unknown'
  message: string
  retryable: boolean
  shouldLogout: boolean
  retryDelay?: number
}

/**
 * 에러 타입을 분석하여 적절한 처리 방안을 결정
 */
export function analyzeAuthError(error: any): AuthError {
  // 네트워크 에러
  if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
    return {
      type: 'network',
      message: '네트워크 연결에 문제가 있습니다. 잠시 후 다시 시도해주세요.',
      retryable: true,
      shouldLogout: false
    }
  }

  // 서버 에러 (5xx)
  if (error.response?.status >= 500 && error.response?.status < 600) {
    return {
      type: 'server',
      message: '서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
      retryable: true,
      shouldLogout: false
    }
  }

  // 401 에러 (토큰 만료) - 토큰 갱신 시도 후 실패 시에만 로그아웃
  if (error.response?.status === 401) {
    const errorData = error.response?.data
    const errorMessage = error.message || ''
    const url = error.config?.url || ''
    
    // refresh token 엔드포인트에서 401 에러는 토큰 갱신 실패
    if (url.includes('/api/auth/refresh')) {
      return {
        type: 'token_expired',
        message: '로그인이 만료되었습니다. 다시 로그인해주세요.',
        retryable: false,
        shouldLogout: true
      }
    }
    
    // refresh token 만료 (토큰 갱신 실패)
    if (
      errorData?.error === 'REFRESH_TOKEN_EXPIRED' ||
      errorData?.error === 'INVALID_TOKEN' || 
      errorData?.error === '토큰 무효' || 
      errorData?.error === '토큰 만료' ||
      errorMessage.includes('Refresh token이 만료')
    ) {
      return {
        type: 'token_expired',
        message: '로그인이 만료되었습니다. 다시 로그인해주세요.',
        retryable: false,
        shouldLogout: true
      }
    }
    
    // refresh token 불일치 (탈취 의심)
    if (errorData?.error === '토큰 불일치' || errorData?.error === 'TOKEN_MISMATCH') {
      return {
        type: 'token_invalid',
        message: '보안상의 이유로 로그아웃됩니다. 다시 로그인해주세요.',
        retryable: false,
        shouldLogout: true
      }
    }
    
    // 일반 401 에러 (토큰 갱신 시도 가능)
    return {
      type: 'auth',
      message: '인증이 필요합니다. 토큰을 갱신합니다.',
      retryable: true,
      shouldLogout: false
    }
  }

  // 403 에러 (권한 부족) - 로그아웃 불필요
  if (error.response?.status === 403) {
    return {
      type: 'auth',
      message: '권한이 부족합니다. 해당 작업을 수행할 수 없습니다.',
      retryable: false,
      shouldLogout: false
    }
  }

  // 기타 에러
  return {
    type: 'unknown',
    message: '알 수 없는 오류가 발생했습니다.',
    retryable: false,
    shouldLogout: false
  }
}

/**
 * 에러에 따른 사용자 알림 표시
 */
export function showErrorNotification(authError: AuthError): void {
  const { type, message } = authError
  
  // 토스트 메시지 표시 (실제 구현에서는 showToast 함수 사용)
  console.warn(`[${type.toUpperCase()}] ${message}`)
  
  // 필요시 추가적인 사용자 알림 로직
  if (authError.shouldLogout) {
    console.log('로그아웃 처리 필요')
  }
}

/**
 * 재시도 가능한 에러인지 확인
 */
export function isRetryableError(error: any): boolean {
  const authError = analyzeAuthError(error)
  return authError.retryable
}

/**
 * 로그아웃이 필요한 에러인지 확인
 */
export function shouldLogout(error: any): boolean {
  const authError = analyzeAuthError(error)
  return authError.shouldLogout
}

/**
 * 공통 API 에러 처리 유틸리티
 * - 401: 인터셉터가 갱신 시도 → 여기서는 토스트만
 * - 403: 권한 부족 토스트
 * 처리 후 true 반환 시 상위 로직에서 추가 조치 불필요
 */
export function handleAuthAwareError(error: unknown, show: (msg: string, type?: 'error'|'success'|'info') => void): boolean {
  const message = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
  const status = (error as any)?.response?.status as number | undefined

  if (status === 401) {
    show('인증이 필요합니다. 자동으로 토큰을 갱신합니다.', 'error')
    return true
  }
  if (status === 403 || message.includes('403')) {
    show('권한이 부족합니다. 계정 권한을 확인해주세요.', 'error')
    return true
  }
  if (message.includes('401')) {
    show('인증이 필요합니다. 다시 시도해주세요.', 'error')
    return true
  }
  return false
}
