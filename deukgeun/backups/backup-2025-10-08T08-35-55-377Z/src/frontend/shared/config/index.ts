// Frontend Configuration
export const config = {
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_BACKEND_URL || "http://localhost:5001",

  // reCAPTCHA Configuration
  RECAPTCHA: {
    SITE_KEY:
      import.meta.env.VITE_RECAPTCHA_SITE_KEY || "your_recaptcha_site_key_here", // 환경 변수에서 설정
    IS_DEVELOPMENT: import.meta.env.DEV || false,
    IS_TEST_KEY: (import.meta.env.VITE_RECAPTCHA_SITE_KEY || "").includes(
      "test"
    ),
    VERSION: "v3", // v3 사용
  },

  // App Configuration
  APP_NAME: "득근 득근",
  APP_VERSION: "1.0.0",

  // Validation Rules
  VALIDATION: {
    EMAIL_MIN_LENGTH: 5,
    EMAIL_MAX_LENGTH: 50,
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_MAX_LENGTH: 100,
    NICKNAME_MIN_LENGTH: 2,
    NICKNAME_MAX_LENGTH: 20,
  },

  // UI Configuration
  UI: {
    TOAST_DURATION: 3000,
    LOADING_DELAY: 500,
  },
} as const

// API Endpoints
export const API_ENDPOINTS = {
  BASE_URL: import.meta.env.VITE_BACKEND_URL || "http://localhost:5001",
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    LOGOUT: "/api/auth/logout",
    REFRESH: "/api/auth/refresh",
    FIND_ID: "/api/auth/find-id",
    FIND_PASSWORD: "/api/auth/find-password",
    FIND_ID_SIMPLE: "/api/auth/find-id-simple",
    RESET_PASSWORD_SIMPLE_STEP1: "/api/auth/reset-password-simple-step1",
    RESET_PASSWORD_SIMPLE_STEP2: "/api/auth/reset-password-simple-step2",
    FIND_ID_VERIFY_USER: "/api/auth/find-id-verify-user",
    FIND_ID_VERIFY_CODE: "/api/auth/find-id-verify-code",
    RESET_PASSWORD_VERIFY_USER: "/api/auth/reset-password-verify-user",
    RESET_PASSWORD_VERIFY_CODE: "/api/auth/reset-password-verify-code",
    RESET_PASSWORD_COMPLETE: "/api/auth/reset-password-complete",
    CHECK: "/api/auth/check",
  },
  USER: {
    PROFILE: "/api/user/profile",
    UPDATE: "/api/user/update",
  },
  POSTS: {
    LIST: "/api/posts",
    CREATE: "/api/posts",
    DETAIL: (id: number) => `/api/posts/${id}`,
    GET_ALL: "/api/posts",
    GET_BY_ID: (id: number) => `/api/posts/${id}`,
  },
  GYMS: {
    LIST: "/api/gyms",
    SEARCH: "/api/gyms/search",
    DETAIL: (id: number) => `/api/gyms/${id}`,
    GET_ALL: "/api/gyms",
  },
  MACHINES: {
    LIST: "/api/machines",
    CREATE: "/api/machines",
    DETAIL: (id: number) => `/api/machines/${id}`,
    UPDATE: (id: number) => `/api/machines/${id}`,
    DELETE: (id: number) => `/api/machines/${id}`,
    FILTER: "/api/machines/filter",
    GET_ALL: "/api/machines",
    GET_BY_ID: (id: number) => `/api/machines/${id}`,
    GET_BY_CATEGORY: (category: string) => `/api/machines/category/${category}`,
    GET_BY_DIFFICULTY: (difficulty: string) =>
      `/api/machines/difficulty/${difficulty}`,
    GET_BY_TARGET: (target: string) => `/api/machines/target/${target}`,
  },
  LEVELS: {
    GET_USER_LEVEL: (userId: number) => `/api/levels/user/${userId}`,
    GRANT_EXP: "/api/levels/grant-exp",
  },
  WORKOUT_GOALS: {
    GET_ALL: "/api/workout-goals",
    CREATE: "/api/workout-goals",
    UPDATE: (id: number) => `/api/workout-goals/${id}`,
    DELETE: (id: number) => `/api/workout-goals/${id}`,
  },
  WORKOUTS: {
    PLANS: "/api/workouts/plans",
    SESSIONS: "/api/workouts/sessions",
    GOALS: "/api/workouts/goals",
    PROGRESS: "/api/workouts/progress",
  },
} as const
