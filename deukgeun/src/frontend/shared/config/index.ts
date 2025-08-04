// Frontend Configuration
export const config = {
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_BACKEND_URL || "http://localhost:3001",

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
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    REFRESH: "/auth/refresh",
    LOGOUT: "/auth/logout",
  },
  USER: {
    PROFILE: "/user/profile",
    UPDATE: "/user/update",
  },
  POSTS: {
    LIST: "/posts",
    CREATE: "/posts",
    DETAIL: (id: number) => `/posts/${id}`,
  },
  GYMS: {
    LIST: "/gyms",
    SEARCH: "/gyms/search",
    DETAIL: (id: number) => `/gyms/${id}`,
  },
} as const;
