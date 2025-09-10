export const ROUTES = {
  // Auth routes
  LOGIN: '/login',
  REGISTER: '/register',
  FIND_ID: '/find-id',
  FIND_PASSWORD: '/find-password',
  RESET_PASSWORD: '/reset-password',

  // Main routes
  HOME: '/',
  PROFILE: '/profile',
  MY_PAGE: '/my-page',

  // Community routes
  COMMUNITY: '/community',
  COMMUNITY_POST: '/community/post',
  COMMUNITY_POST_DETAIL: '/community/post/:id',

  // Machine guide routes
  MACHINE_GUIDE: '/machine-guide',
  MACHINE_DETAIL: '/machine/:id',

  // Workout routes
  WORKOUT: '/workout',
  WORKOUT_PLAN: '/workout/plan',
  WORKOUT_SESSION: '/workout/session',

  // Location routes
  GYM_FINDER: '/gym-finder',
  GYM_DETAIL: '/gym/:id',

  // Admin routes
  ADMIN: '/admin',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_USERS: '/admin/users',
  ADMIN_POSTS: '/admin/posts',
  ADMIN_MACHINES: '/admin/machines',
  ADMIN_PERFORMANCE: '/admin/performance',
  ADMIN_DATABASE: '/admin/database',

  // Error routes
  NOT_FOUND: '/404',
  SERVER_ERROR: '/500',
} as const

export type RouteKey = keyof typeof ROUTES
export type RouteValue = (typeof ROUTES)[RouteKey]
