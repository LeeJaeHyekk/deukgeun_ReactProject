// ============================================================================
// Frontend 라우트 상수들
// ============================================================================

// 공개 라우트
export const PUBLIC_ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  FIND_ID: "/find-id",
  FIND_PASSWORD: "/find-password",
  MACHINE_GUIDE: "/machine-guide",
  LOCATION: "/location",
  COMMUNITY: "/community",
} as const

// 보호된 라우트 (로그인 필요)
export const PROTECTED_ROUTES = {
  MYPAGE: "/mypage",
  WORKOUT_JOURNAL: "/workout-journal",
  WORKOUT_PLANS: "/workout-plans",
  WORKOUT_SESSIONS: "/workout-sessions",
  WORKOUT_GOALS: "/workout-goals",
  USER_PROFILE: "/user-profile",
  SETTINGS: "/settings",
} as const

// 관리자 라우트
export const ADMIN_ROUTES = {
  DASHBOARD: "/admin/dashboard",
  USERS: "/admin/users",
  POSTS: "/admin/posts",
  MACHINES: "/admin/machines",
  GYMS: "/admin/gyms",
  STATS: "/admin/stats",
  PERFORMANCE: "/admin/performance",
  DATABASE_UPDATE: "/admin/database-update",
  ADMIN_DASHBOARD: "/admin/dashboard",
  ADMIN_PERFORMANCE: "/admin/performance",
  ADMIN_DATABASE: "/admin/database-update",
} as const

// 에러 페이지
export const ERROR_ROUTES = {
  ERROR: "/error",
  NOT_FOUND: "/404",
  UNAUTHORIZED: "/401",
  FORBIDDEN: "/403",
  SERVER_ERROR: "/500",
} as const

// 모든 라우트
export const ROUTES = {
  ...PUBLIC_ROUTES,
  ...PROTECTED_ROUTES,
  ...ADMIN_ROUTES,
  ...ERROR_ROUTES,
} as const

// 라우트 타입
export type PublicRoute = (typeof PUBLIC_ROUTES)[keyof typeof PUBLIC_ROUTES]
export type ProtectedRoute =
  (typeof PROTECTED_ROUTES)[keyof typeof PROTECTED_ROUTES]
export type AdminRoute = (typeof ADMIN_ROUTES)[keyof typeof ADMIN_ROUTES]
export type Route = (typeof ROUTES)[keyof typeof ROUTES]

// 라우트 그룹
export const ROUTE_GROUPS = {
  AUTH: [
    PUBLIC_ROUTES.LOGIN,
    PUBLIC_ROUTES.REGISTER,
    PUBLIC_ROUTES.FIND_ID,
    PUBLIC_ROUTES.FIND_PASSWORD,
  ],
  MAIN: [
    PUBLIC_ROUTES.HOME,
    PUBLIC_ROUTES.MACHINE_GUIDE,
    PUBLIC_ROUTES.LOCATION,
    PUBLIC_ROUTES.COMMUNITY,
  ],
  WORKOUT: [
    PROTECTED_ROUTES.WORKOUT_JOURNAL,
    PROTECTED_ROUTES.WORKOUT_PLANS,
    PROTECTED_ROUTES.WORKOUT_SESSIONS,
    PROTECTED_ROUTES.WORKOUT_GOALS,
  ],
  USER: [
    PROTECTED_ROUTES.MYPAGE,
    PROTECTED_ROUTES.USER_PROFILE,
    PROTECTED_ROUTES.SETTINGS,
  ],
  ADMIN: Object.values(ADMIN_ROUTES),
} as const

// 네비게이션 메뉴 구조
export const NAVIGATION_MENU = [
  {
    label: "홈",
    path: PUBLIC_ROUTES.HOME,
    icon: "Home",
    public: true,
  },
  {
    label: "헬스장 찾기",
    path: PUBLIC_ROUTES.LOCATION,
    icon: "MapPin",
    public: true,
  },
  {
    label: "머신 가이드",
    path: PUBLIC_ROUTES.MACHINE_GUIDE,
    icon: "Dumbbell",
    public: true,
  },
  {
    label: "커뮤니티",
    path: PUBLIC_ROUTES.COMMUNITY,
    icon: "Users",
    public: true,
  },
  {
    label: "운동 기록일지",
    path: PROTECTED_ROUTES.WORKOUT_JOURNAL,
    icon: "BarChart3",
    public: false,
  },
  {
    label: "마이페이지",
    path: PROTECTED_ROUTES.MYPAGE,
    icon: "User",
    public: false,
  },
] as const

// 관리자 네비게이션 메뉴
export const ADMIN_NAVIGATION_MENU = [
  {
    label: "대시보드",
    path: ADMIN_ROUTES.DASHBOARD,
    icon: "LayoutDashboard",
  },
  {
    label: "사용자 관리",
    path: ADMIN_ROUTES.USERS,
    icon: "Users",
  },
  {
    label: "게시글 관리",
    path: ADMIN_ROUTES.POSTS,
    icon: "FileText",
  },
  {
    label: "머신 관리",
    path: ADMIN_ROUTES.MACHINES,
    icon: "Dumbbell",
  },
  {
    label: "헬스장 관리",
    path: ADMIN_ROUTES.GYMS,
    icon: "MapPin",
  },
  {
    label: "통계",
    path: ADMIN_ROUTES.STATS,
    icon: "BarChart3",
  },
  {
    label: "성능 모니터링",
    path: ADMIN_ROUTES.PERFORMANCE,
    icon: "Activity",
  },
  {
    label: "데이터베이스 업데이트",
    path: ADMIN_ROUTES.DATABASE_UPDATE,
    icon: "Database",
  },
] as const

// 라우트 권한 체크 함수
export const isPublicRoute = (path: string): boolean => {
  return Object.values(PUBLIC_ROUTES).includes(path as PublicRoute)
}

export const isProtectedRoute = (path: string): boolean => {
  return Object.values(PROTECTED_ROUTES).includes(path as ProtectedRoute)
}

export const isAdminRoute = (path: string): boolean => {
  return Object.values(ADMIN_ROUTES).includes(path as AdminRoute)
}

export const requiresAuth = (path: string): boolean => {
  return isProtectedRoute(path) || isAdminRoute(path)
}

export const requiresAdmin = (path: string): boolean => {
  return isAdminRoute(path)
}

// 메뉴 아이템들 (Navigation에서 사용)
export const MENU_ITEMS = NAVIGATION_MENU

// 라우트 유틸리티 함수들
export const routeUtils = {
  isPublicRoute,
  isProtectedRoute,
  isAdminRoute,
  requiresAuth,
  requiresAdmin,
  getRouteGroup: (path: string) => {
    if (ROUTE_GROUPS.AUTH.includes(path as any)) return 'AUTH'
    if (ROUTE_GROUPS.MAIN.includes(path as any)) return 'MAIN'
    if (ROUTE_GROUPS.WORKOUT.includes(path as any)) return 'WORKOUT'
    if (ROUTE_GROUPS.USER.includes(path as any)) return 'USER'
    if (ROUTE_GROUPS.ADMIN.includes(path as any)) return 'ADMIN'
    return 'UNKNOWN'
  },
  isActiveRoute: (currentPath: string, targetPath: string) => {
    return currentPath === targetPath
  },
  getBreadcrumbs: (path: string) => {
    const segments = path.split('/').filter(Boolean)
    return segments.map((segment, index) => ({
      label: segment,
      path: '/' + segments.slice(0, index + 1).join('/')
    }))
  }
}
