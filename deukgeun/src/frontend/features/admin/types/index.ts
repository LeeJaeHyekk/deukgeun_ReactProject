// ============================================================================
// Admin Feature Types
// ============================================================================

// 관리자 권한 레벨
export type AdminRole = "admin" | "moderator" | "user"

// 관리자 메뉴 아이템
export interface AdminMenuItem {
  id: string
  label: string
  path: string
  icon: string
  description: string
  requiredRole: AdminRole
  isActive?: boolean
}

// 시스템 통계
export interface SystemStats {
  totalUsers: number
  activeUsers: number
  totalMachines: number
  totalPosts: number
  systemUptime: number
  memoryUsage: {
    used: number
    total: number
    percentage: number
  }
  diskUsage: {
    used: number
    total: number
    percentage: number
  }
  cpuUsage: number
  networkTraffic: {
    incoming: number
    outgoing: number
  }
}

// 성능 메트릭
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
    connectionCount: number
  }
  cacheHitRate: number
}

// 관리자 대시보드 데이터
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
    recentUsers: any[]
    recentPosts: any[]
    recentWorkouts: any[]
  }
  systemHealth: {
    status: "healthy" | "warning" | "error"
    uptime: number
    lastBackup: Date
    alerts: any[]
  }
}

// 관리자 활동
export interface AdminActivity {
  id: string
  type: "user_created" | "machine_added" | "system_update" | "error_logged"
  description: string
  timestamp: Date
  userId?: string
  severity: "low" | "medium" | "high"
}

// 시스템 상태
export interface SystemHealth {
  status: "healthy" | "warning" | "error"
  issues: SystemIssue[]
  lastCheck: Date
}

// 시스템 이슈
export interface SystemIssue {
  id: string
  type: "performance" | "security" | "database" | "api"
  severity: "low" | "medium" | "high" | "critical"
  message: string
  timestamp: Date
  resolved?: boolean
}

// 데이터베이스 업데이트 정보
export interface DatabaseUpdateInfo {
  id: string
  table: string
  operation: "insert" | "update" | "delete"
  recordCount: number
  timestamp: Date
  status: "pending" | "completed" | "failed"
  error?: string
}

// 관리자 설정
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

// API 응답 타입들
export interface AdminApiResponse<T> {
  success: boolean
  data: T
  message: string
  timestamp: Date
}

export interface AdminStatsResponse extends AdminApiResponse<SystemStats> {}
export interface AdminMetricsResponse
  extends AdminApiResponse<PerformanceMetrics> {}
export interface AdminDashboardResponse
  extends AdminApiResponse<AdminDashboardData> {}
export interface AdminSettingsResponse
  extends AdminApiResponse<AdminSettings> {}
