// ============================================================================
// 백엔드 로깅 설정
// ============================================================================

import { config as dotenvConfig } from "dotenv"

// 환경 변수 로드
dotenvConfig({ path: ".env.production" })
dotenvConfig()

// 로깅 설정
export const loggingConfig = {
  level: process.env.LOG_LEVEL || "info",
  enableDebug: process.env.ENABLE_DEBUG === "true",
  enablePerformanceMonitoring:
    process.env.ENABLE_PERFORMANCE_MONITORING === "true",
}

export default loggingConfig
