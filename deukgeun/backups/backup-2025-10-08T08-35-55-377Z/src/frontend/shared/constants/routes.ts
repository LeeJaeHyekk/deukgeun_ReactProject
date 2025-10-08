// ============================================================================
// 라우트 상수 정의
// ============================================================================

export const ROUTES = {
  // 공개 페이지
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  REGISTER: '/signup', // SIGNUP과 동일한 경로
  FIND_ID: '/find-id',
  FIND_PASSWORD: '/find-password',
  COMMUNITY: '/community',

  // 보호된 페이지 (로그인 필요)
  MACHINE_GUIDE: '/machine-guide',
  LOCATION: '/location',
  GYM_FINDER: '/location', // LOCATION과 동일한 경로
  WORKOUT: '/workout',
  MYPAGE: '/mypage',
  MY_PAGE: '/mypage', // MYPAGE와 동일한 경로 (호환성을 위해)

  // 관리자 전용 페이지
  ADMIN_DASHBOARD: '/admin',
  ADMIN_DATABASE: '/admin/database',
  ADMIN_PERFORMANCE: '/admin/performance',
  ADMIN_USERS: '/admin/users',
  ADMIN_MACHINES: '/admin/machines',

  // 에러 페이지
  ERROR: '/error',
  SERVER_ERROR: '/error', // ERROR와 동일한 경로
} as const

// 메뉴 아이템 정의
export const MENU_ITEMS = [
  {
    label: '헬스장 찾기',
    path: ROUTES.LOCATION,
    icon: '🏢',
    description: '주변 헬스장을 찾아보세요',
    requiresAuth: true,
  },
  {
    label: '기구 가이드',
    path: ROUTES.MACHINE_GUIDE,
    icon: '🏋️‍♂️',
    description: '운동 기구 사용법을 알아보세요',
    requiresAuth: true,
  },
  {
    label: '커뮤니티',
    path: ROUTES.COMMUNITY,
    icon: '👥',
    description: '다른 운동인들과 소통하세요',
    requiresAuth: false,
  },
  {
    label: '운동 관리',
    path: ROUTES.WORKOUT,
    icon: '🏋️',
    description: '운동 계획, 목표, 분석을 한 페이지에서 관리하세요',
    requiresAuth: true,
  },
] as const

// 인증 관련 라우트
export const AUTH_ROUTES = [
  ROUTES.LOGIN,
  ROUTES.SIGNUP,
  ROUTES.FIND_ID,
  ROUTES.FIND_PASSWORD,
] as const

// 보호된 라우트 (로그인 필요)
export const PROTECTED_ROUTES = [
  ROUTES.MACHINE_GUIDE,
  ROUTES.LOCATION,
  ROUTES.WORKOUT,
  ROUTES.MYPAGE,
] as const

// 관리자 전용 라우트
export const ADMIN_ROUTES = [
  ROUTES.ADMIN_DASHBOARD,
  ROUTES.ADMIN_DATABASE,
  ROUTES.ADMIN_PERFORMANCE,
] as const

// 공개 라우트 (로그인 불필요)
export const PUBLIC_ROUTES = [
  ROUTES.HOME,
  ROUTES.COMMUNITY,
  ROUTES.ERROR,
] as const

// 라우트 타입 정의
export type RouteKey = keyof typeof ROUTES
export type RoutePath = (typeof ROUTES)[RouteKey]
export type MenuItem = (typeof MENU_ITEMS)[number]

// 라우트 유틸리티 함수들
export const routeUtils = {
  // 현재 경로가 보호된 라우트인지 확인
  isProtectedRoute: (path: string): boolean => {
    return PROTECTED_ROUTES.includes(path as any)
  },

  // 현재 경로가 관리자 라우트인지 확인
  isAdminRoute: (path: string): boolean => {
    return ADMIN_ROUTES.includes(path as any)
  },

  // 현재 경로가 인증 라우트인지 확인
  isAuthRoute: (path: string): boolean => {
    return AUTH_ROUTES.includes(path as any)
  },

  // 현재 경로가 공개 라우트인지 확인
  isPublicRoute: (path: string): boolean => {
    return PUBLIC_ROUTES.includes(path as any)
  },

  // 메뉴 아이템에서 경로로 메뉴 아이템 찾기
  findMenuItemByPath: (path: string): MenuItem | undefined => {
    return MENU_ITEMS.find(item => item.path === path)
  },

  // 사용자 인증 상태에 따라 접근 가능한 메뉴 아이템 필터링
  getAccessibleMenuItems: (isLoggedIn: boolean): MenuItem[] => {
    return MENU_ITEMS.filter(item => !item.requiresAuth || isLoggedIn)
  },
} as const
