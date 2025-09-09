// ============================================================================
// API 엔드포인트 상수
// ============================================================================

export const API_ENDPOINTS = {
  // 인증 관련
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    VERIFY_EMAIL: "/auth/verify-email",
    RESET_PASSWORD: "/auth/reset-password",
    CHANGE_PASSWORD: "/auth/change-password",
    FIND_ID: "/auth/find-id",
    FIND_PASSWORD: "/auth/find-password",
    FIND_ID_SIMPLE: "/auth/find-id-simple",
    RESET_PASSWORD_SIMPLE_STEP1: "/auth/reset-password-simple-step1",
    RESET_PASSWORD_SIMPLE_STEP2: "/auth/reset-password-simple-step2",
  },

  // 사용자 관련
  USER: {
    PROFILE: "/user/profile",
    UPDATE_PROFILE: "/user/profile",
    DELETE_ACCOUNT: "/user/account",
    UPLOAD_AVATAR: "/user/avatar",
  },

  // 워크아웃 관련
  WORKOUT: {
    LIST: "/workouts",
    CREATE: "/workouts",
    GET: "/workouts/:id",
    UPDATE: "/workouts/:id",
    DELETE: "/workouts/:id",
    PLANS: "/workouts/plans",
    CREATE_PLAN: "/workouts/plans",
    GET_PLAN: "/workouts/plans/:id",
    UPDATE_PLAN: "/workouts/plans/:id",
    DELETE_PLAN: "/workouts/plans/:id",
    MACHINES: {
      LIST: "/machines",
      CREATE: "/machines",
      GET: "/machines/:id",
      UPDATE: "/machines/:id",
      DELETE: "/machines/:id",
      FILTER: "/machines/filter",
      BY_CATEGORY: "/machines/category/:category",
      BY_DIFFICULTY: "/machines/difficulty/:difficulty",
      BY_TARGET: "/machines/target/:target",
    },
  },

  // 헬스장 관련
  GYM: {
    LIST: "/gyms",
    SEARCH: "/gyms/search",
    GET: "/gyms/:id",
    REVIEWS: "/gyms/:id/reviews",
    CREATE_REVIEW: "/gyms/:id/reviews",
    UPDATE_REVIEW: "/gyms/:id/reviews/:reviewId",
    DELETE_REVIEW: "/gyms/:id/reviews/:reviewId",
    NEARBY: "/gyms/nearby",
  },

  // 커뮤니티 관련
  COMMUNITY: {
    POSTS: "/community/posts",
    CREATE_POST: "/community/posts",
    GET_POST: "/community/posts/:id",
    UPDATE_POST: "/community/posts/:id",
    DELETE_POST: "/community/posts/:id",
    LIKE_POST: "/community/posts/:id/like",
    UNLIKE_POST: "/community/posts/:id/like",
    COMMENTS: "/community/posts/:id/comments",
    CREATE_COMMENT: "/community/posts/:id/comments",
    UPDATE_COMMENT: "/community/comments/:id",
    DELETE_COMMENT: "/community/comments/:id",
    LIKE_COMMENT: "/community/comments/:id/like",
    UNLIKE_COMMENT: "/community/comments/:id/like",
  },

  // 관리자 관련
  ADMIN: {
    USERS: {
      LIST: "/admin/users/list",
      UPDATE: "/admin/users/update",
      BAN: "/admin/users/ban",
    },
    SYSTEM: {
      STATS: "/admin/system/stats",
      PERFORMANCE: "/admin/system/performance",
      DASHBOARD: "/admin/system/dashboard",
      SETTINGS: "/admin/system/settings",
      LOGS: "/admin/system/logs",
    },
    CONTENT: {
      POSTS: "/admin/content/posts",
      LIST: "/admin/content/list",
      UPDATE: "/admin/content/update",
      DASHBOARD: "/admin/content/dashboard",
    },
    DASHBOARD: "/admin/dashboard",
    PERFORMANCE: "/admin/performance",
    DATABASE: "/admin/database",
    LOGS: "/admin/logs",
    SETTINGS: "/admin/settings",
  },

  // 파일 업로드
  UPLOAD: {
    IMAGE: "/upload/image",
    AVATAR: "/upload/avatar",
    DOCUMENT: "/upload/document",
  },

  // 알림 관련
  NOTIFICATION: {
    LIST: "/notifications",
    MARK_READ: "/notifications/:id/read",
    MARK_ALL_READ: "/notifications/read-all",
    DELETE: "/notifications/:id",
  },
} as const

export default API_ENDPOINTS
