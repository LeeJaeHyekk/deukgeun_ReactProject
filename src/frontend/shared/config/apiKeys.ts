// ============================================================================
// 프론트엔드 API 키 설정
// ============================================================================

interface FrontendApiKeyConfig {
  kakao: {
    javascriptKey: string
    restApiKey: string
  }
  google: {
    placesApiKey: string
  }
  recaptcha: {
    siteKey: string
  }
}

// 프론트엔드 API 키 설정
export const frontendApiKeyConfig: FrontendApiKeyConfig = {
  kakao: {
    javascriptKey: import.meta.env.VITE_KAKAO_JAVASCRIPT_KEY || "",
    restApiKey: import.meta.env.VITE_KAKAO_REST_API_KEY || "",
  },
  google: {
    placesApiKey: import.meta.env.VITE_GOOGLE_PLACES_API_KEY || "",
  },
  recaptcha: {
    siteKey: import.meta.env.VITE_RECAPTCHA_SITE_KEY || "",
  },
}

export default frontendApiKeyConfig
