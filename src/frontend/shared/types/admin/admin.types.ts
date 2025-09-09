// 프론트엔드 전용 Admin 타입 정의

// 시스템 통계 타입
export interface SystemStats {
  totalUsers: number
  activeUsers: number
  totalMachines: number
  totalPosts: number
  totalGyms: number
  systemUptime: number
  memoryUsage: number
  diskUsage: number
  cpuUsage: number
  networkTraffic: {
    incoming: number
    outgoing: number
  }
}

// 성능 메트릭 타입
export interface PerformanceMetrics {
  responseTime: {
    average: number
    min: number
    max: number
  }
  throughput: {
    requestsPerSecond: number
    requestsPerMinute: number
  }
  errorRate: {
    percentage: number
    count: number
  }
  databasePerformance: {
    queryTime: number
    connectionPool: number
    slowQueries: number
  }
  cacheHitRate: number
  availability: number
  memory: {
    used: number
    total: number
    percentage: number
  }
  cpu: {
    used: number
    total: number
    percentage: number
  }
}

// 관리자 대시보드 데이터 타입
export interface AdminDashboardData {
  overview: {
    totalUsers: number
    activeUsers: number
    newUsersToday: number
    totalPosts: number
    newPostsToday: number
    totalWorkouts: number
    workoutsToday: number
  }
  recentActivity: {
    recentUsers: AdminUser[]
    recentPosts: AdminPost[]
    recentWorkouts: AdminWorkout[]
  }
  systemHealth: {
    status: "healthy" | "warning" | "critical"
    uptime: number
    lastBackup: Date
    alerts: AdminAlert[]
  }
}

// 관리자 설정 타입
export interface AdminSettings {
  general: {
    siteName: string
    siteDescription: string
    maintenanceMode: boolean
    registrationEnabled: boolean
  }
  security: {
    maxLoginAttempts: number
    sessionTimeout: number
    passwordRequirements: {
      minLength: number
      requireUppercase: boolean
      requireLowercase: boolean
      requireNumbers: boolean
      requireSpecialChars: boolean
    }
  }
  features: {
    workoutTracking: boolean
    communityPosts: boolean
    levelSystem: boolean
    notifications: boolean
  }
  limits: {
    maxWorkoutPlans: number
    maxWorkoutSessions: number
    maxPostsPerDay: number
    maxFileSize: number
  }
}

// 관리자용 사용자 타입
export interface AdminUser {
  id: number
  email: string
  nickname: string
  name: string
  role: "user" | "admin" | "moderator"
  isActive: boolean
  isEmailVerified: boolean
  lastLoginAt?: Date
  createdAt: Date
  status: "active" | "inactive" | "banned"
  stats: {
    totalPosts: number
    totalWorkouts: number
    level: number
    experience: number
  }
}

// 관리자용 게시글 타입
export interface AdminPost {
  id: number
  title: string
  content: string
  author: {
    id: number
    nickname: string
    email: string
  }
  category: string
  status: "published" | "draft" | "hidden" | "reported"
  likesCount: number
  commentsCount: number
  createdAt: Date
  updatedAt: Date
}

// 관리자용 운동 타입
export interface AdminWorkout {
  id: number
  user: {
    id: string
    nickname: string
    email: string
  }
  type: "session" | "plan" | "goal"
  name: string
  status: string
  duration?: number
  createdAt: Date
  completedAt?: Date
}

// 관리자 알림 타입
export interface AdminAlert {
  id: string
  type: "error" | "warning" | "info"
  title: string
  message: string
  severity: "low" | "medium" | "high" | "critical"
  createdAt: Date
  isRead: boolean
}

// API 요청 타입들
export interface UpdateUserRequest {
  id: string
  nickname?: string
  email?: string
  role?: string
  isActive?: boolean
}

export interface BanUserRequest {
  id: string
  reason: string
  duration?: number // 일 단위
}

export interface UpdateSettingsRequest {
  general?: Partial<AdminSettings["general"]>
  security?: Partial<AdminSettings["security"]>
  features?: Partial<AdminSettings["features"]>
  limits?: Partial<AdminSettings["limits"]>
}

// API 응답 타입들
export interface AdminApiResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: string
}

export interface AdminListResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  message?: string
}

// 관리자 권한 타입
export type AdminRole = "super_admin" | "admin" | "moderator"

// 관리자 액션 타입
export type AdminAction =
  | "view_dashboard"
  | "manage_users"
  | "manage_content"
  | "manage_settings"
  | "view_logs"
  | "manage_system"

// 관리자 권한 체크 함수
export interface AdminPermissions {
  canViewDashboard: boolean
  canManageUsers: boolean
  canManageContent: boolean
  canManageSettings: boolean
  canViewLogs: boolean
  canManageSystem: boolean
}
