// ============================================================================
// 백엔드 API 키 설정
// ============================================================================

import { config as dotenvConfig } from "dotenv"

// 환경 변수 로드
dotenvConfig({ path: ".env.production" })
dotenvConfig()

// API 키 설정
export const apiKeyConfig = {
  kakao: {
    apiKey: process.env.KAKAO_API_KEY || "",
    restApiKey: process.env.KAKAO_REST_API_KEY || "",
  },
  google: {
    placesApiKey: process.env.GOOGLE_PLACES_API_KEY || "",
  },
  seoul: {
    openApiKey: process.env.SEOUL_OPENAPI_KEY || "",
  },
}

export default apiKeyConfig
