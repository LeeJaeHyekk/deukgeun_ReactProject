// ============================================================================
// Machine Guide Constants
// ============================================================================

// API 관련 상수
export const API_CONSTANTS = {
  FETCH_COOLDOWN: 500, // 0.5초
  CACHE_DURATION: 5 * 60 * 1000, // 5분
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  ERROR_AUTO_DISMISS_DELAY: 5000, // 5초
} as const

// 난이도 색상 매핑
export const DIFFICULTY_COLORS = {
  beginner: "#28a745",
  intermediate: "#ffc107", 
  advanced: "#dc3545",
  expert: "#6f42c1",
  default: "#6c757d",
} as const

// 에러 메시지
export const ERROR_MESSAGES = {
  MACHINE_NOT_FOUND: "머신 데이터를 불러올 수 없습니다. 서버가 실행 중인지 확인해주세요.",
  NETWORK_ERROR: "네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
  UNKNOWN_ERROR: "알 수 없는 오류가 발생했습니다.",
} as const

// UI 텍스트
export const UI_TEXT = {
  LOADING: "데이터를 불러오는 중...",
  NO_RESULTS: "검색 결과가 없습니다",
  NO_RESULTS_DESCRIPTION: "다른 검색어나 필터를 시도해보세요",
  RESET_FILTERS: "필터 초기화",
  RETRYING: "재시도 중...",
  CURRENT_FILTER: "현재 필터:",
} as const

// 검색 관련 상수
export const SEARCH_CONSTANTS = {
  MIN_SEARCH_LENGTH: 1,
  DEBOUNCE_DELAY: 300,
} as const
