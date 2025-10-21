import { useMemo, useCallback } from 'react'
import { useAuthRedux } from '@frontend/shared/hooks/useAuthRedux'
import { useLevel } from '@frontend/shared/hooks/useLevel'
import { useStats } from '@frontend/shared/hooks/useStats'
import { useHomePageConfig } from '@frontend/shared/hooks/useHomePageConfig'
import { useUserStats } from '@frontend/shared/hooks/useUserStats'
import { validateStats, applyCeilingToStats, calculateLoadingState } from '../utils'
import { DEFAULT_STATS } from '../constants'

/**
 * 홈페이지 데이터 관리 훅
 */
export const useHomePageData = () => {
  const { user, isLoggedIn: isAuthenticated } = useAuthRedux()
  const { levelProgress, isLoading: levelLoading } = useLevel()
  const { config: homePageConfig, isLoading: configLoading } = useHomePageConfig()
  const { userStats, isLoading: userStatsLoading } = useUserStats()
  const { stats, isLoading: statsLoading } = useStats()

  // 레벨 데이터에서 필요한 값들 추출
  const currentLevel = levelProgress?.level ?? 1
  const progressPercentage = levelProgress?.progressPercentage ?? 0

  // 기본 통계값 (메모이제이션)
  const defaultStats = useMemo(() => DEFAULT_STATS, [])

  // 통계 데이터 검증 및 기본값 처리
  const displayStats = useMemo(() => {
    if (!stats) return defaultStats
    return validateStats(stats)
  }, [stats, defaultStats])

  // 실제 표시할 통계값 (올림 처리) - 메모이제이션
  const finalStats = useMemo(() => applyCeilingToStats(displayStats), [displayStats])

  // 전체 로딩 상태 계산
  const isPageLoading = useMemo(() => 
    calculateLoadingState(levelLoading, configLoading, userStatsLoading, statsLoading),
    [levelLoading, configLoading, userStatsLoading, statsLoading]
  )

  return {
    // 사용자 정보
    user,
    isAuthenticated,
    
    // 레벨 정보
    currentLevel,
    progressPercentage,
    
    // 통계 정보
    finalStats,
    userStats,
    
    // 설정 정보
    homePageConfig,
    
    // 로딩 상태
    isPageLoading,
    levelLoading,
    configLoading,
    userStatsLoading,
    statsLoading,
  }
}
