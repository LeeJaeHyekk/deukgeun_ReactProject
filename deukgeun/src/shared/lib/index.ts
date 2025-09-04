// ============================================================================
// 공통 유틸리티 함수들
// ============================================================================

// 토스트 메시지 표시
export const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  // 기본 토스트 구현 (실제로는 toast 라이브러리 사용)
  console.log(`[${type.toUpperCase()}] ${message}`)
}

// 로컬 스토리지 유틸리티
export const storage = {
  get: (key: string): string | null => {
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  },
  
  set: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value)
    } catch {
      // 스토리지 오류 무시
    }
  },
  
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key)
    } catch {
      // 스토리지 오류 무시
    }
  },
  
  clear: (): void => {
    try {
      localStorage.clear()
    } catch {
      // 스토리지 오류 무시
    }
  }
}

// 유효성 검사 유틸리티
export const validation = {
  isEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },
  
  isPassword: (password: string): boolean => {
    return password.length >= 8
  },
  
  isRequired: (value: string): boolean => {
    return value.trim().length > 0
  }
}

// 환경 설정
export const config = {
  API_BASE_URL: process.env.VITE_API_BASE_URL || 'http://localhost:5000',
  RECAPTCHA_SITE_KEY: process.env.VITE_RECAPTCHA_SITE_KEY || '',
  KAKAO_APP_KEY: process.env.VITE_KAKAO_APP_KEY || '',
}

// 환경별 설정
export const env = {
  KAKAO_CONFIG: {
    APP_KEY: process.env.VITE_KAKAO_APP_KEY || '',
    REDIRECT_URI: process.env.VITE_KAKAO_REDIRECT_URI || '',
  },
  GYM_CONFIG: {
    DEFAULT_LAT: 37.5665,
    DEFAULT_LNG: 126.9780,
    DEFAULT_ZOOM: 13,
  }
}

// reCAPTCHA 관련 유틸리티
export * from './recaptcha'
