// ============================================================================
// 백엔드 보안 설정
// ============================================================================

import { config as dotenvConfig } from "dotenv"

// 환경 변수 로드
dotenvConfig({ path: ".env.production" })
dotenvConfig()

// 보안 설정
export const securityConfig = {
  // JWT 설정
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || "",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "",
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  },

  // reCAPTCHA 설정
  recaptcha: {
    secret: process.env.RECAPTCHA_SECRET || "",
    siteKey: process.env.RECAPTCHA_SITE_KEY || "",
  },

  // 레이트 리미팅 설정
  rateLimit: {
    window: parseInt(process.env.RATE_LIMIT_WINDOW || "900000"), // 15분
    max: parseInt(process.env.RATE_LIMIT_MAX || "100"),
  },

  // 비밀번호 설정
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false,
  },
}

export default securityConfig
