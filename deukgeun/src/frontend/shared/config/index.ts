// ============================================================================
// Frontend Configuration
// ============================================================================

export interface FrontendConfig {
  apiBaseUrl: string
  kakaoApiKey: string
  recaptchaSiteKey: string
  environment: "development" | "production" | "test"
}

// 환경 변수에서 설정 가져오기
const getConfig = (): FrontendConfig => {
  return {
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "",
    kakaoApiKey: import.meta.env.VITE_KAKAO_API_KEY || "",
    recaptchaSiteKey: import.meta.env.VITE_RECAPTCHA_SITE_KEY || "",
    environment: (import.meta.env.MODE as "development" | "production" | "test") || "development",
  }
}

export const config = getConfig()

// 기본 설정값들
export const DEFAULT_CONFIG = {
  API: {
    TIMEOUT: 10000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
  },
  UI: {
    TOAST_DURATION: 3000,
    ANIMATION_DURATION: 300,
    DEBOUNCE_DELAY: 500,
  },
  VALIDATION: {
    EMAIL_MIN_LENGTH: 5,
    EMAIL_MAX_LENGTH: 100,
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_MAX_LENGTH: 50,
    NICKNAME_MIN_LENGTH: 2,
    NICKNAME_MAX_LENGTH: 20,
  },
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
  },
} as const

export default config
