// ============================================================================
// Frontend 관리자 유틸리티
// ============================================================================

import type { AdminRole } from "../types/admin/admin.types"

// 관리자 권한 체크
export const isAdmin = (userRole: string): boolean => {
  return userRole === "admin" || userRole === "super_admin"
}

// 관리자 페이지 접근 권한 체크
export const canAccessAdminPage = (userRole: string, page: string): boolean => {
  if (!isAdmin(userRole)) return false

  // 특정 페이지별 권한 체크
  const adminPages = {
    dashboard: ["admin", "super_admin"],
    users: ["admin", "super_admin"],
    posts: ["admin", "super_admin"],
    machines: ["admin", "super_admin"],
    gyms: ["admin", "super_admin"],
    stats: ["admin", "super_admin"],
    performance: ["super_admin"],
    database_update: ["super_admin"],
  }

  const allowedRoles = adminPages[page as keyof typeof adminPages]
  return allowedRoles ? allowedRoles.includes(userRole) : false
}

// 관리자 액션 권한 체크
export const canPerformAdminAction = (
  userRole: string,
  action: string
): boolean => {
  if (!isAdmin(userRole)) return false

  const adminActions = {
    view_users: ["admin", "super_admin"],
    edit_users: ["admin", "super_admin"],
    delete_users: ["super_admin"],
    view_posts: ["admin", "super_admin"],
    edit_posts: ["admin", "super_admin"],
    delete_posts: ["admin", "super_admin"],
    view_machines: ["admin", "super_admin"],
    edit_machines: ["admin", "super_admin"],
    delete_machines: ["super_admin"],
    view_gyms: ["admin", "super_admin"],
    edit_gyms: ["admin", "super_admin"],
    delete_gyms: ["super_admin"],
    view_stats: ["admin", "super_admin"],
    view_performance: ["super_admin"],
    database_update: ["super_admin"],
  }

  const allowedRoles = adminActions[action as keyof typeof adminActions]
  return allowedRoles ? allowedRoles.includes(userRole) : false
}

// 관리자 메뉴 필터링
export const filterAdminMenu = (userRole: string, menuItems: any[]): any[] => {
  return menuItems.filter(item => {
    if (item.requiredRole) {
      return canAccessAdminPage(userRole, item.requiredRole)
    }
    return true
  })
}

// 관리자 액션 버튼 필터링
export const filterAdminActions = (userRole: string, actions: any[]): any[] => {
  return actions.filter(action => {
    if (action.requiredPermission) {
      return canPerformAdminAction(userRole, action.requiredPermission)
    }
    return true
  })
}

// 관리자 로그 포맷팅
export const formatAdminLog = (
  action: string,
  target: string,
  details?: any
): string => {
  const timestamp = new Date().toISOString()
  const logEntry = {
    timestamp,
    action,
    target,
    details,
  }
  return JSON.stringify(logEntry)
}

// 관리자 통계 계산
export const calculateAdminStats = (data: any[]): any => {
  return {
    total: data.length,
    active: data.filter(item => item.status === "active").length,
    inactive: data.filter(item => item.status === "inactive").length,
    pending: data.filter(item => item.status === "pending").length,
  }
}

// 관리자 데이터 검증
export const validateAdminData = (
  data: any,
  schema: any
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []

  // 기본 검증 로직
  if (!data) {
    errors.push("데이터가 없습니다")
    return { isValid: false, errors }
  }

  // 스키마 기반 검증
  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field]

    if (rules.required && (!value || value === "")) {
      errors.push(`${field}는 필수 항목입니다`)
    }

    if (rules.type && typeof value !== rules.type) {
      errors.push(`${field}의 타입이 올바르지 않습니다`)
    }

    if (rules.minLength && value && value.length < rules.minLength) {
      errors.push(`${field}는 최소 ${rules.minLength}자 이상이어야 합니다`)
    }

    if (rules.maxLength && value && value.length > rules.maxLength) {
      errors.push(`${field}는 최대 ${rules.maxLength}자까지 가능합니다`)
    }
  }

  return { isValid: errors.length === 0, errors }
}

// 관리자 권한 레벨
export const ADMIN_ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  MODERATOR: "moderator",
} as const

// 관리자 권한 레벨 라벨
export const ADMIN_ROLE_LABELS = {
  [ADMIN_ROLES.SUPER_ADMIN]: "슈퍼 관리자",
  [ADMIN_ROLES.ADMIN]: "관리자",
  [ADMIN_ROLES.MODERATOR]: "모더레이터",
} as const

// 관리자 권한 레벨 순서
export const ADMIN_ROLE_ORDER = [
  ADMIN_ROLES.SUPER_ADMIN,
  ADMIN_ROLES.ADMIN,
  ADMIN_ROLES.MODERATOR,
]

// 권한 레벨 비교
export const compareAdminRoles = (role1: string, role2: string): number => {
  const index1 = ADMIN_ROLE_ORDER.indexOf(role1 as AdminRole)
  const index2 = ADMIN_ROLE_ORDER.indexOf(role2 as AdminRole)

  if (index1 === -1 || index2 === -1) return 0

  return index1 - index2
}

// 상위 권한 체크
export const hasHigherRole = (
  userRole: string,
  targetRole: string
): boolean => {
  return compareAdminRoles(userRole, targetRole) < 0
}

// 동일하거나 상위 권한 체크
export const hasEqualOrHigherRole = (
  userRole: string,
  targetRole: string
): boolean => {
  return compareAdminRoles(userRole, targetRole) <= 0
}

export const adminUtils = {
  isAdmin,
  canAccessAdminPage,
  canPerformAdminAction,
  filterAdminMenu,
  filterAdminActions,
  formatAdminLog,
  calculateAdminStats,
  validateAdminData,
  hasHigherRole,
  hasEqualOrHigherRole,
}
