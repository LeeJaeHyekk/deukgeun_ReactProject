// ============================================================================
// API 엔드포인트 상수
// ============================================================================

// 기본 API 경로
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'

// 인증 관련 엔드포인트
export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
  VERIFY_EMAIL: '/auth/verify-email',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  CHANGE_PASSWORD: '/auth/change-password',
  PROFILE: '/auth/profile',
  UPDATE_PROFILE: '/auth/update-profile'
}

// 사용자 관련 엔드포인트
export const USER_ENDPOINTS = {
  BASE: '/users',
  PROFILE: '/users/profile',
  SETTINGS: '/users/settings',
  PREFERENCES: '/users/preferences',
  STATISTICS: '/users/statistics',
  ACTIVITY: '/users/activity',
  ACHIEVEMENTS: '/users/achievements'
}

// 워크아웃 관련 엔드포인트
export const WORKOUT_ENDPOINTS = {
  PLANS: '/workouts/plans',
  SESSIONS: '/workouts/sessions',
  GOALS: '/workouts/goals',
  EXERCISES: '/workouts/exercises',
  PROGRESS: '/workouts/progress',
  STATISTICS: '/workouts/statistics',
  TEMPLATES: '/workouts/templates'
}

// 머신 관련 엔드포인트
export const MACHINE_ENDPOINTS = {
  BASE: '/machines',
  CATEGORIES: '/machines/categories',
  DIFFICULTY: '/machines/difficulty',
  TARGET: '/machines/target',
  SEARCH: '/machines/search',
  FAVORITES: '/machines/favorites',
  USAGE_STATS: '/machines/usage-stats'
}

// 헬스장 관련 엔드포인트
export const GYM_ENDPOINTS = {
  BASE: '/gyms',
  SEARCH: '/gyms/search',
  NEARBY: '/gyms/nearby',
  DETAILS: '/gyms/details',
  REVIEWS: '/gyms/reviews',
  RATINGS: '/gyms/ratings',
  FAVORITES: '/gyms/favorites'
}

// 커뮤니티 관련 엔드포인트
export const COMMUNITY_ENDPOINTS = {
  POSTS: '/posts',
  CATEGORIES: '/posts/categories',
  COMMENTS: '/posts/comments',
  LIKES: '/posts/likes',
  SHARES: '/posts/shares',
  REPORTS: '/posts/reports'
}

// 레벨 시스템 관련 엔드포인트
export const LEVEL_ENDPOINTS = {
  USER_LEVEL: '/level/user',
  GAIN_EXP: '/level/exp',
  REWARDS: '/level/rewards',
  MILESTONES: '/level/milestones',
  LEADERBOARD: '/level/leaderboard',
  SEASON_INFO: '/level/season'
}

// 통계 관련 엔드포인트
export const STATS_ENDPOINTS = {
  PLATFORM: '/stats/platform',
  USER: '/stats/user',
  WORKOUT: '/stats/workout',
  GYM: '/stats/gym',
  MACHINE: '/stats/machine',
  OVERALL: '/stats/overall'
}

// 파일 업로드 관련 엔드포인트
export const UPLOAD_ENDPOINTS = {
  IMAGE: '/upload/image',
  PROFILE: '/upload/profile',
  WORKOUT: '/upload/workout',
  MACHINE: '/upload/machine'
}

// 알림 관련 엔드포인트
export const NOTIFICATION_ENDPOINTS = {
  BASE: '/notifications',
  MARK_READ: '/notifications/read',
  SETTINGS: '/notifications/settings',
  PREFERENCES: '/notifications/preferences'
}

// 전체 API 엔드포인트 통합
export const API_ENDPOINTS = {
  AUTH: AUTH_ENDPOINTS,
  USER: USER_ENDPOINTS,
  WORKOUT: WORKOUT_ENDPOINTS,
  MACHINE: MACHINE_ENDPOINTS,
  GYM: GYM_ENDPOINTS,
  COMMUNITY: COMMUNITY_ENDPOINTS,
  LEVEL: LEVEL_ENDPOINTS,
  STATS: STATS_ENDPOINTS,
  UPLOAD: UPLOAD_ENDPOINTS,
  NOTIFICATION: NOTIFICATION_ENDPOINTS
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
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
}

// API 응답 메시지
export const API_MESSAGES = {
  SUCCESS: 'Success',
  CREATED: 'Created successfully',
  UPDATED: 'Updated successfully',
  DELETED: 'Deleted successfully',
  NOT_FOUND: 'Resource not found',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  VALIDATION_ERROR: 'Validation failed',
  SERVER_ERROR: 'Internal server error'
}

// API 요청 헤더
export const API_HEADERS = {
  CONTENT_TYPE: 'Content-Type',
  AUTHORIZATION: 'Authorization',
  ACCEPT: 'Accept',
  USER_AGENT: 'User-Agent'
}

// API 요청 타임아웃
export const API_TIMEOUTS = {
  DEFAULT: 10000,
  UPLOAD: 30000,
  DOWNLOAD: 60000,
  LONG_OPERATION: 120000
}
