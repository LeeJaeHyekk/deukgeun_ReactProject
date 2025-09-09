// 관리자 권한 관련 유틸리티 함수들

export interface ValidationRule {
  required?: boolean
  type?: string
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: any) => boolean
}

export interface ValidationRules {
  [key: string]: ValidationRule
}

// 관리자 역할 순서 (권한 레벨)
export const ADMIN_ROLE_ORDER = ['admin', 'moderator', 'super_admin'] as const

export type AdminRole = typeof ADMIN_ROLE_ORDER[number]

// 관리자 권한 체크 함수
export function isAdmin(userRole: string): boolean {
  return ADMIN_ROLE_ORDER.includes(userRole as AdminRole)
}

export function isSuperAdmin(userRole: string): boolean {
  return userRole === 'super_admin'
}

export function isModerator(userRole: string): boolean {
  return userRole === 'moderator' || userRole === 'super_admin'
}

// 권한 레벨 비교
export function hasHigherRole(role1: string, role2: string): boolean {
  const index1 = ADMIN_ROLE_ORDER.indexOf(role1 as AdminRole)
  const index2 = ADMIN_ROLE_ORDER.indexOf(role2 as AdminRole)
  
  if (index1 === -1 || index2 === -1) return false
  return index1 > index2
}

// 관리자 접근 권한 검증
export function validateAdminAccess(userRole: string): boolean {
  return isAdmin(userRole)
}

// 관리자 액션 로깅
export function logAdminAction(action: string, details: any): void {
  console.log(`Admin Action: ${action}`, details)
}

// 관리자 메뉴 표시 여부 체크
export function shouldShowAdminMenu(userRole: string): boolean {
  return isAdmin(userRole)
}

// 데이터 유효성 검사
export function validateData(data: Record<string, any>, rules: ValidationRules): string[] {
  const errors: string[] = []
  
  for (const [field, value] of Object.entries(data)) {
    const fieldRules = rules[field]
    if (!fieldRules) continue
    
    const fieldErrors = validateField(field, value, fieldRules)
    errors.push(...fieldErrors)
  }
  
  return errors
}

// 개별 필드 유효성 검사
export function validateField(field: string, value: any, rules: ValidationRule): string[] {
  const errors: string[] = []
  
  // 필수 필드 체크
  if (rules.required && (!value || value === "")) {
    errors.push(`${field}는 필수 입력 항목입니다`)
    return errors
  }
  
  // 타입 체크
  if (rules.type && typeof value !== rules.type) {
    errors.push(`${field}는 ${rules.type} 타입이어야 합니다`)
  }
  
  // 길이 체크
  if (rules.minLength && value && value.length < rules.minLength) {
    errors.push(`${field}는 최소 ${rules.minLength}자 이상이어야 합니다`)
  }
  
  if (rules.maxLength && value && value.length > rules.maxLength) {
    errors.push(`${field}는 최대 ${rules.maxLength}자까지 가능합니다`)
  }
  
  // 패턴 체크
  if (rules.pattern && value && !rules.pattern.test(value)) {
    errors.push(`${field}의 형식이 올바르지 않습니다`)
  }
  
  // 커스텀 검증
  if (rules.custom && !rules.custom(value)) {
    errors.push(`${field}의 값이 유효하지 않습니다`)
  }
  
  return errors
}

// 관리자 페이지 접근 권한 체크
export function canAccessAdminPage(userRole: string, pageRole: AdminRole): boolean {
  if (!isAdmin(userRole)) return false
  
  const userIndex = ADMIN_ROLE_ORDER.indexOf(userRole as AdminRole)
  const pageIndex = ADMIN_ROLE_ORDER.indexOf(pageRole)
  
  return userIndex >= pageIndex
}

// 사용자 역할별 허용된 액션
export function getAllowedActions(userRole: string): string[] {
  const actions: string[] = []
  
  if (isAdmin(userRole)) {
    actions.push('read', 'create', 'update')
  }
  
  if (isModerator(userRole)) {
    actions.push('moderate', 'delete')
  }
  
  if (isSuperAdmin(userRole)) {
    actions.push('admin', 'system')
  }
  
  return actions
}

// 관리자 대시보드 통계 데이터 포맷팅
export function formatAdminStats(stats: any): any {
  return {
    totalUsers: stats.totalUsers || 0,
    activeUsers: stats.activeUsers || 0,
    totalPosts: stats.totalPosts || 0,
    totalMachines: stats.totalMachines || 0,
    totalGyms: stats.totalGyms || 0,
    systemHealth: stats.systemHealth || 'healthy',
    lastUpdated: new Date().toISOString()
  }
}

// 관리자 로그 포맷팅
export function formatAdminLog(action: string, target: string, user: string): string {
  const timestamp = new Date().toISOString()
  return `[${timestamp}] ${user} performed ${action} on ${target}`
}

// 관리자 알림 생성
export function createAdminNotification(
  type: 'info' | 'warning' | 'error' | 'success',
  message: string,
  details?: any
): any {
  return {
    id: Date.now().toString(),
    type,
    message,
    details,
    timestamp: new Date().toISOString(),
    read: false
  }
}
