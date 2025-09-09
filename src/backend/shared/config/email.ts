// ============================================================================
// 백엔드 이메일 설정
// ============================================================================

import { config as dotenvConfig } from "dotenv"

// 환경 변수 로드
dotenvConfig({ path: ".env.production" })
dotenvConfig()

// 이메일 설정
export const emailConfig = {
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT || "587"),
  user: process.env.EMAIL_USER || "",
  pass: process.env.EMAIL_PASS || "",
  from: process.env.EMAIL_FROM || "noreply@deukgeun.com",
  replyTo: process.env.EMAIL_REPLY_TO || "support@deukgeun.com",
}

export default emailConfig
