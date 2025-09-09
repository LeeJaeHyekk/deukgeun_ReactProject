// ============================================================================
// Frontend API 상수들
// ============================================================================

// API 엔드포인트
export const API_ENDPOINTS = {
  // 인증
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
    RESET_PASSWORD_VERIFY_CODE: "/api/auth/reset-password-verify-code",
    RESET_PASSWORD_COMPLETE: "/api/auth/reset-password-complete",
  },

  // 사용자
  USER: {
    PROFILE: "/api/user/profile",
    UPDATE_PROFILE: "/api/user/profile",
    DELETE_ACCOUNT: "/api/user/account",
  },

  // 워크아웃
  WORKOUT: {
    PLANS: "/api/workouts/plans",
    PLAN: (id: number) => `/api/workouts/plans/${id}`,
    PLAN_EXERCISES: (planId: number) =>
      `/api/workouts/plans/${planId}/exercises`,
    PLAN_EXERCISE: (planId: number, exerciseId: number) =>
      `/api/workouts/plans/${planId}/exercises/${exerciseId}`,

    SESSIONS: "/api/workouts/sessions",
    SESSION: (id: number) => `/api/workouts/sessions/${id}`,
    SESSION_EXERCISES: (sessionId: number) =>
      `/api/workouts/sessions/${sessionId}/exercises`,
    SESSION_EXERCISE: (sessionId: number, exerciseId: number) =>
      `/api/workouts/sessions/${sessionId}/exercises/${exerciseId}`,
    SESSION_START: (id: number) => `/api/workouts/sessions/${id}/start`,
    SESSION_PAUSE: (id: number) => `/api/workouts/sessions/${id}/pause`,
    SESSION_RESUME: (id: number) => `/api/workouts/sessions/${id}/resume`,
    SESSION_COMPLETE: (id: number) => `/api/workouts/sessions/${id}/complete`,

    GOALS: "/api/workouts/goals",
    GOAL: (id: number) => `/api/workouts/goals/${id}`,

    DASHBOARD: "/api/workouts/dashboard",
  },

  // 머신
  MACHINE: {
    LIST: "/api/machines",
    DETAIL: (id: number) => `/api/machines/${id}`,
    FILTER: "/api/machines/filter",
    CATEGORY: (category: string) => `/api/machines/category/${category}`,
    DIFFICULTY: (difficulty: string) =>
      `/api/machines/difficulty/${difficulty}`,
    TARGET: (target: string) => `/api/machines/target/${target}`,
  },

  // 헬스장
  GYM: {
    LIST: "/api/gyms",
    DETAIL: (id: number) => `/api/gyms/${id}`,
    SEARCH: "/api/gyms/search",
    NEARBY: "/api/gyms/nearby",
  },

  // 커뮤니티
  COMMUNITY: {
    POSTS: "/api/posts",
    POST: (id: number) => `/api/posts/${id}`,
    POST_LIKE: (id: number) => `/api/posts/${id}/like`,
    POST_COMMENTS: (id: number) => `/api/posts/${id}/comments`,

    COMMENTS: "/api/comments",
    COMMENT: (id: number) => `/api/comments/${id}`,
    COMMENT_LIKE: (id: number) => `/api/comments/${id}/like`,
  },

  // 레벨 시스템
  LEVEL: {
    PROGRESS: "/api/level/progress",
    REWARDS: "/api/level/rewards",
    MILESTONES: "/api/level/milestones",
    STATS: "/api/level/stats",
  },

  // 통계
  STATS: {
    DASHBOARD: "/api/stats/dashboard",
    WORKOUT: "/api/stats/workout",
    USER: "/api/stats/user",
  },

  // 관리자
  ADMIN: {
    USERS: "/api/admin/users",
    POSTS: "/api/admin/posts",
    MACHINES: "/api/admin/machines",
    GYMS: "/api/admin/gyms",
    STATS: "/api/admin/stats",
  },
}

// HTTP 상태 코드
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const

// API 응답 메시지
export const API_MESSAGES = {
  SUCCESS: {
    LOGIN: "로그인에 성공했습니다",
    REGISTER: "회원가입에 성공했습니다",
    LOGOUT: "로그아웃되었습니다",
    UPDATE: "업데이트되었습니다",
    DELETE: "삭제되었습니다",
    CREATE: "생성되었습니다",
  },
  ERROR: {
    NETWORK: "네트워크 연결을 확인해주세요",
    UNAUTHORIZED: "인증이 필요합니다",
    FORBIDDEN: "접근 권한이 없습니다",
    NOT_FOUND: "요청한 리소스를 찾을 수 없습니다",
    SERVER_ERROR: "서버 오류가 발생했습니다",
    VALIDATION: "입력값을 확인해주세요",
  },
} as const

// API 타임아웃 설정
export const API_TIMEOUT = {
  DEFAULT: 10000,
  UPLOAD: 30000,
  DOWNLOAD: 60000,
} as const

// 페이지네이션 기본값
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const

// 파일 업로드 설정
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  ALLOWED_EXTENSIONS: [".jpg", ".jpeg", ".png", ".gif", ".webp"],
} as const
