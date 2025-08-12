// Frontend Configuration
export const config = {
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_BACKEND_URL || "http://localhost:5000",

  // reCAPTCHA Configuration
  RECAPTCHA_SITE_KEY:
    import.meta.env.VITE_RECAPTCHA_SITE_KEY ||
    "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI", // Test key

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
  BASE_URL: import.meta.env.VITE_BACKEND_URL || "http://localhost:5000",
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
  },
  USER: {
    PROFILE: "/api/user/profile",
    UPDATE: "/api/user/update",
  },
  POSTS: {
    LIST: "/api/posts",
    CREATE: "/api/posts",
    DETAIL: (id: number) => `/api/posts/${id}`,
  },
  GYMS: {
    LIST: "/api/gyms",
    SEARCH: "/api/gyms/search",
    DETAIL: (id: number) => `/api/gyms/${id}`,
  },
  MACHINES: {
    LIST: "/api/machines",
    CREATE: "/api/machines",
    DETAIL: (id: number) => `/api/machines/${id}`,
    UPDATE: (id: number) => `/api/machines/${id}`,
    DELETE: (id: number) => `/api/machines/${id}`,
    FILTER: "/api/machines/filter",
  },
  WORKOUTS: {
    PLANS: "/api/workouts/plans",
    SESSIONS: "/api/workouts/sessions",
    GOALS: "/api/workouts/goals",
    PROGRESS: "/api/workouts/progress",
  },
} as const
