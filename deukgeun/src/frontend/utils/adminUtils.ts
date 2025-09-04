// 프론트엔드 전용 Admin 유틸리티

import type { User } from '../types/auth/auth.types'
import type { AdminRole, AdminAction } from '../types/admin/admin.types'

// 사용자가 관리자인지 확인하는 함수
export function isAdmin(user?: User | null): boolean {
  return user?.role === 'admin' || user?.role === 'super_admin'
}

// 사용자가 슈퍼 관리자인지 확인하는 함수
export function isSuperAdmin(user?: User | null): boolean {
  return user?.role === 'super_admin'
}

// 사용자가 모더레이터인지 확인하는 함수
export function isModerator(user?: User | null): boolean {
  return user?.role === 'moderator'
}

// 관리자 권한 레벨 확인
export function getAdminLevel(role: string): number {
  switch (role) {
    case 'super_admin':
      return 3
    case 'admin':
      return 2
    case 'moderator':
      return 1
    default:
      return 0
  }
}

// 관리자 접근 권한 검증
export function validateAdminAccess(userRole: AdminRole, requiredRole: AdminRole): boolean {
  const userLevel = getAdminLevel(userRole)
  const requiredLevel = getAdminLevel(requiredRole)
  
  return userLevel >= requiredLevel
}

// 관리자 액션 권한 확인
export function canPerformAction(userRole: AdminRole, action: AdminAction): boolean {
  const userLevel = getAdminLevel(userRole)
  
  switch (action) {
    case 'view_dashboard':
      return userLevel >= 1 // 모더레이터 이상
    case 'manage_users':
      return userLevel >= 2 // 관리자 이상
    case 'manage_content':
      return userLevel >= 1 // 모더레이터 이상
    case 'manage_settings':
      return userLevel >= 3 // 슈퍼 관리자만
    case 'view_logs':
      return userLevel >= 2 // 관리자 이상
    case 'manage_system':
      return userLevel >= 3 // 슈퍼 관리자만
    default:
      return false
  }
}

// 관리자 역할 표시명 가져오기
export function getAdminRoleDisplayName(role: string): string {
  switch (role) {
    case 'super_admin':
      return '최고 관리자'
    case 'admin':
      return '관리자'
    case 'moderator':
      return '운영자'
    default:
      return '일반 사용자'
  }
}

// 관리자 역할 색상 가져오기
export function getAdminRoleColor(role: string): string {
  switch (role) {
    case 'super_admin':
      return '#ff4757' // 빨간색
    case 'admin':
      return '#ffa502' // 주황색
    case 'moderator':
      return '#3742fa' // 파란색
    default:
      return '#747d8c' // 회색
  }
}

// 사용자 상태 확인
export function getUserStatusInfo(user: any) {
  return {
    isActive: user.isActive,
    isEmailVerified: user.isEmailVerified,
    isPhoneVerified: user.isPhoneVerified,
    lastLoginAt: user.lastLoginAt,
    statusText: user.isActive ? '활성' : '비활성',
    statusColor: user.isActive ? '#2ed573' : '#ff4757'
  }
}

// 관리자 메뉴 권한 필터링
export function filterAdminMenuItems(userRole: AdminRole, menuItems: any[]) {
  return menuItems.filter(item => {
    if (!item.requiredRole) return true
    return validateAdminAccess(userRole, item.requiredRole)
  })
}

// 관리자 통계 포맷팅
export function formatAdminStats(stats: any) {
  return {
    totalUsers: stats.totalUsers?.toLocaleString() || '0',
    activeUsers: stats.activeUsers?.toLocaleString() || '0',
    totalPosts: stats.totalPosts?.toLocaleString() || '0',
    totalWorkouts: stats.totalWorkouts?.toLocaleString() || '0',
    systemUptime: formatUptime(stats.systemUptime || 0),
    memoryUsage: `${stats.memoryUsage?.percentage || 0}%`,
    cpuUsage: `${stats.cpuUsage || 0}%`,
    diskUsage: `${stats.diskUsage?.percentage || 0}%`
  }
}

// 업타임 포맷팅
export function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / (24 * 3600))
  const hours = Math.floor((seconds % (24 * 3600)) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  if (days > 0) {
    return `${days}일 ${hours}시간`
  } else if (hours > 0) {
    return `${hours}시간 ${minutes}분`
  } else {
    return `${minutes}분`
  }
}

// 바이트 크기 포맷팅
export function formatBytes(bytes: number): string {
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  if (bytes === 0) return '0 B'
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`
}

// 퍼센티지 색상 가져오기
export function getPercentageColor(percentage: number): string {
  if (percentage >= 90) return '#ff4757' // 빨간색 (위험)
  if (percentage >= 70) return '#ffa502' // 주황색 (경고)
  if (percentage >= 50) return '#f1c40f' // 노란색 (주의)
  return '#2ed573' // 초록색 (정상)
}

// 시스템 상태 아이콘 가져오기
export function getSystemStatusIcon(status: 'healthy' | 'warning' | 'critical'): string {
  switch (status) {
    case 'healthy':
      return '✅'
    case 'warning':
      return '⚠️'
    case 'critical':
      return '🚨'
    default:
      return '❓'
  }
}

// 관리자 액션 로그 포맷팅
export function formatAdminAction(action: string, details: any): string {
  switch (action) {
    case 'user_ban':
      return `사용자 ${details.username} 차단`
    case 'user_unban':
      return `사용자 ${details.username} 차단 해제`
    case 'post_delete':
      return `게시글 "${details.title}" 삭제`
    case 'settings_update':
      return '시스템 설정 변경'
    default:
      return action
  }
}

// 관리자 메뉴를 표시해야 하는지 확인
export function shouldShowAdminMenu(user: User | null): boolean {
  return isAdmin(user)
}

// 관리자 권한 확인
export function hasAdminPermission(user: User | null, permission: string): boolean {
  if (!isAdmin(user)) return false
  
  // 여기에 세부 권한 체크 로직 추가 가능
  return true
}

// 관리자 액션 로깅
export function logAdminAction(action: string, details: Record<string, any> = {}): void {
  console.log(`[Admin Action] ${action}:`, details)
  
  // 실제로는 서버에 로그를 보내거나 로컬 스토리지에 저장
  const logEntry = {
    timestamp: new Date().toISOString(),
    action,
    details,
    userAgent: navigator.userAgent,
  }
  
  // 로컬 스토리지에 임시 저장 (개발용)
  try {
    const logs = JSON.parse(localStorage.getItem('adminLogs') || '[]')
    logs.push(logEntry)
    if (logs.length > 100) logs.shift() // 최대 100개 로그 유지
    localStorage.setItem('adminLogs', JSON.stringify(logs))
  } catch (error) {
    console.error('Failed to save admin log:', error)
  }
}
