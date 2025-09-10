// ============================================================================
// Application Configuration
// ============================================================================

export const config = {
  // API Configuration
  api: {
    baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001',
    timeout: 10000,
    retryAttempts: 3,
    retryDelay: 1000,
  },

  // Authentication Configuration
  auth: {
    tokenKey: 'accessToken',
    userKey: 'user',
    refreshThreshold: 5 * 60 * 1000, // 5 minutes before expiry
    maxRetries: 3,
  },

  // Application Configuration
  app: {
    name: 'Deukgeun',
    version: '1.0.0',
    environment: import.meta.env.MODE || 'development',
    debug: import.meta.env.DEV,
  },

  // Feature Flags
  features: {
    enableRecaptcha: import.meta.env.VITE_ENABLE_RECAPTCHA === 'true',
    enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    enableNotifications: import.meta.env.VITE_ENABLE_NOTIFICATIONS === 'true',
  },

  // ReCAPTCHA Configuration
  RECAPTCHA: {
    SITE_KEY:
      import.meta.env.VITE_RECAPTCHA_SITE_KEY || 'your_recaptcha_site_key_here',
    IS_DEVELOPMENT: import.meta.env.DEV || false,
    IS_TEST_KEY: (import.meta.env.VITE_RECAPTCHA_SITE_KEY || '').includes(
      'test'
    ),
    VERSION: 'v3',
  },

  // UI Configuration
  ui: {
    theme: 'light',
    language: 'ko',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: 'HH:mm',
  },

  // Pagination Configuration
  pagination: {
    defaultPageSize: 10,
    maxPageSize: 100,
    pageSizeOptions: [10, 20, 50, 100],
  },

  // File Upload Configuration
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    maxFiles: 5,
  },

  // Cache Configuration
  cache: {
    defaultTTL: 5 * 60 * 1000, // 5 minutes
    maxSize: 100, // Maximum number of cached items
  },
}

// API Endpoints Configuration
export const API_ENDPOINTS = {
  BASE_URL: config.api.baseURL,
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
    ACCOUNT_RECOVERY: '/auth/account-recovery',
  },

  // User endpoints
  USER: {
    PROFILE: '/user/profile',
    UPDATE: '/user/update',
    DELETE: '/user/delete',
    AVATAR: '/user/avatar',
  },

  // Machine endpoints
  MACHINES: {
    LIST: '/machines',
    GET_BY_ID: '/machines',
    GET_BY_CATEGORY: '/machines/category',
    SEARCH: '/machines/search',
    CREATE: '/machines',
    UPDATE: '/machines',
    DELETE: '/machines',
  },

  // Post endpoints
  POSTS: {
    LIST: '/community/posts',
    GET_BY_ID: '/community/posts',
    CREATE: '/community/posts',
    UPDATE: '/community/posts',
    DELETE: '/community/posts',
    LIKE: '/community/posts/like',
    UNLIKE: '/community/posts/unlike',
  },

  // Comment endpoints
  COMMENTS: {
    LIST: '/community/comments',
    GET_BY_ID: '/community/comments',
    CREATE: '/community/comments',
    UPDATE: '/community/comments',
    DELETE: '/community/comments',
    LIKE: '/community/comments/like',
    UNLIKE: '/community/comments/unlike',
  },

  // Workout endpoints
  WORKOUT: {
    SESSIONS: '/workout/sessions',
    PLANS: '/workout/plans',
    GOALS: '/workout/goals',
    STATS: '/workout/stats',
  },

  // Gym endpoints
  GYMS: {
    LIST: '/gyms',
    GET_BY_ID: '/gyms',
    SEARCH: '/gyms/search',
    NEARBY: '/gyms/nearby',
  },

  // Admin endpoints
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    POSTS: '/admin/posts',
    MACHINES: '/admin/machines',
    STATS: '/admin/stats',
    SETTINGS: '/admin/settings',
  },

  // Level endpoints
  LEVELS: {
    GET_USER_LEVEL: '/levels/user',
    GET_LEVELS: '/levels',
    UPDATE_LEVEL: '/levels/update',
  },
}

