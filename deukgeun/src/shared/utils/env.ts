// ============================================================================
// 공통 환경 변수 유틸리티
// ============================================================================

import { config } from 'dotenv'

// 환경 변수 로드
config()

// 환경 변수 타입 정의
interface EnvironmentVariables {
  NODE_ENV: string
  PORT: string
  DB_HOST: string
  DB_PORT: string
  DB_USERNAME: string
  DB_PASSWORD: string
  DB_NAME: string
  JWT_SECRET: string
  JWT_EXPIRES_IN: string
  CORS_ORIGIN: string
  KAKAO_API_KEY: string
  GOOGLE_PLACES_API_KEY: string
  SEOUL_OPENAPI_KEY: string
  RECAPTCHA_SECRET: string
  RECAPTCHA_SITE_KEY: string
  EMAIL_HOST: string
  EMAIL_PORT: string
  EMAIL_USER: string
  EMAIL_PASS: string
  UPLOAD_PATH: string
  MAX_FILE_SIZE: string
  RATE_LIMIT_WINDOW: string
  RATE_LIMIT_MAX: string
}

// 환경 변수 가져오기 함수
function getEnvVar(
  key: string,
  defaultValue?: string
): string | undefined {
  const value = process.env[key]
  if (!value && defaultValue === undefined) {
    console.warn(`Environment variable ${key} is not set`)
    return undefined
  }
  return value || defaultValue
}

// 환경 변수 검증 함수
function validateRequiredEnvVars(requiredVars: string[]): boolean {
  const missingVars = requiredVars.filter(key => !getEnvVar(key))

  if (missingVars.length > 0) {
    console.error("Missing required environment variables:", missingVars)
    return false
  }

  return true
}

// 환경 설정 가져오기
function getEnvironment(): string {
  const env = process.env.NODE_ENV
  return env || "development"
}

// 개발 환경 여부 확인
function isDevelopment(): boolean {
  return getEnvironment() === "development"
}

// 프로덕션 환경 여부 확인
function isProduction(): boolean {
  return getEnvironment() === "production"
}

// 테스트 환경 여부 확인
function isTest(): boolean {
  return getEnvironment() === "test"
}

// 환경 변수 전체 객체로 가져오기
function getAllEnvVars(): EnvironmentVariables {
  return {
    NODE_ENV: getEnvVar("NODE_ENV", "development")!,
    PORT: getEnvVar("PORT", "3000")!,
    DB_HOST: getEnvVar("DB_HOST", "localhost")!,
    DB_PORT: getEnvVar("DB_PORT", "3306")!,
    DB_USERNAME: getEnvVar("DB_USERNAME", "root")!,
    DB_PASSWORD: getEnvVar("DB_PASSWORD", "")!,
    DB_NAME: getEnvVar("DB_NAME", "deukgeun_db")!,
    JWT_SECRET: getEnvVar("JWT_SECRET", "")!,
    JWT_EXPIRES_IN: getEnvVar("JWT_EXPIRES_IN", "7d")!,
    CORS_ORIGIN: getEnvVar("CORS_ORIGIN", "")!,
    KAKAO_API_KEY: getEnvVar("KAKAO_API_KEY", "")!,
    GOOGLE_PLACES_API_KEY: getEnvVar("GOOGLE_PLACES_API_KEY", "")!,
    SEOUL_OPENAPI_KEY: getEnvVar("SEOUL_OPENAPI_KEY", "")!,
    RECAPTCHA_SECRET: getEnvVar("RECAPTCHA_SECRET", "")!,
    RECAPTCHA_SITE_KEY: getEnvVar("RECAPTCHA_SITE_KEY", "")!,
    EMAIL_HOST: getEnvVar("EMAIL_HOST", "smtp.gmail.com")!,
    EMAIL_PORT: getEnvVar("EMAIL_PORT", "587")!,
    EMAIL_USER: getEnvVar("EMAIL_USER", "")!,
    EMAIL_PASS: getEnvVar("EMAIL_PASS", "")!,
    UPLOAD_PATH: getEnvVar("UPLOAD_PATH", "./uploads")!,
    MAX_FILE_SIZE: getEnvVar("MAX_FILE_SIZE", "5242880")!,
    RATE_LIMIT_WINDOW: getEnvVar("RATE_LIMIT_WINDOW", "900000")!,
    RATE_LIMIT_MAX: getEnvVar("RATE_LIMIT_MAX", "100")!,
  }
}

// Export all functions
export {
  getEnvVar,
  validateRequiredEnvVars,
  getEnvironment,
  isDevelopment,
  isProduction,
  isTest,
  getAllEnvVars,
}

// Export default environment variables
export const env = getAllEnvVars()
