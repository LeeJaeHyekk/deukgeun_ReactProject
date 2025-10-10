// ============================================================================
// Environment Variables Helper
// ============================================================================

export interface EnvConfig {
  API_BASE_URL: string
  KAKAO_API_KEY: string
  RECAPTCHA_SITE_KEY: string
  NODE_ENV: string
  MODE: string
}

// 환경 변수 가져오기
export const getEnvConfig = (): EnvConfig => {
  return {
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL || "",
    KAKAO_API_KEY: import.meta.env.VITE_KAKAO_API_KEY || "",
    RECAPTCHA_SITE_KEY: import.meta.env.VITE_RECAPTCHA_SITE_KEY || "",
    NODE_ENV: import.meta.env.NODE_ENV || "development",
    MODE: import.meta.env.MODE || "development",
  }
}

// 환경 변수 검증
export const validateEnvConfig = (): boolean => {
  const config = getEnvConfig()
  
  const requiredVars = [
    'API_BASE_URL',
    'KAKAO_API_KEY',
    'RECAPTCHA_SITE_KEY'
  ]
  
  const missingVars = requiredVars.filter(varName => !config[varName as keyof EnvConfig])
  
  if (missingVars.length > 0) {
    console.warn('Missing environment variables:', missingVars)
    return false
  }
  
  return true
}

// 개발 환경 확인
export const isDevelopment = (): boolean => {
  return import.meta.env.MODE === 'development'
}

// 프로덕션 환경 확인
export const isProduction = (): boolean => {
  return import.meta.env.MODE === 'production'
}

// 테스트 환경 확인
export const isTest = (): boolean => {
  return import.meta.env.MODE === 'test'
}

// 추가 설정 객체들
export const GYM_CONFIG = {
  API_KEY: import.meta.env.VITE_KAKAO_API_KEY || "",
  BASE_URL: "https://dapi.kakao.com/v2/local",
  SEARCH_RADIUS: 1000,
  MAX_RESULTS: 15,
}

export const KAKAO_CONFIG = {
  API_KEY: import.meta.env.VITE_KAKAO_API_KEY || "",
  REST_API_KEY: import.meta.env.VITE_KAKAO_API_KEY || "",
  JAVASCRIPT_API_KEY: import.meta.env.VITE_KAKAO_API_KEY || "",
  BASE_URL: "https://dapi.kakao.com/v2/local",
  SEARCH_RADIUS: 1000,
  MAX_RESULTS: 15,
}

export const envConfig = getEnvConfig()
export default envConfig
