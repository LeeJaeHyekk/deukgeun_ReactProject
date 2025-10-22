import { ICON_MAP, SAFETY_LIMITS, DEFAULT_STATS } from './constants'
import type { Stats, IconName } from './types'

/**
 * 숫자를 포맷팅하여 표시 (예: 1500 -> 1.5K+)
 */
export const formatNumber = (num: number | undefined | null): string => {
  // undefined, null, NaN 처리
  if (num == null || isNaN(num)) {
    return '0'
  }
  
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M+`
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K+`
  } else {
    return `${Math.floor(num)}+`
  }
}

/**
 * 통계 데이터 검증 및 정규화 (안정화된 함수)
 */
export const validateStats = (stats: any): Stats => {
  try {
    // 입력이 없거나 null인 경우 기본값 반환
    if (!stats) return DEFAULT_STATS
    
    const validatedStats = {
      activeUsers: typeof stats?.activeUsers === 'number' && 
        stats.activeUsers >= SAFETY_LIMITS.MIN_STATS_VALUE && 
        stats.activeUsers <= SAFETY_LIMITS.MAX_STATS_VALUE 
        ? Math.floor(stats.activeUsers) : DEFAULT_STATS.activeUsers,
      totalGyms: typeof stats?.totalGyms === 'number' && 
        stats.totalGyms >= SAFETY_LIMITS.MIN_STATS_VALUE && 
        stats.totalGyms <= SAFETY_LIMITS.MAX_STATS_VALUE 
        ? Math.floor(stats.totalGyms) : DEFAULT_STATS.totalGyms,
      totalPosts: typeof stats?.totalPosts === 'number' && 
        stats.totalPosts >= SAFETY_LIMITS.MIN_STATS_VALUE && 
        stats.totalPosts <= SAFETY_LIMITS.MAX_STATS_VALUE 
        ? Math.floor(stats.totalPosts) : DEFAULT_STATS.totalPosts,
      achievements: typeof stats?.achievements === 'number' && 
        stats.achievements >= SAFETY_LIMITS.MIN_STATS_VALUE && 
        stats.achievements <= SAFETY_LIMITS.MAX_STATS_VALUE 
        ? Math.floor(stats.achievements) : DEFAULT_STATS.achievements,
    }
    
    return validatedStats
  } catch (error) {
    console.error('Stats validation error:', error)
    return DEFAULT_STATS
  }
}

/**
 * 아이콘 컴포넌트 가져오기
 */
export const getIconComponent = (iconName: string) => {
  return ICON_MAP[iconName as IconName] || ICON_MAP.MapPin
}

/**
 * 통계값에 올림 처리 적용 (안정화된 함수)
 */
export const applyCeilingToStats = (stats: Stats): Stats => {
  // 입력이 없거나 null인 경우 기본값 반환
  if (!stats) return DEFAULT_STATS
  
  return {
    activeUsers: Math.ceil(stats.activeUsers),
    totalGyms: Math.ceil(stats.totalGyms),
    totalPosts: Math.ceil(stats.totalPosts),
    achievements: Math.ceil(stats.achievements),
  }
}

/**
 * 로딩 상태 계산
 */
export const calculateLoadingState = (
  levelLoading: boolean,
  configLoading: boolean,
  userStatsLoading: boolean,
  statsLoading: boolean
): boolean => {
  return levelLoading || configLoading || userStatsLoading || statsLoading
}

/**
 * 에러 메시지 생성
 */
export const createErrorMessage = (errorType: keyof typeof import('./constants').ERROR_MESSAGES): string => {
  // 동적 import 대신 정적 import 사용
  const { ERROR_MESSAGES } = require('./constants')
  return ERROR_MESSAGES[errorType]
}
