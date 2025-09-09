// 프론트엔드 전용 API 엔드포인트 설정

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

export const API_ENDPOINTS = {
  BASE_URL: API_BASE_URL,
  // Auth 관련
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    VERIFY: '/api/auth/verify',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
    CHANGE_PASSWORD: '/api/auth/change-password',
    FIND_ID: '/api/auth/find-id',
    FIND_PASSWORD: '/api/auth/find-password',
    FIND_ID_SIMPLE: '/api/auth/find-id-simple',
    RESET_PASSWORD_SIMPLE_STEP1: '/api/auth/reset-password-simple-step1',
    RESET_PASSWORD_SIMPLE_STEP2: '/api/auth/reset-password-simple-step2',
    RESET_PASSWORD_VERIFY_CODE: '/api/auth/reset-password-verify-code',
    RESET_PASSWORD_COMPLETE: '/api/auth/reset-password-complete',
    CHECK: '/api/auth/check'
  },

  // User 관련
  USER: {
    PROFILE: '/api/user/profile',
    UPDATE: '/api/user/update',
    DELETE: '/api/user/delete',
    UPLOAD_AVATAR: '/api/user/upload-avatar'
  },

  // Workout 관련
  WORKOUT: {
    PLANS: {
      LIST: '/api/workout/plans',
      CREATE: '/api/workout/plans',
      GET: (id: string | number) => `/api/workout/plans/${id}`,
      UPDATE: (id: string | number) => `/api/workout/plans/${id}`,
      DELETE: (id: string | number) => `/api/workout/plans/${id}`,
      ACTIVATE: (id: string | number) => `/api/workout/plans/${id}/activate`,
      DEACTIVATE: (id: string | number) => `/api/workout/plans/${id}/deactivate`
    },
    SESSIONS: {
      LIST: '/api/workout/sessions',
      CREATE: '/api/workout/sessions',
      GET: (id: string | number) => `/api/workout/sessions/${id}`,
      UPDATE: (id: string | number) => `/api/workout/sessions/${id}`,
      DELETE: (id: string | number) => `/api/workout/sessions/${id}`,
      START: (id: string | number) => `/api/workout/sessions/${id}/start`,
      PAUSE: (id: string | number) => `/api/workout/sessions/${id}/pause`,
      RESUME: (id: string | number) => `/api/workout/sessions/${id}/resume`,
      COMPLETE: (id: string | number) => `/api/workout/sessions/${id}/complete`
    },
    GOALS: {
      LIST: '/api/workout/goals',
      CREATE: '/api/workout/goals',
      GET: (id: string | number) => `/api/workout/goals/${id}`,
      UPDATE: (id: string | number) => `/api/workout/goals/${id}`,
      DELETE: (id: string | number) => `/api/workout/goals/${id}`,
      COMPLETE: (id: string | number) => `/api/workout/goals/${id}/complete`
    },
    MACHINES: {
      LIST: '/api/workout/machines',
      GET: (id: string | number) => `/api/workout/machines/${id}`,
      CREATE: '/api/workout/machines',
      UPDATE: (id: string | number) => `/api/workout/machines/${id}`,
      DELETE: (id: string | number) => `/api/workout/machines/${id}`,
      BY_CATEGORY: (category: string) => `/api/workout/machines/category/${category}`,
      SEARCH: '/api/workout/machines/search',
      FILTER: '/api/workout/machines/filter'
    }
  },

  // Community 관련
  COMMUNITY: {
    POSTS: {
      LIST: '/api/community/posts',
      CREATE: '/api/community/posts',
      GET: (id: string | number) => `/api/community/posts/${id}`,
      UPDATE: (id: string | number) => `/api/community/posts/${id}`,
      DELETE: (id: string | number) => `/api/community/posts/${id}`,
      LIKE: (id: string | number) => `/api/community/posts/${id}/like`,
      UNLIKE: (id: string | number) => `/api/community/posts/${id}/unlike`
    },
    COMMENTS: {
      LIST: (postId: string | number) => `/api/community/posts/${postId}/comments`,
      CREATE: (postId: string | number) => `/api/community/posts/${postId}/comments`,
      GET: (postId: string | number, id: string | number) => `/api/community/posts/${postId}/comments/${id}`,
      UPDATE: (postId: string | number, id: string | number) => `/api/community/posts/${postId}/comments/${id}`,
      DELETE: (postId: string | number, id: string | number) => `/api/community/posts/${postId}/comments/${id}`,
      LIKE: (postId: string | number, id: string | number) => `/api/community/posts/${postId}/comments/${id}/like`,
      UNLIKE: (postId: string | number, id: string | number) => `/api/community/posts/${postId}/comments/${id}/unlike`
    },
    CATEGORIES: '/api/community/categories'
  },

  // Stats 관련
  STATS: {
    USER: '/api/stats/user',
    WORKOUT: '/api/stats/workout',
    PROGRESS: '/api/stats/progress',
    ACHIEVEMENTS: '/api/stats/achievements',
    LEADERBOARD: '/api/stats/leaderboard'
  },

  // Level 관련
  LEVEL: {
    INFO: '/api/level/info',
    GRANT_EXP: '/api/level/grant-exp',
    HISTORY: '/api/level/history',
    REWARDS: '/api/level/rewards'
  },

  // Admin 관련
  ADMIN: {
    DASHBOARD: '/api/admin/dashboard',
    USERS: {
      LIST: '/api/admin/users',
      GET: (id: string | number) => `/api/admin/users/${id}`,
      UPDATE: (id: string | number) => `/api/admin/users/${id}`,
      DELETE: (id: string | number) => `/api/admin/users/${id}`,
      BAN: (id: string | number) => `/api/admin/users/${id}/ban`,
      UNBAN: (id: string | number) => `/api/admin/users/${id}/unban`
    },
    SYSTEM: {
      STATS: '/api/admin/system/stats',
      PERFORMANCE: '/api/admin/system/performance',
      LOGS: '/api/admin/system/logs',
      SETTINGS: '/api/admin/system/settings'
    },
    CONTENT: {
      POSTS: '/api/admin/content/posts',
      COMMENTS: '/api/admin/content/comments',
      REPORTS: '/api/admin/content/reports'
    }
  },

  // Location 관련
  LOCATION: {
    GYMS: {
      LIST: '/api/location/gyms',
      GET: (id: string | number) => `/api/location/gyms/${id}`,
      SEARCH: '/api/location/gyms/search',
      NEARBY: '/api/location/gyms/nearby'
    }
  }
}

// 헬퍼 함수들
export function buildApiUrl(endpoint: string): string {
  return `${API_BASE_URL}${endpoint}`
}

export function buildPaginatedUrl(endpoint: string, page: number, limit: number): string {
  return `${API_BASE_URL}${endpoint}?page=${page}&limit=${limit}`
}

export function buildSearchUrl(endpoint: string, query: string): string {
  return `${API_BASE_URL}${endpoint}?q=${encodeURIComponent(query)}`
}

export function buildFilterUrl(endpoint: string, filters: Record<string, string | number>): string {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    params.append(key, String(value))
  })
  return `${API_BASE_URL}${endpoint}?${params.toString()}`
}
