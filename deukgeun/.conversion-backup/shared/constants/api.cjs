// ============================================================================
// API 관련 상수들
// ============================================================================

// API 엔드포인트
const API_ENDPOINTS
module.exports.API_ENDPOINTS = API_ENDPOINTS = {
  // 인증 관련
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    LOGOUT: "/api/auth/logout",
    REFRESH: "/api/auth/refresh",
    VERIFY: "/api/auth/verify",
    FIND_ID_VERIFY_USER: "/api/auth/find-id/verify-user",
    FIND_ID_VERIFY_CODE: "/api/auth/find-id/verify-code",
    RESET_PASSWORD_VERIFY_USER: "/api/auth/reset-password/verify-user",
    RESET_PASSWORD_VERIFY_CODE: "/api/auth/reset-password/verify-code",
    RESET_PASSWORD_RESET: "/api/auth/reset-password/reset",
  },

  // 계정 복구 관련
  ACCOUNT_RECOVERY: {
    FIND_ID_STEP1: "/api/account-recovery/find-id/step1",
    FIND_ID_STEP2: "/api/account-recovery/find-id/step2",
    RESET_PASSWORD_STEP1: "/api/account-recovery/reset-password/step1",
    RESET_PASSWORD_STEP2: "/api/account-recovery/reset-password/step2",
    RESET_PASSWORD_STEP3: "/api/account-recovery/reset-password/step3",
  },

  // 사용자 관련
  USER: {
    PROFILE: "/api/user/profile",
    UPDATE_PROFILE: "/api/user/profile",
    DELETE_ACCOUNT: "/api/user/account",
  },

  // 레벨 시스템 관련
  LEVEL: {
    CURRENT: "/api/level/current",
    HISTORY: "/api/level/history",
    MILESTONES: "/api/level/milestones",
    REWARDS: "/api/level/rewards",
    STREAKS: "/api/level/streaks",
    GAIN_EXP: "/api/level/gain-exp",
    UPDATE_STREAK: "/api/level/update-streak",
    UPDATE_MILESTONE: "/api/level/update-milestone",
  },

  // 헬스장 관련
  GYM: {
    LIST: "/api/gyms",
    DETAIL: "/api/gyms/:id",
    SEARCH: "/api/gyms/search",
    NEARBY: "/api/gyms/nearby",
    REVIEWS: "/api/gyms/:id/reviews",
    CREATE_REVIEW: "/api/gyms/:id/reviews",
    UPDATE_REVIEW: "/api/gyms/:id/reviews/:reviewId",
    DELETE_REVIEW: "/api/gyms/:id/reviews/:reviewId",
    FAVORITES: "/api/gyms/favorites",
    TOGGLE_FAVORITE: "/api/gyms/:id/favorite",
    STATS: "/api/gyms/stats",
  },

  // 기계 관련
  MACHINE: {
    LIST: "/api/machines",
    DETAIL: "/api/machines/:id",
    CATEGORIES: "/api/machines/categories",
    FILTER: "/api/machines/filter",
    SEARCH: "/api/machines/search",
    REVIEWS: "/api/machines/:id/reviews",
    CREATE_REVIEW: "/api/machines/:id/reviews",
    UPDATE_REVIEW: "/api/machines/:id/reviews/:reviewId",
    DELETE_REVIEW: "/api/machines/:id/reviews/:reviewId",
    FAVORITES: "/api/machines/favorites",
    TOGGLE_FAVORITE: "/api/machines/:id/favorite",
    STATS: "/api/machines/:id/stats",
    RECOMMENDATIONS: "/api/machines/recommendations",
    COMPARE: "/api/machines/compare",
    PROGRAMS: "/api/machines/:id/programs",
  },

  // 운동 관련
  WORKOUT: {
    SESSIONS: "/api/workout-journal/sessions",
    SESSION_DETAIL: "/api/workout-journal/sessions/:id",
    CREATE_SESSION: "/api/workout-journal/sessions",
    UPDATE_SESSION: "/api/workout-journal/sessions/:id",
    DELETE_SESSION: "/api/workout-journal/sessions/:id",
    SETS: "/api/workout-journal/sets",
    SET_DETAIL: "/api/workout-journal/sets/:id",
    CREATE_SET: "/api/workout-journal/sets",
    UPDATE_SET: "/api/workout-journal/sets/:id",
    DELETE_SET: "/api/workout-journal/sets/:id",
    GOALS: "/api/workout-journal/goals",
    GOAL_DETAIL: "/api/workout-journal/goals/:id",
    CREATE_GOAL: "/api/workout-journal/goals",
    UPDATE_GOAL: "/api/workout-journal/goals/:id",
    DELETE_GOAL: "/api/workout-journal/goals/:id",
    STATS: "/api/workout-journal/stats",
    PROGRESS: "/api/workout-journal/progress",
    REMINDERS: "/api/workout-journal/reminders",
    REMINDER_DETAIL: "/api/workout-journal/reminders/:id",
    CREATE_REMINDER: "/api/workout-journal/reminders",
    UPDATE_REMINDER: "/api/workout-journal/reminders/:id",
    DELETE_REMINDER: "/api/workout-journal/reminders/:id",
    SUMMARY: "/api/workout-journal/summary",
    PLANS: "/api/workout-journal/plans",
    PLAN_DETAIL: "/api/workout-journal/plans/:id",
    CREATE_PLAN: "/api/workout-journal/plans",
    UPDATE_PLAN: "/api/workout-journal/plans/:id",
    DELETE_PLAN: "/api/workout-journal/plans/:id",
  },

  // 커뮤니티 관련
  COMMUNITY: {
    POSTS: "/api/posts",
    POST_DETAIL: "/api/posts/:id",
    CREATE_POST: "/api/posts",
    UPDATE_POST: "/api/posts/:id",
    DELETE_POST: "/api/posts/:id",
    COMMENTS: "/api/posts/:postId/comments",
    COMMENT_DETAIL: "/api/posts/:postId/comments/:id",
    CREATE_COMMENT: "/api/posts/:postId/comments",
    UPDATE_COMMENT: "/api/posts/:postId/comments/:id",
    DELETE_COMMENT: "/api/posts/:postId/comments/:id",
    LIKES: "/api/posts/:postId/likes",
    TOGGLE_LIKE: "/api/posts/:postId/likes",
    COMMENT_LIKES: "/api/posts/:postId/comments/:commentId/likes",
    TOGGLE_COMMENT_LIKE: "/api/posts/:postId/comments/:commentId/likes",
    SEARCH: "/api/posts/search",
    CATEGORIES: "/api/posts/categories",
    TAGS: "/api/posts/tags",
    STATS: "/api/posts/stats",
    USER_ACTIVITY: "/api/posts/user-activity",
  },

  // 통계 관련
  STATS: {
    USER: "/api/stats/user",
    WORKOUT: "/api/stats/workout",
    PROGRESS: "/api/stats/progress",
    MACHINE: "/api/stats/machine",
    GYM: "/api/stats/gym",
    COMMUNITY: "/api/stats/community",
    LEVEL: "/api/stats/level",
    COMPREHENSIVE: "/api/stats/comprehensive",
    DASHBOARD: "/api/stats/dashboard",
    EXPORT: "/api/stats/export",
    COMPARISON: "/api/stats/comparison",
  },
} as const

