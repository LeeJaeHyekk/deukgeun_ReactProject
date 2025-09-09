// ============================================================================
// Admin Utilities
// ============================================================================

import type {
  AdminRole,
  AdminMenuItem,
  SystemStats,
  PerformanceMetrics,
} from "../types"

// 관리자 권한 확인 함수들
export function isAdmin(role: AdminRole): boolean {
  return role === "admin"
}

export function isModeratorOrHigher(role: AdminRole): boolean {
  return role === "admin" || role === "moderator"
}

export function hasRoleOrHigher(
  userRole: AdminRole,
  requiredRole: AdminRole
): boolean {
  const roleHierarchy: Record<AdminRole, number> = {
    user: 1,
    moderator: 2,
    admin: 3,
  }

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

// 관리자 메뉴 필터링
export function filterAdminMenuItems(
  menuItems: AdminMenuItem[],
  userRole: AdminRole
): AdminMenuItem[] {
  return menuItems.filter(item => hasRoleOrHigher(userRole, item.requiredRole))
}

// 시스템 상태 평가
export function evaluateSystemHealth(
  stats: SystemStats
): "healthy" | "warning" | "error" {
  const { memoryUsage, diskUsage } = stats

  if (memoryUsage.percentage > 90 || diskUsage.percentage > 95) {
    return "error"
  }

  if (memoryUsage.percentage > 75 || diskUsage.percentage > 85) {
    return "warning"
  }

  return "healthy"
}

// 성능 메트릭 평가
export function evaluatePerformance(
  metrics: PerformanceMetrics
): "good" | "fair" | "poor" {
  const { responseTime, errorRate, cacheHitRate } = metrics

  if (responseTime.average < 200 && errorRate.percentage < 1 && cacheHitRate > 80) {
    return "good"
  }

  if (responseTime.average < 500 && errorRate.percentage < 5 && cacheHitRate > 60) {
    return "fair"
  }

  return "poor"
}

// 시간 포맷팅
export function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (days > 0) {
    return `${days}일 ${hours}시간 ${minutes}분`
  }

  if (hours > 0) {
    return `${hours}시간 ${minutes}분`
  }

  return `${minutes}분`
}

export function formatBytes(bytes: number): string {
  const sizes = ["B", "KB", "MB", "GB", "TB"]
  if (bytes === 0) return "0 B"

  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`
}

// 색상 유틸리티
export function getStatusColor(
  status: "healthy" | "warning" | "error"
): string {
  switch (status) {
    case "healthy":
      return "#10b981" // green-500
    case "warning":
      return "#f59e0b" // amber-500
    case "error":
      return "#ef4444" // red-500
    default:
      return "#6b7280" // gray-500
  }
}

export function getStatusText(status: "healthy" | "warning" | "error"): string {
  switch (status) {
    case "healthy":
      return "정상"
    case "warning":
      return "주의"
    case "error":
      return "오류"
    default:
      return "알 수 없음"
  }
}

export function getPerformanceColor(
  performance: "good" | "fair" | "poor"
): string {
  switch (performance) {
    case "good":
      return "#10b981" // green-500
    case "fair":
      return "#f59e0b" // amber-500
    case "poor":
      return "#ef4444" // red-500
    default:
      return "#6b7280" // gray-500
  }
}

// 로깅 유틸리티
export function logAdminAction(
  action: string,
  details: Record<string, any>,
  userId?: string
): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    action,
    details,
    userId,
    userAgent: navigator.userAgent,
  }

  console.log("🔧 Admin Action:", logEntry)

  // 실제 프로덕션에서는 서버로 로그를 전송
  if (import.meta.env.PROD) {
    // TODO: 서버 로그 API 호출
  }
}

// 보안 유틸리티
export function validateAdminAccess(
  userRole: AdminRole,
  requiredRole: AdminRole
): boolean {
  if (!hasRoleOrHigher(userRole, requiredRole)) {
    logAdminAction("unauthorized_access_attempt", {
      userRole,
      requiredRole,
      timestamp: new Date().toISOString(),
    })
    return false
  }

  return true
}

// 설정 유틸리티
export function getDefaultAdminSettings() {
  return {
    performanceMonitoring: {
      enabled: true,
      refreshInterval: 30000, // 30초
      alertThreshold: 80,
    },
    systemNotifications: {
      email: false,
      slack: false,
      webhook: "",
    },
    security: {
      sessionTimeout: 3600000, // 1시간
      maxLoginAttempts: 5,
      requireMFA: false,
    },
  }
}

// 데이터 검증
export function validateSystemStats(stats: any): stats is SystemStats {
  return (
    typeof stats === "object" &&
    typeof stats.totalUsers === "number" &&
    typeof stats.activeUsers === "number" &&
    typeof stats.totalMachines === "number" &&
    typeof stats.systemLoad === "number" &&
    typeof stats.memoryUsage === "number" &&
    typeof stats.diskUsage === "number" &&
    typeof stats.uptime === "number"
  )
}

export function validatePerformanceMetrics(
  metrics: any
): metrics is PerformanceMetrics {
  return (
    typeof metrics === "object" &&
    typeof metrics.averageResponseTime === "number" &&
    typeof metrics.requestCount === "number" &&
    typeof metrics.errorRate === "number" &&
    typeof metrics.cacheHitRate === "number" &&
    typeof metrics.memoryUsage === "number" &&
    typeof metrics.cpuUsage === "number"
  )
}
