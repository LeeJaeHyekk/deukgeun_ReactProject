// ============================================================================
// Frontend Configuration
// ============================================================================

export interface FrontendConfig {
  apiBaseUrl: string
  kakaoApiKey: string
  recaptchaSiteKey: string
  environment: "development" | "production" | "test"
  api: {
    baseURL: string
  }
}

// 환경 변수에서 설정 가져오기
const getConfig = (): FrontendConfig => {
  console.log('🔧 환경 변수 로딩 중...')
  console.log('🔧 VITE_BACKEND_URL:', import.meta.env.VITE_BACKEND_URL)
  console.log('🔧 VITE_KAKAO_API_KEY:', import.meta.env.VITE_KAKAO_API_KEY)
  console.log('🔧 VITE_RECAPTCHA_SITE_KEY:', import.meta.env.VITE_RECAPTCHA_SITE_KEY)
  console.log('🔧 MODE:', import.meta.env.MODE)
  
  const config = {
    apiBaseUrl: import.meta.env.VITE_BACKEND_URL || "",
    kakaoApiKey: import.meta.env.VITE_KAKAO_API_KEY || "",
    recaptchaSiteKey: import.meta.env.VITE_RECAPTCHA_SITE_KEY || "",
    environment: (import.meta.env.MODE as "development" | "production" | "test") || "development",
    api: {
      baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:5000",
    },
  }
  
  console.log('🔧 최종 설정:', config)
  return config
}

export const config = getConfig()