// HTTP 상태 코드
const HTTP_STATUS
module.exports.HTTP_STATUS = HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const

// API 에러 메시지
const API_ERROR_MESSAGES
module.exports.API_ERROR_MESSAGES = API_ERROR_MESSAGES = {
  NETWORK_ERROR: "네트워크 연결에 실패했습니다.",
  TIMEOUT_ERROR: "요청 시간이 초과되었습니다.",
  UNAUTHORIZED: "인증이 필요합니다.",
  FORBIDDEN: "접근 권한이 없습니다.",
  NOT_FOUND: "요청한 리소스를 찾을 수 없습니다.",
  VALIDATION_ERROR: "입력 데이터가 올바르지 않습니다.",
  SERVER_ERROR: "서버 오류가 발생했습니다.",
  UNKNOWN_ERROR: "알 수 없는 오류가 발생했습니다.",
} as const

// API 요청 타임아웃 (밀리초)
const API_TIMEOUT
module.exports.API_TIMEOUT = API_TIMEOUT = {
  DEFAULT: 10000,
  UPLOAD: 30000,
  DOWNLOAD: 60000,
} as const

// API 재시도 설정
const API_RETRY
module.exports.API_RETRY = API_RETRY = {
  MAX_ATTEMPTS: 3,
  DELAY: 1000,
  BACKOFF_MULTIPLIER: 2,
} as const

// API 캐시 설정
const API_CACHE
module.exports.API_CACHE = API_CACHE = {
  DEFAULT_TTL: 5 * 60 * 1000, // 5분
  USER_PROFILE_TTL: 10 * 60 * 1000, // 10분
  GYM_LIST_TTL: 30 * 60 * 1000, // 30분
  MACHINE_LIST_TTL: 60 * 60 * 1000, // 1시간
} as const