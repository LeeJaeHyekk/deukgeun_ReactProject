// ============================================================================
// Script Environment Configuration
// ============================================================================

export const SCRIPT_CONFIG = {
  API_BASE_URL: import.meta.env.VITE_BACKEND_URL || "http://localhost:5000",
  KAKAO_API_KEY: import.meta.env.VITE_KAKAO_API_KEY || "",
  GYM_SEARCH_RADIUS: 1000,
  MAX_GYMS_PER_REQUEST: 15,
  BATCH_SIZE: 10,
  // 추가 환경 변수들
  VITE_BACKEND_URL: import.meta.env.VITE_BACKEND_URL || "http://localhost:5000",
  SEOUL_OPENAPI_KEY: import.meta.env.VITE_SEOUL_OPENAPI_KEY || "",
}

export const GYM_CONFIG = {
  API_KEY: import.meta.env.VITE_SEOUL_OPENAPI_KEY || import.meta.env.VITE_KAKAO_API_KEY || "",
  BASE_URL: "https://dapi.kakao.com/v2/local",
  SEARCH_RADIUS: 1000,
  MAX_RESULTS: 15,
}

// 추가 export들
export const SCRIPT_GYM_CONFIG = {
  ...SCRIPT_CONFIG,
  API_KEY: import.meta.env.VITE_SEOUL_OPENAPI_KEY || import.meta.env.VITE_KAKAO_API_KEY || "",
}

export const scriptEnv = {
  ...SCRIPT_CONFIG,
  VITE_BACKEND_URL: import.meta.env.VITE_BACKEND_URL || "http://localhost:5000",
}

export const validateEnv = () => {
  return SCRIPT_CONFIG.API_BASE_URL && (SCRIPT_CONFIG.KAKAO_API_KEY || SCRIPT_CONFIG.SEOUL_OPENAPI_KEY)
}

export default SCRIPT_CONFIG
