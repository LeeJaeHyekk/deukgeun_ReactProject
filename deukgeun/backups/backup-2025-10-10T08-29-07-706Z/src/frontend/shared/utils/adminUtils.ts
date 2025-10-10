// ============================================================================
// 관리자 권한 유틸리티
// ============================================================================

import type { User, UserRole } from "../../../shared/types"

/**
 * 사용자가 관리자인지 확인
 * @param user - 확인할 사용자 객체
 * @returns 관리자 여부
 */
function isAdmin(user: User | null): boolean {
  return user?.role === "admin"
}

/**
 * 사용자가 모더레이터 이상인지 확인
 * @param user - 확인할 사용자 객체
 * @returns 모더레이터 이상 여부
 */
function isModeratorOrHigher(user: User | null): boolean {
  return user?.role === "admin" || user?.role === "moderator"
}

/**
 * 사용자 역할이 특정 역할 이상인지 확인
 * @param user - 확인할 사용자 객체
 * @param requiredRole - 필요한 최소 역할
 * @returns 권한 충족 여부
 */
function hasRoleOrHigher(
  user: User | null,
  requiredRole: UserRole
): boolean {
  if (!user) return false

  const roleHierarchy: Record<UserRole, number> = {
    user: 1,
    moderator: 2,
    admin: 3,
  }

  const userRoleLevel = roleHierarchy[user.role as UserRole] || 0
  const requiredRoleLevel = roleHierarchy[requiredRole as UserRole] || 0

  return userRoleLevel >= requiredRoleLevel
}

/**
 * 관리자 전용 기능 접근 권한 확인
 * @param user - 확인할 사용자 객체
 * @returns 관리자 접근 권한 여부
 */
function canAccessAdminFeatures(user: User | null): boolean {
  return isAdmin(user)
}

/**
 * 관리자 메뉴 표시 여부 확인
 * @param user - 확인할 사용자 객체
 * @returns 관리자 메뉴 표시 여부
 */
function shouldShowAdminMenu(user: User | null): boolean {
  return isAdmin(user)
}

// Export all functions
export {
  isAdmin,
  isModeratorOrHigher,
  hasRoleOrHigher,
  canAccessAdminFeatures,
  shouldShowAdminMenu,
}