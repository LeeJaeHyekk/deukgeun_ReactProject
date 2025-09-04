// 프론트엔드 전용 라우트 상수

export const ROUTES = {
  // 기본 페이지
  HOME: '/',
  ABOUT: '/about',
  CONTACT: '/contact',

  // 인증 관련
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',

  // 사용자 관련
  PROFILE: '/profile',
  MYPAGE: '/mypage',
  SETTINGS: '/settings',

  // 운동 관련
  WORKOUT: '/workout',
  WORKOUT_PLANS: '/workout/plans',
  WORKOUT_SESSIONS: '/workout/sessions',
  WORKOUT_GOALS: '/workout/goals',
  WORKOUT_PROGRESS: '/workout/progress',

  // 커뮤니티 관련
  COMMUNITY: '/community',
  POST: '/community/post',
  POST_DETAIL: (id: string | number) => `/community/post/${id}`,

  // 위치 관련
  LOCATION: '/location',
  GYMS: '/location/gyms',
  GYM_DETAIL: (id: string | number) => `/location/gyms/${id}`,

  // 관리자 관련
  ADMIN: '/admin',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_USERS: '/admin/users',
  ADMIN_POSTS: '/admin/posts',
  ADMIN_PERFORMANCE: '/admin/performance',
  ADMIN_DATABASE: '/admin/database',
  ADMIN_SETTINGS: '/admin/settings',
  ADMIN_LOGS: '/admin/logs',

  // 기타
  NOT_FOUND: '/404',
  ERROR: '/error'
} as const

// 라우트 타입
export type RouteKey = keyof typeof ROUTES
export type RoutePath = typeof ROUTES[RouteKey]

// 라우트 헬퍼 함수
export function getRoutePath(key: RouteKey): string {
  return ROUTES[key] as string
}

// 동적 라우트 생성 함수
export function createDynamicRoute(template: string, params: Record<string, string | number>): string {
  let route = template
  Object.entries(params).forEach(([key, value]) => {
    route = route.replace(`:${key}`, String(value))
  })
  return route
}

// 라우트 매칭 함수
export function matchRoute(pathname: string, routePattern: string): boolean {
  const patternParts = routePattern.split('/')
  const pathParts = pathname.split('/')
  
  if (patternParts.length !== pathParts.length) {
    return false
  }
  
  return patternParts.every((part, index) => {
    return part.startsWith(':') || part === pathParts[index]
  })
}

// 보호된 라우트 목록
export const PROTECTED_ROUTES = [
  ROUTES.PROFILE,
  ROUTES.MYPAGE,
  ROUTES.SETTINGS,
  ROUTES.WORKOUT,
  ROUTES.WORKOUT_PLANS,
  ROUTES.WORKOUT_SESSIONS,
  ROUTES.WORKOUT_GOALS,
  ROUTES.WORKOUT_PROGRESS,
] as const

// 관리자 전용 라우트 목록
export const ADMIN_ROUTES = [
  ROUTES.ADMIN,
  ROUTES.ADMIN_DASHBOARD,
  ROUTES.ADMIN_USERS,
  ROUTES.ADMIN_POSTS,
  ROUTES.ADMIN_PERFORMANCE,
  ROUTES.ADMIN_DATABASE,
  ROUTES.ADMIN_SETTINGS,
  ROUTES.ADMIN_LOGS,
] as const

// 공개 라우트 목록
export const PUBLIC_ROUTES = [
  ROUTES.HOME,
  ROUTES.ABOUT,
  ROUTES.CONTACT,
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.FORGOT_PASSWORD,
  ROUTES.RESET_PASSWORD,
  ROUTES.COMMUNITY,
  ROUTES.LOCATION,
  ROUTES.GYMS,
] as const

// 메뉴 아이템 정의
export const MENU_ITEMS = [
  { label: '홈', path: ROUTES.HOME, icon: '🏠' },
  { label: '운동', path: ROUTES.WORKOUT, icon: '💪' },
  { label: '커뮤니티', path: ROUTES.COMMUNITY, icon: '👥' },
  { label: '위치', path: ROUTES.LOCATION, icon: '📍' },
] as const

// 라우트 유틸리티
export const routeUtils = {
  // 접근 가능한 메뉴 아이템 가져오기
  getAccessibleMenuItems: (isLoggedIn: boolean) => {
    if (isLoggedIn) {
      return MENU_ITEMS
    }
    // 로그인하지 않은 사용자는 홈과 커뮤니티만 접근 가능
    return MENU_ITEMS.filter(item => 
      item.path === ROUTES.HOME || item.path === ROUTES.COMMUNITY
    )
  },

  // 보호된 라우트인지 확인
  isProtectedRoute: (pathname: string): boolean => {
    return PROTECTED_ROUTES.some(route => 
      typeof route === 'string' ? pathname === route : false
    )
  },

  // 관리자 라우트인지 확인
  isAdminRoute: (pathname: string): boolean => {
    return ADMIN_ROUTES.some(route => 
      typeof route === 'string' ? pathname === route : false
    )
  }
}
