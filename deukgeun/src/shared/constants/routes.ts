// ============================================================================
// 라우트 상수 정의
// 애플리케이션의 모든 페이지 경로를 중앙화하여 관리
// ============================================================================

export const ROUTES = {
  // 메인 페이지
  HOME: "/",
  
  // 인증 관련
  LOGIN: "/login",
  SIGNUP: "/signup",
  FIND_ID: "/find-id",
  FIND_PASSWORD: "/find-password",
  
  // 커뮤니티
  COMMUNITY: "/community",
  
  // 머신 가이드
  MACHINE_GUIDE: "/machine-guide",
  
  // 위치 서비스
  LOCATION: "/location",
  
  // 워크아웃
  WORKOUT: "/workout",
  
  // 마이페이지
  MYPAGE: "/mypage",
  
  // 관리자
  ADMIN_DASHBOARD: "/admin/dashboard",
  ADMIN_PERFORMANCE: "/admin/performance",
  ADMIN_DATABASE: "/admin/database",
  
  // 에러 페이지
  ERROR: "/error",
} as const

// 라우트 유틸리티 함수들
export const routeUtils = {
  // 현재 경로가 특정 경로와 일치하는지 확인
  isActiveRoute: (currentPath: string, targetPath: string): boolean => {
    if (targetPath === ROUTES.HOME) {
      return currentPath === targetPath
    }
    return currentPath.startsWith(targetPath)
  },
  
  // 경로가 보호된 라우트인지 확인
  isProtectedRoute: (path: string): boolean => {
    const protectedRoutes = [
      ROUTES.WORKOUT,
      ROUTES.MYPAGE,
      ROUTES.ADMIN_DASHBOARD,
      ROUTES.ADMIN_PERFORMANCE,
      ROUTES.ADMIN_DATABASE,
    ]
    return protectedRoutes.some(route => path.startsWith(route))
  },
  
  // 경로가 관리자 전용인지 확인
  isAdminRoute: (path: string): boolean => {
    const adminRoutes = [
      ROUTES.ADMIN_DASHBOARD,
      ROUTES.ADMIN_PERFORMANCE,
      ROUTES.ADMIN_DATABASE,
    ]
    return adminRoutes.some(route => path.startsWith(route))
  },
  
  // 로그인 후 리다이렉트할 경로 반환
  getLoginRedirectPath: (intendedPath: string): string => {
    if (intendedPath === ROUTES.LOGIN || intendedPath === ROUTES.SIGNUP) {
      return ROUTES.HOME
    }
    return intendedPath
  },
  
  // 사용자 권한에 따른 접근 가능한 메뉴 아이템 반환
  getAccessibleMenuItems: (isLoggedIn: boolean, isAdmin: boolean = false): MenuItem[] => {
    return MENU_ITEMS.filter(item => {
      if (item.requiresAuth && !isLoggedIn) return false
      if (item.requiresAdmin && !isAdmin) return false
      return true
    })
  },
} as const

// 메뉴 아이템 정의
export interface MenuItem {
  label: string
  path: string
  icon?: string
  requiresAuth?: boolean
  requiresAdmin?: boolean
}

export const MENU_ITEMS: MenuItem[] = [
  { label: "홈", path: ROUTES.HOME, icon: "home" },
  { label: "커뮤니티", path: ROUTES.COMMUNITY, icon: "community" },
  { label: "머신 가이드", path: ROUTES.MACHINE_GUIDE, icon: "machine" },
  { label: "위치 서비스", path: ROUTES.LOCATION, icon: "location" },
  { label: "워크아웃", path: ROUTES.WORKOUT, icon: "workout", requiresAuth: true },
  { label: "마이페이지", path: ROUTES.MYPAGE, icon: "mypage", requiresAuth: true },
  { label: "관리자", path: ROUTES.ADMIN_DASHBOARD, icon: "admin", requiresAuth: true, requiresAdmin: true },
]

// 타입 정의
export type RouteKey = keyof typeof ROUTES
export type RoutePath = typeof ROUTES[RouteKey]