// Environment Configuration
export const ENV_CONFIG = {
  // Backend URL
  BACKEND_URL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001',

  // Frontend URL
  FRONTEND_URL: import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173',

  // Database URL
  DATABASE_URL:
    import.meta.env.VITE_DATABASE_URL || 'mysql://localhost:3306/deukgeun',

  // Redis URL
  REDIS_URL: import.meta.env.VITE_REDIS_URL || 'redis://localhost:6379',

  // JWT Secret
  JWT_SECRET: import.meta.env.VITE_JWT_SECRET || 'your-secret-key',

  // ReCAPTCHA
  RECAPTCHA_SITE_KEY: import.meta.env.VITE_RECAPTCHA_SITE_KEY || '',
  RECAPTCHA_SECRET_KEY: import.meta.env.VITE_RECAPTCHA_SECRET_KEY || '',

  // Kakao API
  KAKAO_API_KEY: import.meta.env.VITE_KAKAO_API_KEY || '',

  // Google API
  GOOGLE_API_KEY: import.meta.env.VITE_GOOGLE_API_KEY || '',

  // Email Configuration
  SMTP_HOST: import.meta.env.VITE_SMTP_HOST || 'localhost',
  SMTP_PORT: import.meta.env.VITE_SMTP_PORT || '587',
  SMTP_USER: import.meta.env.VITE_SMTP_USER || '',
  SMTP_PASS: import.meta.env.VITE_SMTP_PASS || '',

  // File Storage
  UPLOAD_PATH: import.meta.env.VITE_UPLOAD_PATH || './uploads',
  MAX_FILE_SIZE: import.meta.env.VITE_MAX_FILE_SIZE || '10485760', // 10MB

  // Rate Limiting
  RATE_LIMIT_WINDOW: import.meta.env.VITE_RATE_LIMIT_WINDOW || '900000', // 15 minutes
  RATE_LIMIT_MAX: import.meta.env.VITE_RATE_LIMIT_MAX || '100',

  // CORS
  CORS_ORIGIN: import.meta.env.VITE_CORS_ORIGIN || 'http://localhost:5173',

  // Logging
  LOG_LEVEL: import.meta.env.VITE_LOG_LEVEL || 'info',
  LOG_FILE: import.meta.env.VITE_LOG_FILE || './logs/app.log',

  // Monitoring
  ENABLE_MONITORING: import.meta.env.VITE_ENABLE_MONITORING === 'true',
  MONITORING_PORT: import.meta.env.VITE_MONITORING_PORT || '9090',
}

// Kakao Configuration
export const KAKAO_CONFIG = {
  API_KEY: ENV_CONFIG.KAKAO_API_KEY,
  BASE_URL: 'https://dapi.kakao.com/v2',
  ENDPOINTS: {
    SEARCH: '/local/search/keyword.json',
    GEOCODE: '/local/geo/coord2address.json',
    REVERSE_GEOCODE: '/local/geo/coord2address.json',
  },
}

// Gym Configuration
export const GYM_CONFIG = {
  SEARCH_RADIUS: 5000, // 5km in meters
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  CACHE_TTL: 30 * 60 * 1000, // 30 minutes
}

// Image Matching Configuration
export const IMAGE_MATCHING_CONFIG = {
  MACHINE_IMAGES: {
    벤치프레스: '/img/machine/bench-press.png',
    스쿼트랙: '/img/machine/squat-rack.png',
    데드리프트: '/img/machine/deadlift.png',
    풀업바: '/img/machine/pull-up-bar.png',
    덤벨: '/img/machine/dumbbell.png',
    바벨: '/img/machine/barbell.png',
    케이블머신: '/img/machine/cable-machine.png',
    레그프레스: '/img/machine/leg-press.png',
    레그컬: '/img/machine/leg-curl.png',
    레그익스텐션: '/img/machine/leg-extension.png',
    체스트프레스: '/img/machine/chest-press.png',
    숄더프레스: '/img/machine/shoulder-press.png',
    라트풀다운: '/img/machine/lat-pulldown.png',
    로우머신: '/img/machine/row-machine.png',
    트라이셉스: '/img/machine/triceps.png',
    바이셉스: '/img/machine/biceps.png',
    덤벨프레스: '/img/machine/dumbbell-press.png',
    인클라인프레스: '/img/machine/incline-press.png',
    디클라인프레스: '/img/machine/decline-press.png',
    플라이머신: '/img/machine/fly-machine.png',
  },
  DEFAULT_IMAGE: '/img/machine/default.png',
}

// Menu Items Configuration
export const MENU_ITEMS = [
  {
    label: '홈',
    path: '/',
    icon: 'Home',
    public: true,
  },
  {
    label: '커뮤니티',
    path: '/community',
    icon: 'Users',
    public: true,
  },
  {
    label: '머신 가이드',
    path: '/machine-guide',
    icon: 'Dumbbell',
    auth: true,
  },
  {
    label: '헬스장 찾기',
    path: '/gym-finder',
    icon: 'MapPin',
    auth: true,
  },
  {
    label: '워크아웃',
    path: '/workout',
    icon: 'Activity',
    auth: true,
  },
  {
    label: '마이페이지',
    path: '/my-page',
    icon: 'User',
    auth: true,
  },
]

// Route Utilities
export const routeUtils = {
  getAccessibleMenuItems: (isAuthenticated: boolean) => {
    return MENU_ITEMS.filter(
      item => item.public || (item.auth && isAuthenticated)
    )
  },

  isPublicRoute: (path: string) => {
    return MENU_ITEMS.some(item => item.path === path && item.public)
  },

  isAuthRoute: (path: string) => {
    return MENU_ITEMS.some(item => item.path === path && item.auth)
  },

  getMenuIcon: (path: string) => {
    const item = MENU_ITEMS.find(item => item.path === path)
    return item?.icon || 'Circle'
  },
}

// Export all configurations
export default config