// API 엔드포인트 정의 (백엔드 라우팅 기준으로 통일)
export const API_ENDPOINTS = {
  BASE_URL: config.api.baseURL,
  // 인증 관련
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    LOGOUT: "/api/auth/logout",
    REFRESH: "/api/auth/refresh",
    CHECK: "/api/auth/check",
    FIND_ID: "/api/auth/find-id",
    FIND_PASSWORD: "/api/auth/find-password",
    FIND_ID_SIMPLE: "/api/auth/find-id-simple",
    RESET_PASSWORD_SIMPLE_STEP1: "/api/auth/reset-password-simple-step1",
    RESET_PASSWORD_SIMPLE_STEP2: "/api/auth/reset-password-simple-step2",
    FIND_ID_VERIFY_USER: "/api/auth/find-id/verify-user",
    FIND_ID_VERIFY_CODE: "/api/auth/find-id/verify-code",
    RESET_PASSWORD_VERIFY_USER: "/api/auth/reset-password/verify-user",
    RESET_PASSWORD_VERIFY_CODE: "/api/auth/reset-password/verify-code",
    RESET_PASSWORD_COMPLETE: "/api/auth/reset-password/complete",
  },
  
  // 헬스장 관련
  GYMS: {
    GET_ALL: "/api/gyms",
    GET_BY_ID: (id: number) => `/api/gyms/${id}`,
    SEARCH: "/api/gyms/search",
    SEARCH_BY_LOCATION: "/api/gyms/search/location",
    UPDATE: "/api/gyms/update",
  },
  
  // 머신 관련
  MACHINES: {
    GET_ALL: "/api/machines",
    GET_BY_ID: (id: number) => `/api/machines/${id}`,
    CREATE: "/api/machines",
    UPDATE: (id: number) => `/api/machines/${id}`,
    DELETE: (id: number) => `/api/machines/${id}`,
    FILTER: "/api/machines/filter",
    GET_BY_CATEGORY: (category: string) => `/api/machines/category/${category}`,
    GET_BY_DIFFICULTY: (difficulty: string) => `/api/machines/difficulty/${difficulty}`,
    GET_BY_TARGET: (target: string) => `/api/machines/target/${target}`,
    LIST: "/api/machines",
    DETAIL: (id: number) => `/api/machines/${id}`,
  },
  
  // 게시글 관련
  POSTS: {
    GET_ALL: "/api/posts",
    GET_BY_ID: (id: number) => `/api/posts/${id}`,
    GET_MY: "/api/posts/my",
    CREATE: "/api/posts",
    UPDATE: (id: number) => `/api/posts/${id}`,
    DELETE: (id: number) => `/api/posts/${id}`,
    GET_CATEGORIES: "/api/posts/categories",
    GET_CATEGORIES_LIVE: "/api/posts/categories/live",
  },
  
  // 댓글 관련
  COMMENTS: {
    GET_BY_POST: (postId: number) => `/api/comments/${postId}`,
    CREATE: (postId: number) => `/api/comments/${postId}`,
    UPDATE: (commentId: number) => `/api/comments/${commentId}`,
    DELETE: (commentId: number) => `/api/comments/${commentId}`,
  },
  
  // 좋아요 관련
  LIKES: {
    TOGGLE: (postId: number) => `/api/likes/${postId}`,
  },
  
  // 레벨 시스템 관련
  LEVEL: {
    GET_USER_LEVEL: (userId: number) => `/api/level/user/${userId}`,
    GET_USER_PROGRESS: (userId: number) => `/api/level/user/${userId}/progress`,
    GET_USER_REWARDS: (userId: number) => `/api/level/user/${userId}/rewards`,
    GRANT_EXP: "/api/level/exp/grant",
    CHECK_COOLDOWN: (actionType: string, userId: number) => `/api/level/cooldown/${actionType}/${userId}`,
    GET_GLOBAL_LEADERBOARD: "/api/level/leaderboard/global",
    GET_SEASON_LEADERBOARD: (seasonId: string) => `/api/level/leaderboard/season/${seasonId}`,
    UPDATE_CONFIG: "/api/level/admin/config",
    RESET_USER_PROGRESS: (userId: number) => `/api/level/admin/reset/${userId}`,
    GET_SYSTEM_STATS: "/api/level/admin/stats",
  },
  
  // 레벨 시스템 (별칭)
  LEVELS: {
    GET_USER_LEVEL: (userId: number) => `/api/level/user/${userId}`,
    GRANT_EXP: "/api/level/exp/grant",
  },
  
  // 운동 목표 관련
  WORKOUT_GOALS: {
    GET_ALL: "/api/workout/goals",
  },
  
  // 통계 관련
  STATS: {
    GET_PLATFORM: "/api/stats/platform",
    GET_DETAILED: "/api/stats/detailed",
    GET_USER: "/api/stats/user",
  },
  
  // 운동 관련
  WORKOUTS: {
    // 운동 계획
    GET_PLANS: "/api/workouts/plans",
    GET_PLAN: (id: number) => `/api/workouts/plans/${id}`,
    CREATE_PLAN: "/api/workouts/plans",
    UPDATE_PLAN: (id: number) => `/api/workouts/plans/${id}`,
    DELETE_PLAN: (id: number) => `/api/workouts/plans/${id}`,
    
    // 운동 세션
    GET_SESSIONS: "/api/workouts/sessions",
    GET_SESSION: (id: number) => `/api/workouts/sessions/${id}`,
    CREATE_SESSION: "/api/workouts/sessions",
    UPDATE_SESSION: (id: number) => `/api/workouts/sessions/${id}`,
    DELETE_SESSION: (id: number) => `/api/workouts/sessions/${id}`,
    START_SESSION: (id: number) => `/api/workouts/sessions/${id}/start`,
    PAUSE_SESSION: (id: number) => `/api/workouts/sessions/${id}/pause`,
    RESUME_SESSION: (id: number) => `/api/workouts/sessions/${id}/resume`,
    COMPLETE_SESSION: (id: number) => `/api/workouts/sessions/${id}/complete`,
    
    // 운동 목표
    GET_GOALS: "/api/workouts/goals",
    GET_GOAL: (id: number) => `/api/workouts/goals/${id}`,
    CREATE_GOAL: "/api/workouts/goals",
    UPDATE_GOAL: (id: number) => `/api/workouts/goals/${id}`,
    DELETE_GOAL: (id: number) => `/api/workouts/goals/${id}`,
    
    // 운동 진행 상황
    GET_PROGRESS: "/api/workouts/progress",
  },
  
  // 홈페이지 관련
  HOMEPAGE: {
    GET_CONFIG: "/api/homepage/config",
    UPDATE_CONFIG: "/api/homepage/config",
    UPDATE_CONFIG_BATCH: "/api/homepage/config/batch",
  },
  
  // reCAPTCHA 관련
  RECAPTCHA: {
    VERIFY: "/api/recaptcha/verify",
    HEALTH: "/api/recaptcha/health",
    CONFIG: "/api/recaptcha/config",
  },
} as const

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
