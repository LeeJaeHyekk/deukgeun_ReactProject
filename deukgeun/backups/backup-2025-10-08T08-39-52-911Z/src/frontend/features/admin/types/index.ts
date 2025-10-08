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
  systemLoad: number
  memoryUsage: number
  diskUsage: number
  uptime: number
  systemStatus: "healthy" | "warning" | "error"
}

// 성능 메트릭
export interface PerformanceMetrics {
  averageResponseTime: number
  averageFetchTime: number
  requestCount: number
  totalRequests: number
  errorRate: number
  errorCount: number
  cacheHitRate: number
  memoryUsage: number
  cpuUsage: number
  serverLoad: number
  diskUsage: number
  activeUsers: number
}

// 관리자 대시보드 데이터
export interface AdminDashboardData {
  stats: SystemStats
  recentActivities: AdminActivity[]
  systemHealth: SystemHealth
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
  performanceMonitoring: {
    enabled: boolean
    refreshInterval: number
    alertThreshold: number
  }
  systemNotifications: {
    email: boolean
    slack: boolean
    webhook: string
  }
  security: {
    sessionTimeout: number
    maxLoginAttempts: number
    requireMFA: boolean
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
