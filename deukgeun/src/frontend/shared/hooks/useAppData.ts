import { useEffect, useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { 
  initializeApp, 
  fetchUserStats, 
  fetchDetailedStats,
  clearError,
  invalidateCache
} from '../store/appSlice'
import { fetchPlatformStats } from '../store/homeSlice'
import { useAuthRedux } from './useAuthRedux'
import { logger } from '../utils/logger'
import { withRequestManagement, autoReconnectManager, stateSafetyManager } from '../utils/apiRequestManager'

// ============================================================================
// 통합 앱 데이터 훅
// ============================================================================

export function useAppData() {
  const dispatch = useAppDispatch()
  const appState = useAppSelector((state: any) => state.app)

  // 앱 초기화 (단순화) - 메모이제이션된 셀렉터 사용
  const isInitialized = useAppSelector((state: any) => state.app.isInitialized)
  const isLoading = useAppSelector((state: any) => state.app.isLoading)
  
  useEffect(() => {
    if (!isInitialized && !isLoading) {
      logger.info('APP_DATA', '앱 데이터 초기화 시작')
      dispatch(initializeApp())
    }
  }, [dispatch, isInitialized, isLoading])

  // 에러 처리
  const handleError = () => {
    if (appState.error) {
      logger.error('APP_DATA', '앱 데이터 에러', appState.error)
      dispatch(clearError())
    }
  }

  // 안전한 데이터 새로고침
  const refreshData = useCallback(async (type?: 'platform' | 'user' | 'detailed') => {
    logger.info('APP_DATA', '데이터 새로고침 시작', { type })
    
    const refreshPromises: Promise<any>[] = []
    
    if (!type || type === 'platform') {
      const requestKey = 'platform-stats-refresh'
      
      if (!stateSafetyManager.getLoading(requestKey)) {
        refreshPromises.push(
          withRequestManagement(
            async () => {
              dispatch(invalidateCache('platformStats'))
              await dispatch(fetchPlatformStats()).unwrap()
              logger.info('APP_DATA', '플랫폼 통계 새로고침 완료')
            },
            {
              key: requestKey,
              cooldownMs: 5000,
              onSuccess: () => {
                stateSafetyManager.setLoading(requestKey, false)
              },
              onError: (error) => {
                logger.error('APP_DATA', '플랫폼 통계 새로고침 실패', { error: error?.message })
                stateSafetyManager.setError(requestKey, error?.message || '플랫폼 통계 새로고침 실패')
                stateSafetyManager.setLoading(requestKey, false)
              }
            }
          )
        )
      }
    }
    
    if (!type || type === 'user') {
      const requestKey = 'user-stats-refresh'
      
      if (!stateSafetyManager.getLoading(requestKey)) {
        refreshPromises.push(
          withRequestManagement(
            async () => {
              dispatch(invalidateCache('userStats'))
              await dispatch(fetchUserStats()).unwrap()
              logger.info('APP_DATA', '사용자 통계 새로고침 완료')
            },
            {
              key: requestKey,
              cooldownMs: 5000,
              onSuccess: () => {
                stateSafetyManager.setLoading(requestKey, false)
              },
              onError: (error) => {
                logger.error('APP_DATA', '사용자 통계 새로고침 실패', { error: error?.message })
                stateSafetyManager.setError(requestKey, error?.message || '사용자 통계 새로고침 실패')
                stateSafetyManager.setLoading(requestKey, false)
              }
            }
          )
        )
      }
    }
    
    if (!type || type === 'detailed') {
      const requestKey = 'detailed-stats-refresh'
      
      if (!stateSafetyManager.getLoading(requestKey)) {
        refreshPromises.push(
          withRequestManagement(
            async () => {
              dispatch(invalidateCache('detailedStats'))
              await dispatch(fetchDetailedStats()).unwrap()
              logger.info('APP_DATA', '상세 통계 새로고침 완료')
            },
            {
              key: requestKey,
              cooldownMs: 5000,
              onSuccess: () => {
                stateSafetyManager.setLoading(requestKey, false)
              },
              onError: (error) => {
                logger.error('APP_DATA', '상세 통계 새로고침 실패', { error: error?.message })
                stateSafetyManager.setError(requestKey, error?.message || '상세 통계 새로고침 실패')
                stateSafetyManager.setLoading(requestKey, false)
              }
            }
          )
        )
      }
    }
    
    // 모든 새로고침 작업 병렬 실행
    try {
      await Promise.allSettled(refreshPromises)
      logger.info('APP_DATA', '데이터 새로고침 완료', { type })
    } catch (error) {
      logger.error('APP_DATA', '데이터 새로고침 중 오류', { error: error instanceof Error ? error.message : String(error) })
    }
  }, [dispatch])

  return {
    // 상태
    isLoading: appState.isLoading,
    isInitialized: appState.isInitialized,
    error: appState.error,
    lastError: appState.lastError,
    lastUpdated: appState.lastUpdated,
    
    // 데이터
    platformStats: appState.platformStats,
    userStats: appState.userStats,
    detailedStats: appState.detailedStats,
    
    // 캐시 상태
    cacheStatus: appState.cacheStatus,
    
    // 액션
    refreshData,
    handleError,
    clearError: () => dispatch(clearError())
  }
}

// ============================================================================
// 개별 데이터 훅들 (기존 호환성 유지)
// ============================================================================

export function usePlatformStats() {
  const dispatch = useAppDispatch()
  const { platformStats, isLoading, error } = useAppSelector((state: any) => state.app)

  const refreshStats = () => {
    dispatch(invalidateCache('platformStats'))
    dispatch(fetchPlatformStats())
  }

  return {
    stats: platformStats,
    isLoading,
    error,
    refresh: refreshStats
  }
}

export function useUserStatsData() {
  const dispatch = useAppDispatch()
  const { user, isLoggedIn } = useAuthRedux()
  const { userStats, isLoading, error } = useAppSelector((state: any) => state.app)

  // 안전한 통계 새로고침
  const refreshStats = useCallback(async () => {
    if (!isLoggedIn || !user) {
      logger.debug('USER_STATS', '로그인되지 않은 사용자 - 새로고침 스킵')
      return
    }

    const requestKey = `user-stats-${user.id}`
    
    // 상태 안전장치 확인
    if (stateSafetyManager.getLoading(requestKey)) {
      logger.debug('USER_STATS', '이미 로딩 중인 요청', { requestKey })
      return
    }

    // 비활성 상태 확인
    if (stateSafetyManager.isInactive(requestKey)) {
      logger.debug('USER_STATS', '비활성 상태 - 요청 스킵', { requestKey })
      return
    }

    // 요청 관리자를 통한 안전한 요청
    const result = await withRequestManagement(
      async () => {
        logger.debug('USER_STATS', '사용자 통계 새로고침 시작', { userId: user.id })
        dispatch(invalidateCache('userStats'))
        await dispatch(fetchUserStats()).unwrap()
        logger.info('USER_STATS', '사용자 통계 새로고침 완료', { userId: user.id })
      },
      {
        key: requestKey,
        cooldownMs: 5000,
        onSuccess: () => {
          stateSafetyManager.setLoading(requestKey, false)
        },
        onError: (error) => {
          logger.error('USER_STATS', '사용자 통계 새로고침 실패', { userId: user.id, error: error?.message })
          stateSafetyManager.setError(requestKey, error?.message || '사용자 통계 새로고침 실패')
          stateSafetyManager.setLoading(requestKey, false)
        },
        onRetry: (retryCount) => {
          logger.info('USER_STATS', '사용자 통계 새로고침 재시도', { userId: user.id, retryCount })
          stateSafetyManager.setLoading(requestKey, true)
        }
      }
    )

    if (result) {
      logger.info('USER_STATS', '사용자 통계 새로고침 성공', { userId: user.id })
    }
  }, [dispatch, isLoggedIn, user])

  return {
    userStats,
    isLoading,
    error,
    refresh: refreshStats
  }
}

export function useDetailedStats() {
  const dispatch = useAppDispatch()
  const { detailedStats, isLoading, error } = useAppSelector((state: any) => state.app)

  const refreshStats = () => {
    dispatch(invalidateCache('detailedStats'))
    dispatch(fetchDetailedStats())
  }

  return {
    detailedStats,
    isLoading,
    error,
    refresh: refreshStats
  }
}
