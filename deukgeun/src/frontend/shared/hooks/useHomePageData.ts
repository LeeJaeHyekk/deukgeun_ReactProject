// ============================================================================
// useHomePageData: 완전한 React Hook
// ============================================================================

import { useEffect, useRef, useCallback } from "react"
import { useAppDispatch, useAppSelector } from "@frontend/shared/store/hooks"
import { fetchPlatformStats, fetchUserStats, clearUserStats } from "@frontend/shared/store/homeSlice"
import { useAuthRedux } from './useAuthRedux'
import { useLevel } from './useLevel'
import { useHomePageConfig } from './useHomePageConfig'
import { logger } from "@frontend/shared/utils/logger"
import { validateStats } from "@frontend/pages/HomePage/utils"

export const useHomePageData = () => {
  const dispatch = useAppDispatch()
  const { user, isLoggedIn: isAuthenticated } = useAuthRedux()
  const { levelProgress, isLoading: levelLoading } = useLevel()
  const { config: homePageConfig, isLoading: configLoading } = useHomePageConfig()
  
  const { userStats, platformStats, loading, error, lastFetchedAt } = useAppSelector(
    (state) => state.home
  )

  // 이전 사용자 ID 추적을 위한 ref
  const previousUserIdRef = useRef<number | null>(null)
  const forceFetchRef = useRef<boolean>(false)

  // 강제 fetch 함수
  const forceFetchData = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      logger.debug("[useHomePageData] 인증되지 않음 → fetch 스킵", `isAuthenticated: ${isAuthenticated}, userId: ${user?.id}`)
      return
    }

    logger.info("[useHomePageData] 강제 데이터 fetch 시작", `userId: ${user.id}`)
    
    try {
      // 캐시 무시하고 강제 fetch (clearUserStats로 캐시 초기화 후 fetch)
      await Promise.all([
        dispatch(fetchUserStats()),
        dispatch(fetchPlatformStats())
      ])
      forceFetchRef.current = false
    } catch (error) {
      logger.error("[useHomePageData] 강제 fetch 실패", String(error))
    }
  }, [dispatch, isAuthenticated, user?.id])

  useEffect(() => {
    logger.info("[useHomePageData] 실행", 
      `isAuthenticated: ${isAuthenticated}, userStats: ${!!userStats}, platformStats: ${!!platformStats}, loading: ${loading}, userId: ${user?.id}`
    )

    // 사용자 변경 감지 및 캐시 초기화
    if (isAuthenticated && user?.id && previousUserIdRef.current !== user.id) {
      logger.info("[useHomePageData] 사용자 변경 감지", 
        `previousUserId: ${previousUserIdRef.current}, currentUserId: ${user.id}`
      )
      
      // 이전 사용자 데이터 초기화
      dispatch(clearUserStats())
      previousUserIdRef.current = user.id
      forceFetchRef.current = true
    }

    // 인증되지 않은 경우
    if (!isAuthenticated) {
      previousUserIdRef.current = null
      return
    }

    // 사용자 변경으로 인한 강제 fetch
    if (forceFetchRef.current) {
      forceFetchData()
      return
    }

    // 이미 캐시된 경우 스킵
    if (userStats && platformStats) {
      logger.debug("[useHomePageData] 데이터 존재 → 스킵", "")
      return
    }

    // 일반적인 데이터 fetch (인증된 경우에만)
    if (isAuthenticated && !userStats && !loading) dispatch(fetchUserStats())
    if (!platformStats && !loading) dispatch(fetchPlatformStats())
  }, [isAuthenticated, user?.id, forceFetchData]) // forceFetchData 의존성 추가

  // 레벨 데이터에서 필요한 값들 추출 (안전한 범위 처리)
  const currentLevel = levelProgress?.level ?? 1
  const rawProgressPercentage = levelProgress?.progressPercentage ?? 0
  const progressPercentage = Math.min(100, Math.max(0, rawProgressPercentage))

  // 기본 통계값
  const defaultStats = {
    activeUsers: 0,
    totalGyms: 0,
    totalPosts: 0,
    achievements: 0
  }

  // 통계 데이터 매핑 (platformStats와 userStats를 올바르게 조합)
  const rawStats = platformStats ? {
    activeUsers: platformStats.totalUsers || 0,
    totalGyms: platformStats.totalGyms || 0,
    totalPosts: platformStats.totalPosts || 0,
    achievements: userStats?.posts || 0
  } : defaultStats

  // 안전한 통계 데이터 검증 및 정규화
  const finalStats = validateStats(rawStats)


  // 통합 로딩 상태 계산 (모든 로딩 상태를 포함)
  const globalLoading = levelLoading || configLoading || loading || forceFetchRef.current
  const isPageLoading = globalLoading

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
    
    // 로딩 상태 (통합)
    isPageLoading,
    levelLoading,
    configLoading,
    userStatsLoading: loading,
    statsLoading: loading,
    
    // 전역 상태
    error,
    hasUserData: !!userStats,
    hasPlatformData: !!platformStats,
  }
}