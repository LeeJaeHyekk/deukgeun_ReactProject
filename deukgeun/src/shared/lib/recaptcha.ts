// ============================================================================
// reCAPTCHA 관련 유틸리티 함수들
// ============================================================================

import { config } from '../utils/env'

// Window 인터페이스에 grecaptcha 속성 추가
declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void
      execute: (siteKey: string, options: { action: string }) => Promise<string>
      reset: () => void
    }
  }
}

// reCAPTCHA 설정
export const recaptchaConfig = {
  siteKey: config.RECAPTCHA_SITE_KEY,
  theme: 'light' as const,
  size: 'normal' as const,
  badge: 'bottomright' as const,
}

// reCAPTCHA 토큰 검증
export const verifyRecaptchaToken = async (token: string): Promise<boolean> => {
  try {
    // 실제로는 서버에서 토큰을 검증해야 합니다
    // 여기서는 클라이언트 사이드 검증만 수행합니다
    return token.length > 0
  } catch (error) {
    console.error('reCAPTCHA 토큰 검증 실패:', error)
    return false
  }
}

// reCAPTCHA 위젯 초기화
export const initializeRecaptcha = (): void => {
  // reCAPTCHA 위젯 초기화 로직
  if (typeof window !== 'undefined' && window.grecaptcha) {
    window.grecaptcha.ready(() => {
      console.log('reCAPTCHA 초기화 완료')
    })
  }
}

// reCAPTCHA 토큰 새로고침
export const refreshRecaptcha = (): void => {
  if (typeof window !== 'undefined' && window.grecaptcha) {
    window.grecaptcha.reset()
  }
}

// reCAPTCHA 상태 확인
export const isRecaptchaLoaded = (): boolean => {
  return typeof window !== 'undefined' && !!window.grecaptcha
}

// reCAPTCHA 실행
export const executeRecaptcha = async (action: string = 'default'): Promise<string> => {
  if (typeof window === 'undefined' || !window.grecaptcha) {
    throw new Error('reCAPTCHA가 로드되지 않았습니다.')
  }

  return new Promise((resolve, reject) => {
    window.grecaptcha.execute(config.RECAPTCHA_SITE_KEY, { action })
      .then(resolve)
      .catch(reject)
  })
}

// 더미 reCAPTCHA 토큰 생성
export const getDummyRecaptchaToken = (): string => {
  return 'dummy_recaptcha_token_' + Date.now()
}

// reCAPTCHA 사용 가능 여부 확인
export const isRecaptchaAvailable = (): boolean => {
  return typeof window !== 'undefined' && !!window.grecaptcha
}
