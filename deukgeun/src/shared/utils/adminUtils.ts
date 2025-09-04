// ============================================================================
// 관리자 관련 유틸리티 함수들
// ============================================================================

import { User } from "../../frontend/types/auth/auth.types"

// 사용자가 관리자인지 확인
export function isAdmin(user: User | null): boolean {
  return user?.role === 'admin'
}

// 관리자 메뉴를 표시해야 하는지 확인
export function shouldShowAdminMenu(user: User | null): boolean {
  return isAdmin(user)
}

// 관리자 권한이 필요한 작업인지 확인
export function requiresAdminPermission(action: string): boolean {
  const adminActions = [
    'user_management',
    'system_settings',
    'database_management',
    'performance_monitoring',
    'content_moderation',
    'analytics_view',
  ]
  return adminActions.includes(action)
}

// 관리자 권한 검증
export function validateAdminPermission(user: User | null, action: string): boolean {
  if (!isAdmin(user)) {
    return false
  }
  
  if (!requiresAdminPermission(action)) {
    return true
  }
  
  // 추가적인 권한 검증 로직을 여기에 구현할 수 있습니다
  return true
}

// 관리자 메뉴 아이템 필터링
export function filterAdminMenuItems(menuItems: any[], user: User | null): any[] {
  if (!shouldShowAdminMenu(user)) {
    return menuItems.filter(item => !item.requiresAdmin)
  }
  return menuItems
}

// 관리자 전용 기능 접근 제어
export function withAdminGuard<T>(
  user: User | null,
  action: () => T,
  fallback: T
): T {
  if (!isAdmin(user)) {
    return fallback
  }
  return action()
}
